// Global search across orders, customers, phone numbers and serial numbers.
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, fieldClass } from "@/components/ui";
import { formatDate, formatBs } from "@/lib/labels";
import { SearchIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function GlobalSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [customers, orders] = query
    ? await Promise.all([
        prisma.customer.findMany({
          where: {
            OR: [{ name: { contains: query } }, { phone: { contains: query } }],
          },
          include: { _count: { select: { devices: true } } },
          take: 20,
          orderBy: { name: "asc" },
        }),
        prisma.repairOrder.findMany({
          where: {
            OR: [
              { orderCode: { contains: query } },
              { device: { is: { serialNumber: { contains: query } } } },
              { device: { is: { brand: { contains: query } } } },
              { device: { is: { model: { contains: query } } } },
              { device: { is: { customer: { is: { name: { contains: query } } } } } },
              { device: { is: { customer: { is: { phone: { contains: query } } } } } },
            ],
          },
          include: { device: { include: { customer: true } }, payment: true },
          take: 25,
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], []];

  const totalResults = customers.length + orders.length;

  return (
    <div>
      <PageHeader
        title="Búsqueda global"
        subtitle="Busca por código de orden, cliente, teléfono o número de serie."
      />

      <form method="get" action="/admin/buscar" className="mb-6 flex gap-2">
        <div className="relative max-w-xl flex-1">
          <SearchIcon
            width={18}
            height={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            name="q"
            autoFocus
            defaultValue={query}
            placeholder="Ej.: Vargas · 72565282 · REP-2026-0004 · IMEI…"
            className={`${fieldClass} pl-9`}
          />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {query ? (
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          {totalResults} resultado(s) para{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">“{query}”</span>
        </p>
      ) : null}

      {query && totalResults === 0 ? (
        <Card>
          <p className="p-5 text-sm text-zinc-600 dark:text-zinc-400">Sin resultados.</p>
        </Card>
      ) : null}

      {customers.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Clientes ({customers.length})
          </h2>
          <Table>
            <thead>
              <tr>
                <Th>Nombre</Th>
                <Th>Teléfono</Th>
                <Th>Dirección</Th>
                <Th>Equipos</Th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40">
                  <Td>
                    <Link
                      href={`/admin/clientes/${c.id}`}
                      className="font-medium text-brand-600 hover:underline dark:text-brand-500"
                    >
                      {c.name}
                    </Link>
                  </Td>
                  <Td>{c.phone ?? "—"}</Td>
                  <Td>{c.address ?? "—"}</Td>
                  <Td>{c._count.devices}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      ) : null}

      {orders.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Órdenes ({orders.length})
          </h2>
          <Table>
            <thead>
              <tr>
                <Th>Código</Th>
                <Th>Equipo</Th>
                <Th>Cliente</Th>
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
                  <Td>{o.device.customer.name}</Td>
                  <Td>
                    <StatusBadge status={o.status} />
                  </Td>
                  <Td className="tabular-nums">{formatBs(o.payment?.totalBs ?? null)}</Td>
                  <Td>
                    <span className="whitespace-nowrap">{formatDate(o.createdAt)}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      ) : null}
    </div>
  );
}
