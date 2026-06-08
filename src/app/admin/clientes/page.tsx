// Admin: customers list. Reads customers from the DB.
import { prisma } from "@/lib/prisma";
import { PageHeader, Table, Th, Td } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { devices: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${customers.length} clientes registrados`}
      />
      <Table>
        <thead>
          <tr>
            <Th>Nombre</Th>
            <Th>Teléfono</Th>
            <Th>Correo</Th>
            <Th>Dirección</Th>
            <Th>Equipos</Th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40">
              <Td>{c.name}</Td>
              <Td>{c.phone ?? "—"}</Td>
              <Td>{c.email ?? "—"}</Td>
              <Td>{c.address ?? "—"}</Td>
              <Td>{c._count.devices}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
