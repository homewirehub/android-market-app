"use client";

// Interactive intake form. Toggles inline "new customer" fields when the
// technician chooses to register a customer that isn't in the system yet.
import { useState } from "react";
import { Button, Field, fieldClass } from "@/components/ui";
import {
  PRIORITY_ORDER,
  STATUS_ORDER,
  priorityLabel,
  statusLabel,
} from "@/lib/labels";
import { createIntakeOrder } from "../actions";

type Option = { id: string; name: string };

export function IntakeForm({
  customers,
  technicians,
}: {
  customers: Option[];
  technicians: Option[];
}) {
  const [customerChoice, setCustomerChoice] = useState("new");
  const isNew = customerChoice === "new";

  return (
    <form action={createIntakeOrder} className="space-y-7 p-6 sm:p-8">
      {/* Customer */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Cliente
        </legend>
        <Field label="Cliente" htmlFor="customerId">
          <select
            id="customerId"
            name="customerId"
            value={customerChoice}
            onChange={(e) => setCustomerChoice(e.target.value)}
            className={fieldClass}
          >
            <option value="new">➕ Nuevo cliente</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        {isNew ? (
          <div className="space-y-4 rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
            <Field label="Nombre completo" htmlFor="newCustomerName" required>
              <input id="newCustomerName" name="newCustomerName" className={fieldClass} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Teléfono" htmlFor="newCustomerPhone">
                <input
                  id="newCustomerPhone"
                  name="newCustomerPhone"
                  className={fieldClass}
                  placeholder="+591 7..."
                />
              </Field>
              <Field label="Correo" htmlFor="newCustomerEmail">
                <input
                  id="newCustomerEmail"
                  name="newCustomerEmail"
                  type="email"
                  className={fieldClass}
                />
              </Field>
            </div>
            <Field label="Dirección" htmlFor="newCustomerAddress">
              <input id="newCustomerAddress" name="newCustomerAddress" className={fieldClass} />
            </Field>
          </div>
        ) : null}
      </fieldset>

      {/* Device */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Equipo
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
          <Field label="N.º de serie" htmlFor="serialNumber">
            <input id="serialNumber" name="serialNumber" className={fieldClass} />
          </Field>
          <Field label="Marca" htmlFor="brand" required>
            <input id="brand" name="brand" required className={fieldClass} placeholder="HP, Samsung…" />
          </Field>
          <Field label="Modelo" htmlFor="model" required>
            <input id="model" name="model" required className={fieldClass} />
          </Field>
        </div>
      </fieldset>

      {/* Repair */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Reparación
        </legend>
        <Field label="Descripción del problema" htmlFor="description" required>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            className={fieldClass}
            placeholder="Falla reportada y observaciones de recepción…"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Prioridad" htmlFor="priority">
            <select id="priority" name="priority" className={fieldClass} defaultValue="MEDIUM">
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>
                  {priorityLabel(p)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estado inicial" htmlFor="status">
            <select id="status" name="status" className={fieldClass} defaultValue="NEW">
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Técnico" htmlFor="technicianId">
            <select id="technicianId" name="technicianId" className={fieldClass} defaultValue="">
              <option value="">Sin asignar</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <Button type="submit" className="w-full py-2.5">
        Registrar orden
      </Button>
    </form>
  );
}
