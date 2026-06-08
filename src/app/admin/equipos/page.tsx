// Admin: devices list. Reads devices joined with their owner.
import { prisma } from "@/lib/prisma";
import { PageHeader, Table, Th, Td } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminDevicesPage() {
  const devices = await prisma.device.findMany({
    orderBy: { type: "asc" },
    include: {
      customer: true,
      _count: { select: { repairOrders: true } },
    },
  });

  return (
    <div>
      <PageHeader title="Equipos" subtitle={`${devices.length} equipos registrados`} />
      <Table>
        <thead>
          <tr>
            <Th>Tipo</Th>
            <Th>Marca</Th>
            <Th>Modelo</Th>
            <Th>N.º de serie</Th>
            <Th>Cliente</Th>
            <Th>Órdenes</Th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40">
              <Td>{d.type}</Td>
              <Td>{d.brand}</Td>
              <Td>{d.model}</Td>
              <Td>{d.serialNumber ?? "—"}</Td>
              <Td>{d.customer.name}</Td>
              <Td>{d._count.repairOrders}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
