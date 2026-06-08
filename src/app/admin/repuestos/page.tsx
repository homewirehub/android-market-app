// Admin: spare-parts inventory (repuestos). List + stock + low-stock alerts,
// add new part, and restock.
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Table, Th, Td, Button, Field, fieldClass } from "@/components/ui";
import { formatBs } from "@/lib/labels";
import { createSparePart, restock } from "./actions";

export const dynamic = "force-dynamic";

const CATEGORIES = ["Pantalla", "Batería", "Tapa", "Módulo de carga", "Otro"];

export default async function RepuestosPage() {
  const parts = await prisma.sparePart.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  const lowStock = parts.filter((p) => p.stock <= p.stockMin).length;

  return (
    <div>
      <PageHeader
        title="Repuestos e inventario"
        subtitle={`${parts.length} repuestos · ${lowStock} por reabastecer`}
      />

      {/* Add new part */}
      <Card className="mb-6">
        <form
          action={createSparePart}
          className="grid items-end gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6"
        >
          <div className="lg:col-span-2">
            <Field label="Nombre del repuesto" htmlFor="name" required>
              <input id="name" name="name" required className={fieldClass} placeholder="Pantalla Samsung A12" />
            </Field>
          </div>
          <Field label="Categoría" htmlFor="category">
            <select id="category" name="category" className={fieldClass} defaultValue="Pantalla">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Precio (Bs)" htmlFor="priceBs">
            <input id="priceBs" name="priceBs" type="number" min="0" step="5" className={fieldClass} />
          </Field>
          <Field label="Stock" htmlFor="stock">
            <input id="stock" name="stock" type="number" min="0" defaultValue={0} className={fieldClass} />
          </Field>
          <div className="flex gap-2">
            <div className="flex-1">
              <Field label="Mínimo" htmlFor="stockMin">
                <input id="stockMin" name="stockMin" type="number" min="0" defaultValue={2} className={fieldClass} />
              </Field>
            </div>
            <Button type="submit" className="mb-[1px]">
              Agregar
            </Button>
          </div>
        </form>
      </Card>

      <Table>
        <thead>
          <tr>
            <Th>Código</Th>
            <Th>Repuesto</Th>
            <Th>Categoría</Th>
            <Th>Precio</Th>
            <Th>Stock</Th>
            <Th>Mínimo</Th>
            <Th>Entrada</Th>
          </tr>
        </thead>
        <tbody>
          {parts.map((p) => {
            const low = p.stock <= p.stockMin;
            return (
              <tr key={p.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40">
                <Td>
                  <span className="font-mono text-xs">{p.code}</span>
                </Td>
                <Td>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{p.name}</span>
                </Td>
                <Td>{p.category}</Td>
                <Td className="tabular-nums">{formatBs(p.priceBs)}</Td>
                <Td>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      low
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                  >
                    {p.stock} {low ? "· reabastecer" : ""}
                  </span>
                </Td>
                <Td className="tabular-nums">{p.stockMin}</Td>
                <Td>
                  <form action={restock} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      type="number"
                      name="amount"
                      min="1"
                      defaultValue={1}
                      className="w-16 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    <Button type="submit" variant="secondary" className="px-2 py-1 text-xs">
                      + Stock
                    </Button>
                  </form>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
