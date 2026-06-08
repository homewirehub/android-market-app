// Technician intake form page. Loads existing customers + technicians so the
// staff can register a walk-in repair quickly (existing or new customer).
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, LinkButton } from "@/components/ui";
import { ArrowLeftIcon } from "@/components/icons";
import { IntakeForm } from "./IntakeForm";

export const dynamic = "force-dynamic";

export default async function NuevaOrdenPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const [customers, technicians] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.technician.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Registrar reparación"
        subtitle="Formulario de recepción para equipos que llegan al taller."
        actions={
          <LinkButton href="/admin/ordenes" variant="secondary">
            <ArrowLeftIcon width={18} height={18} />
            Volver
          </LinkButton>
        }
      />

      {error === "missing" ? (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300">
          Complete los campos obligatorios (*): cliente, equipo y descripción.
        </div>
      ) : null}

      <Card>
        <IntakeForm customers={customers} technicians={technicians} />
      </Card>
    </div>
  );
}
