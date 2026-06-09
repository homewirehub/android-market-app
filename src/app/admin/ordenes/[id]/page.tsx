// Order detail page — the screen a technician keeps open all day.
// Customer, device, problem, technician, parts used, payment, status + history.
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  PageHeader,
  Card,
  StatusBadge,
  LinkButton,
  Button,
  Field,
  fieldClass,
} from "@/components/ui";
import {
  statusLabel,
  priorityLabel,
  formatDateTime,
  formatDateShort,
  formatBs,
  STATUS_ORDER,
  PAYMENT_METHOD_ORDER,
  paymentMethodLabel,
  paymentStatusLabel,
} from "@/lib/labels";
import { statusUrl } from "@/lib/appUrl";
import { qrDataUrl } from "@/lib/qr";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import {
  updateOrderStatus,
  addOrderPart,
  removeOrderPart,
  savePayment,
} from "../actions";

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

  const [order, technicians, spareParts] = await Promise.all([
    prisma.repairOrder.findUnique({
      where: { id },
      include: {
        device: { include: { customer: true } },
        history: { orderBy: { changedAt: "asc" }, include: { technician: true } },
        parts: { include: { sparePart: true } },
        payment: true,
      },
    }),
    prisma.technician.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.sparePart.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: { id: true, name: true, priceBs: true, stock: true },
    }),
  ]);

  if (!order) notFound();

  const assignedTechnician = [...order.history].reverse().find((h) => h.technician)?.technician ?? null;
  const trackUrl = statusUrl(order.orderCode);
  const qr = await qrDataUrl(trackUrl);

  const partsTotal = order.parts.reduce((s, p) => s + p.unitPriceBs * p.quantity, 0);
  const labor = order.laborCost ?? 0;
  const discount = order.payment?.discountBs ?? 0;
  const total = Math.max(0, labor + partsTotal - discount);

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
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Details */}
          <Card>
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Detalles de la orden
              </h2>
            </div>
            <dl className="divide-y divide-zinc-100 px-6 dark:divide-zinc-800">
              <DetailRow label="Cliente">{order.device.customer.name}</DetailRow>
              <DetailRow label="Teléfono">{order.device.customer.phone ?? "—"}</DetailRow>
              <DetailRow label="Equipo">
                {order.device.brand} {order.device.model} ({order.device.type})
              </DetailRow>
              <DetailRow label="IMEI / serie">{order.device.serialNumber ?? "—"}</DetailRow>
              <DetailRow label="Accesorios">{order.device.accessories ?? "—"}</DetailRow>
              <DetailRow label="Falla reportada">{order.description}</DetailRow>
              <DetailRow label="Diagnóstico">
                {order.diagnosis ?? <span className="text-zinc-400">Pendiente</span>}
              </DetailRow>
              <DetailRow label="Prioridad">{priorityLabel(order.priority)}</DetailRow>
              <DetailRow label="Entrega estimada">{formatDateShort(order.estimatedReadyAt)}</DetailRow>
              <DetailRow label="Estado">
                <StatusBadge status={order.status} />
              </DetailRow>
              <DetailRow label="Técnico">
                {assignedTechnician?.name ?? <span className="text-zinc-400">Sin asignar</span>}
              </DetailRow>
            </dl>
          </Card>

          {/* Parts used */}
          <Card>
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Repuestos utilizados
              </h2>
            </div>
            <div className="p-6">
              {order.parts.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Sin repuestos registrados.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {order.parts.map((p) => (
                      <tr key={p.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                        <td className="py-2 text-zinc-800 dark:text-zinc-200">{p.sparePart.name}</td>
                        <td className="py-2 text-right tabular-nums text-zinc-500">
                          {p.quantity} × {formatBs(p.unitPriceBs)}
                        </td>
                        <td className="py-2 pl-3 text-right tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                          {formatBs(p.unitPriceBs * p.quantity)}
                        </td>
                        <td className="py-2 pl-3 text-right">
                          <form action={removeOrderPart}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="orderPartId" value={p.id} />
                            <button
                              type="submit"
                              className="text-xs text-red-600 hover:underline dark:text-red-400"
                            >
                              Quitar
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="pt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Total repuestos
                      </td>
                      <td />
                      <td className="pt-3 pl-3 text-right tabular-nums font-semibold text-zinc-900 dark:text-zinc-50">
                        {formatBs(partsTotal)}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Add part */}
              <form action={addOrderPart} className="mt-4 flex flex-wrap items-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <input type="hidden" name="orderId" value={order.id} />
                <div className="min-w-[14rem] flex-1">
                  <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Agregar repuesto
                  </label>
                  <select name="sparePartId" required className={fieldClass} defaultValue="">
                    <option value="" disabled>
                      Seleccione un repuesto…
                    </option>
                    {spareParts.map((sp) => (
                      <option key={sp.id} value={sp.id} disabled={sp.stock <= 0}>
                        {sp.name} — {formatBs(sp.priceBs)} (stock {sp.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Cant.
                  </label>
                  <input type="number" name="quantity" min="1" defaultValue={1} className={fieldClass} />
                </div>
                <Button type="submit" variant="secondary">
                  Agregar
                </Button>
              </form>
            </div>
          </Card>

          {/* History */}
          <Card>
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Historial</h2>
            </div>
            <ol className="space-y-5 p-6">
              {order.history.map((h, i) => (
                <li key={h.id} className="relative flex gap-4">
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
                    {h.note ? <p className="text-sm text-zinc-500 dark:text-zinc-400">{h.note}</p> : null}
                    {h.technician ? (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">Técnico: {h.technician.name}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* QR */}
          <Card>
            <div className="flex flex-col items-center p-6 text-center">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Seguimiento del cliente
              </h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt={`Código QR para ${order.orderCode}`}
                width={170}
                height={170}
                className="mt-4 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700"
              />
              <Link
                href={`/status?code=${encodeURIComponent(order.orderCode)}`}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-500"
              >
                Abrir página de estado
                <ArrowRightIcon width={14} height={14} />
              </Link>
            </div>
          </Card>

          {/* Payment */}
          <Card>
            <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Pago</h2>
            </div>
            <div className="space-y-3 p-5">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Mano de obra</span>
                  <span className="tabular-nums">{formatBs(labor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Repuestos</span>
                  <span className="tabular-nums">{formatBs(partsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Descuento</span>
                  <span className="tabular-nums">− {formatBs(discount)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-1.5 text-base font-semibold dark:border-zinc-800">
                  <span>Total</span>
                  <span className="tabular-nums text-brand-600 dark:text-brand-500">{formatBs(total)}</span>
                </div>
              </div>

              <form action={savePayment} className="space-y-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <input type="hidden" name="orderId" value={order.id} />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Forma de pago" htmlFor="method">
                    <select id="method" name="method" defaultValue={order.payment?.method ?? "CASH"} className={fieldClass}>
                      {PAYMENT_METHOD_ORDER.map((m) => (
                        <option key={m} value={m}>
                          {paymentMethodLabel(m)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Descuento (Bs)" htmlFor="discountBs">
                    <input
                      id="discountBs"
                      name="discountBs"
                      type="number"
                      min="0"
                      step="5"
                      defaultValue={order.payment?.discountBs ?? 0}
                      className={fieldClass}
                    />
                  </Field>
                </div>
                <Field label="Estado del pago" htmlFor="status">
                  <select id="status" name="status" defaultValue={order.payment?.status ?? "PENDING"} className={fieldClass}>
                    <option value="PENDING">Pendiente</option>
                    <option value="PAID">Pagado</option>
                  </select>
                </Field>
                <Button type="submit" className="w-full">
                  {order.payment ? "Actualizar pago" : "Registrar pago"}
                </Button>
                {order.payment ? (
                  <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                    {paymentStatusLabel(order.payment.status)} ·{" "}
                    {paymentMethodLabel(order.payment.method)}
                  </p>
                ) : null}
              </form>
            </div>
          </Card>

          {/* Status control */}
          <Card>
            <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Actualizar estado</h2>
            </div>
            <form action={updateOrderStatus} className="space-y-4 p-5">
              <input type="hidden" name="orderId" value={order.id} />
              <Field label="Estado" htmlFor="statusSel">
                <select id="statusSel" name="status" defaultValue={order.status} className={fieldClass}>
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Técnico" htmlFor="technicianId">
                <select id="technicianId" name="technicianId" defaultValue={assignedTechnician?.id ?? ""} className={fieldClass}>
                  <option value="">Sin asignar</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Diagnóstico técnico" htmlFor="diagnosis">
                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  rows={2}
                  defaultValue={order.diagnosis ?? ""}
                  className={fieldClass}
                  placeholder="Resultado de la revisión técnica…"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mano de obra (Bs)" htmlFor="laborCost">
                  <input id="laborCost" name="laborCost" type="number" min="0" step="10" defaultValue={order.laborCost ?? ""} className={fieldClass} />
                </Field>
                <Field label="Entrega est." htmlFor="estimatedReadyAt">
                  <input
                    id="estimatedReadyAt"
                    name="estimatedReadyAt"
                    type="date"
                    defaultValue={order.estimatedReadyAt ? order.estimatedReadyAt.toISOString().slice(0, 10) : ""}
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
