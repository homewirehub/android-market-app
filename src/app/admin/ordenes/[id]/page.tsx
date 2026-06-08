// Order detail page — the screen a technician keeps open all day.
// Shows customer, device, problem, technician, priority, status, the full
// history timeline, a QR code, and a printable PDF receipt.
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, StatusBadge, LinkButton, Button, Field, fieldClass } from "@/components/ui";
import {
  statusLabel,
  priorityLabel,
  formatDateTime,
  formatDateShort,
  formatBs,
  STATUS_ORDER,
} from "@/lib/labels";
import { statusUrl } from "@/lib/appUrl";
import { qrDataUrl } from "@/lib/qr";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { updateOrderStatus } from "../actions";

export const dynamic = "force-dynamic";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-x-3 py-2.5">
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-sm text-zinc-800 dark:text-zinc-200">{children}</dd>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order, technicians] = await Promise.all([
    prisma.repairOrder.findUnique({
      where: { id },
      include: {
        device: { include: { customer: true } },
        history: {
          orderBy: { changedAt: "asc" },
          include: { technician: true },
        },
      },
    }),
    prisma.technician.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!order) notFound();

  // Assigned technician = most recent history entry that names one.
  const assignedTechnician = [...order.history]
    .reverse()
    .find((h) => h.technician)?.technician ?? null;

  const trackUrl = statusUrl(order.orderCode);
  const qr = await qrDataUrl(trackUrl);

  return (
    <div>
      <PageHeader
        title={order.orderCode}
        subtitle={`${order.device.brand} ${order.device.model} · ${order.device.type}`}
        actions={
          <>
            <LinkButton href="/admin/ordenes" variant="secondary">
              <ArrowLeftIcon width={18} height={18} />
              Volver
            </LinkButton>
            <a
              href={`/admin/ordenes/${order.id}/comprobante`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-500"
            >
              Generar comprobante
            </a>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: details + history */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Detalles de la orden
              </h2>
            </div>
            <dl className="divide-y divide-zinc-100 px-6 dark:divide-zinc-800">
              <DetailRow label="Cliente">{order.device.customer.name}</DetailRow>
              <DetailRow label="Teléfono">
                {order.device.customer.phone ?? "—"}
              </DetailRow>
              <DetailRow label="Equipo">
                {order.device.brand} {order.device.model} ({order.device.type})
              </DetailRow>
              <DetailRow label="N.º de serie">
                {order.device.serialNumber ?? "—"}
              </DetailRow>
              <DetailRow label="Problema">{order.description}</DetailRow>
              <DetailRow label="Prioridad">{priorityLabel(order.priority)}</DetailRow>
              <DetailRow label="Costo estimado">{formatBs(order.estimatedCost)}</DetailRow>
              <DetailRow label="Entrega estimada">
                {formatDateShort(order.estimatedReadyAt)}
              </DetailRow>
              <DetailRow label="Estado">
                <StatusBadge status={order.status} />
              </DetailRow>
              <DetailRow label="Técnico">
                {assignedTechnician?.name ?? (
                  <span className="text-zinc-400">Sin asignar</span>
                )}
              </DetailRow>
            </dl>
          </Card>

          <Card>
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Historial
              </h2>
            </div>
            <ol className="space-y-5 p-6">
              {order.history.map((h, i) => (
                <li key={h.id} className="relative flex gap-4">
                  {/* timeline line */}
                  {i < order.history.length - 1 ? (
                    <span className="absolute left-[5px] top-4 h-full w-px bg-zinc-200 dark:bg-zinc-700" />
                  ) : null}
                  <span className="relative mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500 ring-4 ring-brand-500/15" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {statusLabel(h.status)}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {formatDateTime(h.changedAt)}
                      </span>
                    </div>
                    {h.note ? (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{h.note}</p>
                    ) : null}
                    {h.technician ? (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        Técnico: {h.technician.name}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Right: QR + status control */}
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col items-center p-6 text-center">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Seguimiento del cliente
              </h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt={`Código QR para ${order.orderCode}`}
                width={180}
                height={180}
                className="mt-4 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700"
              />
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                Escanee para consultar el estado en línea
              </p>
              <Link
                href={`/status?code=${encodeURIComponent(order.orderCode)}`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-500"
              >
                Abrir página de estado
                <ArrowRightIcon width={14} height={14} />
              </Link>
            </div>
          </Card>

          <Card>
            <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Actualizar estado
              </h2>
            </div>
            <form action={updateOrderStatus} className="space-y-4 p-5">
              <input type="hidden" name="orderId" value={order.id} />
              <Field label="Estado" htmlFor="status">
                <select id="status" name="status" defaultValue={order.status} className={fieldClass}>
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Técnico" htmlFor="technicianId">
                <select
                  id="technicianId"
                  name="technicianId"
                  defaultValue={assignedTechnician?.id ?? ""}
                  className={fieldClass}
                >
                  <option value="">Sin asignar</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Costo (Bs)" htmlFor="estimatedCost">
                  <input
                    id="estimatedCost"
                    name="estimatedCost"
                    type="number"
                    min="0"
                    step="10"
                    defaultValue={order.estimatedCost ?? ""}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Entrega est." htmlFor="estimatedReadyAt">
                  <input
                    id="estimatedReadyAt"
                    name="estimatedReadyAt"
                    type="date"
                    defaultValue={
                      order.estimatedReadyAt
                        ? order.estimatedReadyAt.toISOString().slice(0, 10)
                        : ""
                    }
                    className={fieldClass}
                  />
                </Field>
              </div>
              <Field label="Nota (opcional)" htmlFor="note">
                <input id="note" name="note" className={fieldClass} placeholder="Comentario del cambio…" />
              </Field>
              <Button type="submit" className="w-full">
                Guardar cambio
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
