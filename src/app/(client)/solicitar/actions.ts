"use server";

// Server action: a customer submits a repair request from the public form.
// Creates Customer + Device + RepairOrder (status NEW) + initial history in
// one transaction, then redirects to the success page with the order code.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateOrderCode } from "@/lib/orderCode";
import type { Priority } from "@prisma/client";

const VALID_PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function str(form: FormData, key: string): string {
  return (form.get(key) ?? "").toString().trim();
}

export async function createOrder(formData: FormData) {
  const customerName = str(formData, "customerName");
  const description = str(formData, "description");
  const deviceType = str(formData, "deviceType");
  const brand = str(formData, "brand");
  const model = str(formData, "model");

  // Minimal required fields. The form also enforces `required` on the client.
  if (!customerName || !description || !deviceType || !brand || !model) {
    redirect("/solicitar?error=missing");
  }

  const priorityRaw = str(formData, "priority").toUpperCase();
  const priority: Priority = VALID_PRIORITIES.includes(priorityRaw as Priority)
    ? (priorityRaw as Priority)
    : "MEDIUM";

  const orderCode = await prisma.$transaction(async (tx) => {
    const code = await generateOrderCode(tx);

    await tx.customer.create({
      data: {
        name: customerName,
        phone: str(formData, "phone") || null,
        email: str(formData, "email") || null,
        address: str(formData, "address") || null,
        devices: {
          create: {
            type: deviceType,
            brand,
            model,
            serialNumber: str(formData, "serialNumber") || null,
            repairOrders: {
              create: {
                orderCode: code,
                description,
                priority,
                status: "NEW",
                history: {
                  create: {
                    status: "NEW",
                    note: "Orden registrada por el cliente en línea.",
                  },
                },
              },
            },
          },
        },
      },
    });

    return code;
  });

  // Refresh the admin views so the new order shows up immediately.
  revalidatePath("/admin");
  revalidatePath("/admin/ordenes");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/equipos");

  redirect(`/solicitar/exito?code=${encodeURIComponent(orderCode)}`);
}
