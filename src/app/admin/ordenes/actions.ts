"use server";

// Server actions for the admin orders area:
//  - updateOrderStatus: change an order's status (+ history, closedAt).
//  - createIntakeOrder: technician registers a walk-in repair at the shop.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateOrderCode } from "@/lib/orderCode";
import { STATUS_ORDER, PRIORITY_ORDER } from "@/lib/labels";
import type { RepairStatus, Priority } from "@prisma/client";

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
  const estimatedReadyAt = date(formData, "estimatedReadyAt");

  await prisma.$transaction(async (tx) => {
    await tx.repairOrder.update({
      where: { id: orderId },
      data: {
        status,
        closedAt: status === "DELIVERED" ? new Date() : null,
        ...(estimatedCost !== null ? { estimatedCost } : {}),
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
        repairOrders: {
          create: {
            orderCode: code,
            description,
            priority,
            status,
            estimatedCost: num(formData, "estimatedCost"),
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
