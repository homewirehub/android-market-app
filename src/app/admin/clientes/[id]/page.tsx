// Customer detail + full repair history.
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Table, Th, Td, StatusBadge, LinkButton } from "@/components/ui";
import { formatDate, formatBs } from "@/lib/labels";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-x-3 py-2">
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-sm text-zinc-800 dark:text-zinc-200">{children}</dd>
    </div>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      devices: {
        include: {
          repairOrders: {
            orderBy: { createdAt: "desc" },
            include: { payment: true },
          },
        },
      },
    },
  });
  if (!customer) notFound();

  // Flatten all orders across the customer's devices.
  const orders = customer.devices
    .flatMap((d) => d.repairOrders.map((o) => ({ ...o, device: d })))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const totalSpent = orders.reduce(
    (s, o) => s + (o.payment?.status === "PAID" ? o.payment.totalBs : 0),
    0,
  );

  const stats = [
    { label: "Equipos", value: customer.devices.length },
    { label: "Órdenes", value: orders.length },
    { label: "Total pagado", value: formatBs(totalSpent) },
  ];

  return (
    <div>
      <PageHeader
        title={customer.name}
        subtitle="Ficha del cliente e historial de reparaciones."
        actions={
          <LinkButton href="/admin/clientes" variant="secondary">
            <ArrowLeftIcon width={18} height={18} />
            Volver
          </LinkButton>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer info */}
        <Card>
          <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Datos del cliente</h2>
          </div>
          <dl className="divide-y divide-zinc-100 px-5 dark:divide-zinc-800">
            <DetailRow label="C.I.">{customer.ci ?? "—"}</DetailRow>
            <DetailRow label="Teléfono">{customer.phone ?? "—"}</DetailRow>
            <DetailRow label="Correo">{customer.email ?? "—"}</DetailRow>
            <DetailRow label="Dirección">{customer.address ?? "—"}</DetailRow>
            <DetailRow label="Nota">{customer.note ?? "—"}</DetailRow>
            <DetailRow label="Registrado">{formatDate(customer.createdAt)}</DetailRow>
          </dl>
        </Card>

        {/* Stats + history */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <Card key={s.label} className="p-4">
                <div className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{s.label}</div>
              </Card>
            ))}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Historial de reparaciones
            </h2>
            <Table>
              <thead>
                <tr>
                  <Th>Código</Th>
                  <Th>Equipo</Th>
                  <Th>Falla</Th>
                  <Th>Estado</Th>
                  <Th>Total</Th>
                  <Th>Fecha</Th>
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
                      {o.device.brand} {o.device.model}
                    </Td>
                    <Td>{o.description}</Td>
                    <Td>
                      <StatusBadge status={o.status} />
                    </Td>
                    <Td className="tabular-nums">{formatBs(o.payment?.totalBs ?? null)}</Td>
                    <Td>
                      <span className="whitespace-nowrap">{formatDate(o.createdAt)}</span>
                    </Td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <Td>
                      <span className="text-zinc-500 dark:text-zinc-400">Sin órdenes registradas.</span>
                    </Td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
