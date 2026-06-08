"use server";

// Server actions for the spare-parts inventory.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function str(form: FormData, key: string): string {
  return (form.get(key) ?? "").toString().trim();
}
function int(form: FormData, key: string): number {
  const n = Number.parseInt(str(form, key), 10);
  return Number.isFinite(n) ? n : 0;
}
function dec(form: FormData, key: string): number {
  const n = Number.parseFloat(str(form, key).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

// Generates the next REPS-### code.
async function nextCode(): Promise<string> {
  const last = await prisma.sparePart.findFirst({
    where: { code: { startsWith: "REPS-" } },
    orderBy: { code: "desc" },
    select: { code: true },
  });
  const n = last ? parseInt(last.code.slice(5), 10) + 1 : 1;
  return `REPS-${String(n).padStart(3, "0")}`;
}

export async function createSparePart(formData: FormData) {
  const name = str(formData, "name");
  const category = str(formData, "category") || "Otro";
  if (!name) return;

  await prisma.sparePart.create({
    data: {
      code: await nextCode(),
      name,
      category,
      priceBs: dec(formData, "priceBs"),
      stock: int(formData, "stock"),
      stockMin: int(formData, "stockMin"),
    },
  });
  revalidatePath("/admin/repuestos");
  revalidatePath("/admin/reportes");
}

// Add units to stock (entrada de repuestos).
export async function restock(formData: FormData) {
  const id = str(formData, "id");
  const amount = int(formData, "amount");
  if (!id || amount === 0) return;

  await prisma.sparePart.update({
    where: { id },
    data: { stock: { increment: amount } },
  });
  revalidatePath("/admin/repuestos");
  revalidatePath("/admin/reportes");
}
