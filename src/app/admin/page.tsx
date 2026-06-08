// Admin dashboard. Live counts read from the DB. Full stats come later.
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, StatusBadge, LinkButton } from "@/components/ui";
import { STATUS_ORDER, STATUS_DOT } from "@/lib/labels";
import {
  UsersIcon,
  DeviceIcon,
  ClipboardIcon,
  WrenchIcon,
  PlusIcon,
} from "@/components/icons";
import type { RepairStatus } from "@prisma/client";

// Always read fresh from the local DB.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [customers, devices, orders, technicians, byStatus] = await Promise.all([
    prisma.customer.count(),
    prisma.device.count(),
    prisma.repairOrder.count(),
    prisma.technician.count(),
    prisma.repairOrder.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const statusCounts = new Map<RepairStatus, number>(
    byStatus.map((row) => [row.status, row._count._all]),
  );
  const openOrders = orders - (statusCounts.get("DELIVERED") ?? 0);

  const stats = [
    { label: "Clientes", value: customers, href: "/admin/clientes", icon: <UsersIcon /> },
    { label: "Equipos", value: devices, href: "/admin/equipos", icon: <DeviceIcon /> },
    {
      label: "Órdenes abiertas",
      value: openOrders,
      href: "/admin/ordenes",
      icon: <ClipboardIcon />,
    },
    { label: "Técnicos", value: technicians, href: null, icon: <WrenchIcon /> },
  ];

  return (
    <div>
      <PageHeader
        title="Panel de control"
        subtitle="Resumen del taller en tiempo real."
        actions={
          <LinkButton href="/admin/ordenes/nueva" variant="primary">
            <PlusIcon width={18} height={18} />
            Nueva orden
          </LinkButton>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const inner = (
            <Card className="h-full p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {stat.label}
                  </div>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-500">
                  {stat.icon}
                </span>
              </div>
            </Card>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={stat.label}>{inner}</div>
          );
        })}
      </div>

      <h2 className="mt-9 mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Órdenes por estado
      </h2>
      <Card className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {STATUS_ORDER.map((status) => {
          const count = statusCounts.get(status) ?? 0;
          const pct = orders > 0 ? Math.round((count / orders) * 100) : 0;
          return (
            <div key={status} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-44">
                <StatusBadge status={status} />
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full ${STATUS_DOT[status]}`}
                  style={{ width: `${pct}%` }}
                />
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
