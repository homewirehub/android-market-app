// Client landing page. Hero + two primary actions: request or track a repair.
import Link from "next/link";
import { LinkButton } from "@/components/ui";
import { WrenchIcon, SearchIcon, ArrowRightIcon } from "@/components/icons";

const FEATURES = [
  {
    href: "/solicitar",
    icon: <WrenchIcon width={22} height={22} />,
    title: "Solicitar una reparación",
    body: "Complete sus datos y la descripción del problema. Recibirá un código de orden para dar seguimiento.",
    cta: "Comenzar solicitud",
  },
  {
    href: "/status",
    icon: <SearchIcon width={22} height={22} />,
    title: "Consultar estado",
    body: "Ingrese su código de orden (por ejemplo REP-2026-0001) para ver el estado actual y el historial.",
    cta: "Buscar mi orden",
  },
];

export default function ClientHomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl dark:bg-brand-500/10"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Taller de reparación · Android Market
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            Reparamos su equipo, usted sigue cada paso.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-zinc-600 dark:text-zinc-400">
            Laptops, teléfonos, tablets e impresoras. Registre su reparación en línea
            o en el taller y consulte el estado cuando quiera.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/solicitar" variant="primary" className="px-5 py-2.5">
              Solicitar reparación
              <ArrowRightIcon width={18} height={18} />
            </LinkButton>
            <LinkButton href="/status" variant="secondary" className="px-5 py-2.5">
              Consultar estado
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group rounded-2xl border border-zinc-200/80 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-500">
                {f.icon}
              </span>
              <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {f.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {f.body}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-500">
                {f.cta}
                <ArrowRightIcon
                  width={16}
                  height={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
