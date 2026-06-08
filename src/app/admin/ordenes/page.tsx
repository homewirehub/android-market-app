// Admin: repair orders list with search, inline status management + intake CTA.
// Orders submitted by clients OR registered in-shop appear here.
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  PageHeader,
  Table,
  Th,
  Td,
  StatusBadge,
  LinkButton,
  Button,
  fieldClass,
} from "@/components/ui";
import {
  priorityLabel,
  formatDate,
  formatBs,
  statusLabel,
  STATUS_ORDER,
} from "@/lib/labels";
import { PlusIcon, CheckIcon, SearchIcon } from "@/components/icons";
import { updateOrderStatus } from "./actions";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ nueva?: string; q?: string }>;
}) {
  const { nueva, q } = await searchParams;
  const query = q?.trim() ?? "";

  // Search by order code, customer name, or device brand/model.
  const where: Prisma.RepairOrderWhereInput = query
    ? {
        OR: [
          { orderCode: { contains: query } },
          { device: { is: { customer: { is: { name: { contains: query } } } } } },
          { device: { is: { brand: { contains: query } } } },
          { device: { is: { model: { contains: query } } } },
        ],
      }
    : {};

  const orders = await prisma.repairOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { device: { include: { customer: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Órdenes de reparación"
        subtitle="Las solicitudes de clientes y del taller aparecen aquí."
        actions={
          <LinkButton href="/admin/ordenes/nueva" variant="primary">
            <PlusIcon width={18} height={18} />
            Nueva orden
          </LinkButton>
        }
      />

      {nueva ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-500">
          <CheckIcon width={18} height={18} />
          Orden <span className="font-mono font-medium">{nueva}</span> registrada correctamente.
        </div>
      ) : null}

      {/* Search */}
      <form method="get" className="mb-4 flex gap-2">
        <div className="relative max-w-md flex-1">
          <SearchIcon
            width={18}
            height={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Buscar por cliente, código o equipo (p. ej. Vargas, REP-2026-0020)"
            className={`${fieldClass} pl-9`}
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
        {query ? (
          <LinkButton href="/admin/ordenes" variant="ghost">
            Limpiar
          </LinkButton>
        ) : null}
      </form>

      {query ? (
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          {orders.length} resultado(s) para{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">“{query}”</span>
        </p>
      ) : null}

      <Table>
        <thead>
          <tr>
            <Th>Código</Th>
            <Th>Equipo</Th>
            <Th>Cliente</Th>
            <Th>Prioridad</Th>
            <Th>Costo est.</Th>
            <Th>Estado</Th>
            <Th>Creada</Th>
            <Th>Cambiar estado</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40">
              <Td>
                <Link
                  href={`/admin/ordenes/${o.id}`}
                  className="font-mono text-xs font-medium text-brand-600 hover:underline dark:text-brand-500"
                >
                  {o.orderCode}
                </Link>
              </Td>
              <Td>
                <div className="font-medium text-zinc-800 dark:text-zinc-200">
                  {o.device.brand} {o.device.model}
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500">{o.device.type}</div>
              </Td>
              <Td>{o.device.customer.name}</Td>
              <Td>{priorityLabel(o.priority)}</Td>
              <Td>
                <span className="whitespace-nowrap tabular-nums">{formatBs(o.estimatedCost)}</span>
              </Td>
              <Td>
                <StatusBadge status={o.status} />
              </Td>
              <Td>
                <span className="whitespace-nowrap">{formatDate(o.createdAt)}</span>
              </Td>
              <Td>
                <form action={updateOrderStatus} className="flex items-center gap-2">
                  <input type="hidden" name="orderId" value={o.id} />
                  <select
                    name="status"
                    defaultValue={o.status}
                    className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" variant="secondary" className="px-2.5 py-1.5 text-xs">
                    Guardar
                  </Button>
                </form>
              </Td>
            </tr>
          ))}
          {orders.length === 0 ? (
            <tr>
              <Td>
                <span className="text-zinc-500 dark:text-zinc-400">Sin resultados.</span>
              </Td>
            </tr>
          ) : null}
        </tbody>
      </Table>
    </div>
  );
}
