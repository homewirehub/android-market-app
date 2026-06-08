// Admin: business reports (the ones listed in the academic proposal).
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Table, Th, Td, StatusBadge } from "@/components/ui";
import { formatBs } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const [
    paidAgg,
    pendingAgg,
    pendingOrders,
    partsUsed,
    serviceGroups,
    lowStock,
  ] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { totalBs: true } }),
    prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { totalBs: true } }),
    prisma.repairOrder.findMany({
      where: { status: { notIn: ["DELIVERED", "CANCELLED"] } },
      orderBy: { createdAt: "asc" },
      include: { device: { include: { customer: true } } },
    }),
    prisma.orderPart.groupBy({
      by: ["sparePartId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    }),
    prisma.repairOrder.groupBy({
      by: ["description"],
      _count: { _all: true },
      orderBy: { _count: { description: "desc" } },
      take: 8,
    }),
    prisma.sparePart.findMany({ orderBy: { stock: "asc" } }),
  ]);

  const partNames = new Map(
    (
      await prisma.sparePart.findMany({
        where: { id: { in: partsUsed.map((p) => p.sparePartId) } },
        select: { id: true, name: true },
      })
    ).map((p) => [p.id, p.name]),
  );
  const toRestock = lowStock.filter((p) => p.stock <= p.stockMin);

  const kpis = [
    { label: "Ingresos cobrados", value: formatBs(paidAgg._sum.totalBs ?? 0), accent: true },
    { label: "Ingresos pendientes", value: formatBs(pendingAgg._sum.totalBs ?? 0) },
    { label: "Órdenes pendientes", value: pendingOrders.length },
    { label: "Repuestos por reabastecer", value: toRestock.length },
  ];

  return (
    <div>
      <PageHeader title="Reportes" subtitle="Indicadores del servicio técnico." />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <div
              className={`text-2xl font-semibold tracking-tight ${
                k.accent ? "text-brand-600 dark:text-brand-500" : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
              {k.value}
            </div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{k.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most used parts */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Repuestos más utilizados
          </h2>
          <Table>
            <thead>
              <tr>
                <Th>Repuesto</Th>
                <Th>Unidades usadas</Th>
              </tr>
            </thead>
            <tbody>
              {partsUsed.map((p) => (
                <tr key={p.sparePartId}>
                  <Td>{partNames.get(p.sparePartId) ?? "—"}</Td>
                  <Td className="tabular-nums">{p._sum.quantity ?? 0}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Most requested services */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Servicios más solicitados
          </h2>
          <Table>
            <thead>
              <tr>
                <Th>Servicio / falla</Th>
                <Th>Órdenes</Th>
              </tr>
            </thead>
            <tbody>
              {serviceGroups.map((s) => (
                <tr key={s.description}>
                  <Td>{s.description}</Td>
                  <Td className="tabular-nums">{s._count._all}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Parts to restock */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Repuestos por reabastecer
          </h2>
          <Table>
            <thead>
              <tr>
                <Th>Repuesto</Th>
                <Th>Stock</Th>
                <Th>Mínimo</Th>
              </tr>
            </thead>
            <tbody>
              {toRestock.length === 0 ? (
                <tr>
                  <Td>
                    <span className="text-zinc-500 dark:text-zinc-400">Todo en nivel adecuado.</span>
                  </Td>
                </tr>
              ) : (
                toRestock.map((p) => (
                  <tr key={p.id}>
                    <Td>{p.name}</Td>
                    <Td className="tabular-nums text-red-600 dark:text-red-400">{p.stock}</Td>
                    <Td className="tabular-nums">{p.stockMin}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Pending orders */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Órdenes pendientes
          </h2>
          <Table>
            <thead>
              <tr>
                <Th>Código</Th>
                <Th>Cliente</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((o) => (
                <tr key={o.id}>
                  <Td>
                    <Link
                      href={`/admin/ordenes/${o.id}`}
                      className="font-mono text-xs font-medium text-brand-600 hover:underline dark:text-brand-500"
                    >
                      {o.orderCode}
                    </Link>
                  </Td>
                  <Td>{o.device.customer.name}</Td>
                  <Td>
                    <StatusBadge status={o.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}
