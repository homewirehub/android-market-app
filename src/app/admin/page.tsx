// Admin dashboard: business KPIs + live status breakdown.
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, StatusBadge, LinkButton } from "@/components/ui";
import { STATUS_ORDER, STATUS_DOT, formatBs } from "@/lib/labels";
import { PlusIcon } from "@/components/icons";
import type { RepairStatus } from "@prisma/client";

// Always read fresh from the local DB.
export const dynamic = "force-dynamic";

const ACTIVE_STATUSES: RepairStatus[] = [
  "NEW",
  "DIAGNOSIS",
  "WAITING_FOR_PARTS",
  "REPAIRING",
];

export default async function AdminDashboardPage() {
  const [customers, devices, byStatus, delivered, income] = await Promise.all([
    prisma.customer.count(),
    prisma.device.count(),
    prisma.repairOrder.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.repairOrder.findMany({
      where: { status: "DELIVERED", closedAt: { not: null } },
      select: { createdAt: true, closedAt: true },
    }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { totalBs: true } }),
  ]);

  const statusCounts = new Map<RepairStatus, number>(
    byStatus.map((row) => [row.status, row._count._all]),
  );
  const total = byStatus.reduce((sum, r) => sum + r._count._all, 0);
  const activas = ACTIVE_STATUSES.reduce((s, st) => s + (statusCounts.get(st) ?? 0), 0);
  const completadas =
    (statusCounts.get("COMPLETED") ?? 0) + (statusCounts.get("DELIVERED") ?? 0);

  // Average turnaround (days) over delivered orders.
  const avgDays =
    delivered.length > 0
      ? delivered.reduce(
          (sum, o) => sum + (o.closedAt!.getTime() - o.createdAt.getTime()) / 86_400_000,
          0,
        ) / delivered.length
      : 0;
  const avgDaysLabel = avgDays.toFixed(1).replace(".", ",");

  const kpis = [
    { label: "Clientes registrados", value: customers, href: "/admin/clientes" },
    { label: "Equipos recibidos", value: devices, href: "/admin/equipos" },
    { label: "Reparaciones activas", value: activas, href: "/admin/ordenes", accent: true },
    { label: "Reparaciones completadas", value: completadas, href: "/admin/ordenes" },
    { label: "Tiempo promedio", value: `${avgDaysLabel} días`, href: null },
    { label: "Ingresos cobrados", value: formatBs(income._sum.totalBs ?? 0), href: "/admin/reportes" },
  ];

  return (
    <div>
      <PageHeader
        title="Panel de control"
        subtitle="Indicadores del taller en tiempo real."
        actions={
          <LinkButton href="/admin/ordenes/nueva" variant="primary">
            <PlusIcon width={18} height={18} />
            Nueva orden
          </LinkButton>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => {
          const inner = (
            <Card className="h-full p-5 transition-shadow hover:shadow-md">
              <div
                className={`text-3xl font-semibold tracking-tight ${
                  kpi.accent
                    ? "text-brand-600 dark:text-brand-500"
                    : "text-zinc-900 dark:text-zinc-50"
                }`}
              >
                {kpi.value}
              </div>
              <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {kpi.label}
              </div>
            </Card>
          );
          return kpi.href ? (
            <Link key={kpi.label} href={kpi.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={kpi.label}>{inner}</div>
          );
        })}
      </div>

      <h2 className="mt-9 mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Órdenes por estado
      </h2>
      <Card className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {STATUS_ORDER.map((status) => {
          const count = statusCounts.get(status) ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={status} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-44">
                <StatusBadge status={status} />
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className={`h-full rounded-full ${STATUS_DOT[status]}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="w-10 text-right text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                {count}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
