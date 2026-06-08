// Admin: repair orders list with inline status management + intake CTA.
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
} from "@/components/ui";
import { priorityLabel, formatDate, statusLabel, STATUS_ORDER } from "@/lib/labels";
import { PlusIcon, CheckIcon } from "@/components/icons";
import { updateOrderStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ nueva?: string }>;
}) {
  const { nueva } = await searchParams;

  const orders = await prisma.repairOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { device: { include: { customer: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Órdenes de reparación"
        subtitle={`${orders.length} órdenes · las solicitudes de clientes y del taller aparecen aquí`}
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
          Orden <span className="font-mono font-medium">{nueva}</span> registrada
          correctamente.
        </div>
      ) : null}

      <Table>
        <thead>
          <tr>
            <Th>Código</Th>
            <Th>Equipo</Th>
            <Th>Cliente</Th>
            <Th>Descripción</Th>
            <Th>Prioridad</Th>
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
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  {o.device.type}
                </div>
              </Td>
              <Td>{o.device.customer.name}</Td>
              <Td>
                <span className="block max-w-xs text-zinc-600 dark:text-zinc-400">
                  {o.description}
                </span>
              </Td>
              <Td>{priorityLabel(o.priority)}</Td>
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
        </tbody>
      </Table>
    </div>
  );
}
