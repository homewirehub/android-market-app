// Public repair-request form. Posts to the createOrder server action.
import { PageHeader, Card, Button, Field, fieldClass } from "@/components/ui";
import { PRIORITY_ORDER, priorityLabel } from "@/lib/labels";
import { createOrder } from "./actions";

export default async function SolicitarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <PageHeader
        title="Solicitar una reparación"
        subtitle="Complete el formulario. Le entregaremos un código para dar seguimiento."
      />

      {error === "missing" ? (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300">
          Por favor complete todos los campos obligatorios (*).
        </div>
      ) : null}

      <Card>
        <form action={createOrder} className="space-y-7 p-6 sm:p-8">
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Sus datos
            </legend>
            <Field label="Nombre completo" htmlFor="customerName" required>
              <input id="customerName" name="customerName" required className={fieldClass} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Teléfono" htmlFor="phone">
                <input id="phone" name="phone" className={fieldClass} placeholder="+591 7..." />
              </Field>
              <Field label="Correo" htmlFor="email">
                <input id="email" name="email" type="email" className={fieldClass} />
              </Field>
            </div>
            <Field label="Dirección" htmlFor="address">
              <input id="address" name="address" className={fieldClass} />
            </Field>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Su equipo
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo de equipo" htmlFor="deviceType" required>
                <select id="deviceType" name="deviceType" required className={fieldClass} defaultValue="">
                  <option value="" disabled>
                    Seleccione…
                  </option>
                  <option value="Laptop">Laptop</option>
                  <option value="Teléfono">Teléfono</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Impresora">Impresora</option>
                  <option value="Otro">Otro</option>
                </select>
              </Field>
              <Field label="Prioridad" htmlFor="priority">
                <select id="priority" name="priority" className={fieldClass} defaultValue="MEDIUM">
                  {PRIORITY_ORDER.map((p) => (
                    <option key={p} value={p}>
                      {priorityLabel(p)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Marca" htmlFor="brand" required>
                <input id="brand" name="brand" required className={fieldClass} placeholder="HP, Samsung…" />
              </Field>
              <Field label="Modelo" htmlFor="model" required>
                <input id="model" name="model" required className={fieldClass} />
              </Field>
            </div>
            <Field label="N.º de serie" htmlFor="serialNumber">
              <input id="serialNumber" name="serialNumber" className={fieldClass} />
            </Field>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              El problema
            </legend>
            <Field label="Descripción del problema" htmlFor="description" required>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className={fieldClass}
                placeholder="Describa la falla con el mayor detalle posible…"
              />
            </Field>
          </fieldset>

          <Button type="submit" className="w-full py-2.5">
            Enviar solicitud
          </Button>
        </form>
      </Card>
    </div>
  );
}
