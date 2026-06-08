"use server";

// Server actions for the admin orders area:
//  - updateOrderStatus: change an order's status (+ history, closedAt).
//  - createIntakeOrder: technician registers a walk-in repair at the shop.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateOrderCode } from "@/lib/orderCode";
import { STATUS_ORDER, PRIORITY_ORDER, PAYMENT_METHOD_ORDER } from "@/lib/labels";
import type { RepairStatus, Priority, PaymentMethod } from "@prisma/client";

function str(form: FormData, key: string): string {
  return (form.get(key) ?? "").toString().trim();
}

function num(form: FormData, key: string): number | null {
  const v = str(form, key).replace(",", ".");
  if (!v) return null;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function date(form: FormData, key: string): Date | null {
  const v = str(form, key); // expects yyyy-mm-dd from <input type="date">
  if (!v) return null;
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isStatus(value: string): value is RepairStatus {
  return (STATUS_ORDER as string[]).includes(value);
}

function asPriority(value: string): Priority {
  return (PRIORITY_ORDER as string[]).includes(value)
    ? (value as Priority)
    : "MEDIUM";
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/ordenes");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/equipos");
}

export async function updateOrderStatus(formData: FormData) {
  const orderId = str(formData, "orderId");
  const statusRaw = str(formData, "status");
  const note = str(formData, "note");
  const technicianId = str(formData, "technicianId") || null;

  if (!orderId || !isStatus(statusRaw)) return;
  const status = statusRaw;

  const estimatedCost = num(formData, "estimatedCost");
  const laborCost = num(formData, "laborCost");
  const estimatedReadyAt = date(formData, "estimatedReadyAt");

  await prisma.$transaction(async (tx) => {
    await tx.repairOrder.update({
      where: { id: orderId },
      data: {
        status,
        closedAt:
          status === "DELIVERED" || status === "CANCELLED" ? new Date() : null,
        ...(estimatedCost !== null ? { estimatedCost } : {}),
        ...(laborCost !== null ? { laborCost } : {}),
        ...(estimatedReadyAt !== null ? { estimatedReadyAt } : {}),
      },
    });
    await tx.repairStatusHistory.create({
      data: {
        repairOrderId: orderId,
        status,
        technicianId,
        note: note || "Estado actualizado por administración.",
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/ordenes");
  revalidatePath(`/admin/ordenes/${orderId}`);
}

// Technician registers a repair brought into the shop. Either selects an
// existing customer or creates a new one inline.
export async function createIntakeOrder(formData: FormData) {
  const customerId = str(formData, "customerId"); // "" or "new" → create new
  const description = str(formData, "description");
  const deviceType = str(formData, "deviceType");
  const brand = str(formData, "brand");
  const model = str(formData, "model");
  const newCustomerName = str(formData, "newCustomerName");

  const useExisting = customerId && customerId !== "new";

  // Required: a customer (existing or a new name) + device + problem.
  const missing =
    !description ||
    !deviceType ||
    !brand ||
    !model ||
    (!useExisting && !newCustomerName);
  if (missing) {
    redirect("/admin/ordenes/nueva?error=missing");
  }

  const priority = asPriority(str(formData, "priority"));
  const statusRaw = str(formData, "status");
  const status: RepairStatus = isStatus(statusRaw) ? statusRaw : "NEW";
  const technicianId = str(formData, "technicianId") || null;

  const orderCode = await prisma.$transaction(async (tx) => {
    const code = await generateOrderCode(tx);

    // Resolve the customer id (existing, or create a new customer).
    let resolvedCustomerId: string;
    if (useExisting) {
      resolvedCustomerId = customerId;
    } else {
      const customer = await tx.customer.create({
        data: {
          name: newCustomerName,
          ci: str(formData, "newCustomerCi") || null,
          phone: str(formData, "newCustomerPhone") || null,
          email: str(formData, "newCustomerEmail") || null,
          address: str(formData, "newCustomerAddress") || null,
        },
      });
      resolvedCustomerId = customer.id;
    }

    await tx.device.create({
      data: {
        customerId: resolvedCustomerId,
        type: deviceType,
        brand,
        model,
        serialNumber: str(formData, "serialNumber") || null,
        accessories: str(formData, "accessories") || null,
        repairOrders: {
          create: {
            orderCode: code,
            description,
            priority,
            status,
            estimatedCost: num(formData, "estimatedCost"),
            laborCost: num(formData, "laborCost"),
            estimatedReadyAt: date(formData, "estimatedReadyAt"),
            closedAt: status === "DELIVERED" ? new Date() : null,
            history: {
              create: {
                status,
                technicianId,
                note: "Orden registrada en el taller.",
              },
            },
          },
        },
      },
    });

    return code;
  });

  revalidateAdmin();
  redirect(`/admin/ordenes?nueva=${encodeURIComponent(orderCode)}`);
}

// --- Parts used on an order (detalle de repuestos) ----------------------

// Add a spare part to an order; decrements stock.
export async function addOrderPart(formData: FormData) {
  const orderId = str(formData, "orderId");
  const sparePartId = str(formData, "sparePartId");
  const quantity = Math.max(1, Math.trunc(num(formData, "quantity") ?? 1));
  if (!orderId || !sparePartId) return;

  await prisma.$transaction(async (tx) => {
    const part = await tx.sparePart.findUnique({ where: { id: sparePartId } });
    if (!part) return;
    await tx.orderPart.create({
      data: { repairOrderId: orderId, sparePartId, quantity, unitPriceBs: part.priceBs },
    });
    await tx.sparePart.update({
      where: { id: sparePartId },
      data: { stock: Math.max(0, part.stock - quantity) },
    });
  });

  revalidatePath(`/admin/ordenes/${orderId}`);
  revalidatePath("/admin/repuestos");
}

// Remove a part from an order; returns the units to stock.
export async function removeOrderPart(formData: FormData) {
  const orderId = str(formData, "orderId");
  const orderPartId = str(formData, "orderPartId");
  if (!orderPartId) return;

  await prisma.$transaction(async (tx) => {
    const op = await tx.orderPart.findUnique({ where: { id: orderPartId } });
    if (!op) return;
    await tx.orderPart.delete({ where: { id: orderPartId } });
    await tx.sparePart.update({
      where: { id: op.sparePartId },
      data: { stock: { increment: op.quantity } },
    });
  });

  revalidatePath(`/admin/ordenes/${orderId}`);
  revalidatePath("/admin/repuestos");
}

// --- Payment (pago) -----------------------------------------------------

function asMethod(value: string): PaymentMethod {
  return (PAYMENT_METHOD_ORDER as string[]).includes(value)
    ? (value as PaymentMethod)
    : "CASH";
}

// Register or update the payment for an order. Total is computed server-side
// from labor + parts − discount (never trust a client-sent total).
export async function savePayment(formData: FormData) {
  const orderId = str(formData, "orderId");
  if (!orderId) return;

  const method = asMethod(str(formData, "method"));
  const discountBs = Math.max(0, num(formData, "discountBs") ?? 0);
  const markPaid = str(formData, "status") === "PAID";

  const order = await prisma.repairOrder.findUnique({
    where: { id: orderId },
    include: { parts: true },
  });
  if (!order) return;

  const partsTotal = order.parts.reduce((s, p) => s + p.unitPriceBs * p.quantity, 0);
  const totalBs = Math.max(0, (order.laborCost ?? 0) + partsTotal - discountBs);

  await prisma.payment.upsert({
    where: { repairOrderId: orderId },
    create: {
      repairOrderId: orderId,
      method,
      discountBs,
      totalBs,
      status: markPaid ? "PAID" : "PENDING",
      paidAt: new Date(),
    },
    update: {
      method,
      discountBs,
      totalBs,
      status: markPaid ? "PAID" : "PENDING",
    },
  });

  revalidatePath(`/admin/ordenes/${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/reportes");
}
