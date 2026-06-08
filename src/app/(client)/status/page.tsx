// Public customer status page. A customer types their order code
// (e.g. REP-2026-0001) and sees the current status + history. No auth.
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, StatusBadge, Button, fieldClass } from "@/components/ui";
import {
  statusLabel,
  formatDate,
  formatBs,
  formatDateShort,
  paymentStatusLabel,
} from "@/lib/labels";
import { SearchIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

// searchParams is async in the App Router (Next 15+).
export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const trimmed = code?.trim();

  const order = trimmed
    ? await prisma.repairOrder.findUnique({
        where: { orderCode: trimmed },
        include: {
          device: { include: { customer: true } },
          payment: true,
          history: {
            orderBy: { changedAt: "asc" },
            include: { technician: true },
          },
        },
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <PageHeader
        title="Estado de su reparación"
        subtitle="Ingrese el código de su orden para ver el estado actual."
      />

      {/* Simple GET form — no client JS needed. */}
      <form method="get" className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon
            width={18}
            height={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            name="code"
            defaultValue={trimmed ?? ""}
            placeholder="REP-2026-0001"
            className={`${fieldClass} pl-9`}
          />
        </div>
        <Button type="submit">Consultar</Button>
      </form>

      {trimmed && !order ? (
        <Card>
          <p className="p-5 text-sm text-zinc-600 dark:text-zinc-400">
            No se encontró ninguna orden con el código{" "}
            <span className="font-mono">{trimmed}</span>.
          </p>
        </Card>
      ) : null}

      {order ? (
        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                {order.orderCode}
              </span>
              <StatusBadge status={order.status} />
            </div>

            <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-sm">
              <dt className="text-zinc-500 dark:text-zinc-400">Equipo</dt>
              <dd className="text-zinc-800 dark:text-zinc-200">
                {order.device.brand} {order.device.model} ({order.device.type})
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Cliente</dt>
              <dd className="text-zinc-800 dark:text-zinc-200">
                {order.device.customer.name}
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Descripción</dt>
              <dd className="text-zinc-800 dark:text-zinc-200">{order.description}</dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Ingreso</dt>
              <dd className="text-zinc-800 dark:text-zinc-200">
                {formatDate(order.createdAt)}
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Costo estimado</dt>
              <dd className="text-zinc-800 dark:text-zinc-200">
                {formatBs(order.estimatedCost)}
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">Entrega estimada</dt>
              <dd className="text-zinc-800 dark:text-zinc-200">
                {formatDateShort(order.estimatedReadyAt)}
              </dd>
              {order.payment ? (
                <>
                  <dt className="text-zinc-500 dark:text-zinc-400">Total</dt>
                  <dd className="text-zinc-800 dark:text-zinc-200">
                    {formatBs(order.payment.totalBs)} ·{" "}
                    {paymentStatusLabel(order.payment.status)}
                  </dd>
                </>
              ) : null}
            </dl>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Historial
              </h3>
              <ol className="space-y-4">
                {order.history.map((h) => (
                  <li key={h.id} className="relative flex gap-3 text-sm">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {statusLabel(h.status)}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {formatDate(h.changedAt)}
                        </span>
                      </div>
                      {h.note ? (
                        <p className="text-zinc-500 dark:text-zinc-400">{h.note}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Card>
      ) : null}

      {!trimmed ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Ejemplo: pruebe con un código como{" "}
          <span className="font-mono">REP-2026-0001</span>.
        </p>
      ) : null}
    </div>
  );
}
