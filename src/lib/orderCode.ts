// Generates the next human-readable order code, e.g. REP-2026-0001.
// Scoped per calendar year; finds the current max suffix and increments.
import type { PrismaClient, Prisma } from "@prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

export async function generateOrderCode(db: Db, date = new Date()): Promise<string> {
  const year = date.getFullYear();
  const prefix = `REP-${year}-`;

  const last = await db.repairOrder.findFirst({
    where: { orderCode: { startsWith: prefix } },
    orderBy: { orderCode: "desc" },
    select: { orderCode: true },
  });

  const lastNum = last ? parseInt(last.orderCode.slice(prefix.length), 10) : 0;
  const next = (Number.isFinite(lastNum) ? lastNum : 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}
