// Success page shown after a repair request is created. Displays the order code.
import { Card, LinkButton } from "@/components/ui";
import { CheckIcon } from "@/components/icons";

export default async function SolicitudExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <Card>
        <div className="space-y-5 p-8 text-center sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-500">
            <CheckIcon width={30} height={30} />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            ¡Solicitud registrada!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Su orden de reparación fue creada correctamente. Guarde este código para
            dar seguimiento al estado:
          </p>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-mono text-xl font-semibold tracking-wide text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-100">
            {code ?? "—"}
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <LinkButton
              href={`/status?code=${encodeURIComponent(code ?? "")}`}
              variant="primary"
            >
              Consultar estado
            </LinkButton>
            <LinkButton href="/solicitar" variant="secondary">
              Nueva solicitud
            </LinkButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
