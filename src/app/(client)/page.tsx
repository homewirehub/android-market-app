// Client landing (inicio). Explains the shop, the services, how the app works,
// and drives the two customer actions: request a repair or track one.
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui";
import {
  WrenchIcon,
  SearchIcon,
  ArrowRightIcon,
  PhoneIcon,
  BatteryIcon,
  PlugIcon,
  ShieldIcon,
  CodeIcon,
  LockOpenIcon,
  SparklesIcon,
  StethoscopeIcon,
  ClipboardIcon,
  CheckIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

const SERVICES = [
  { icon: <PhoneIcon width={22} height={22} />, name: "Cambio de pantalla" },
  { icon: <BatteryIcon width={22} height={22} />, name: "Cambio de batería" },
  { icon: <PlugIcon width={22} height={22} />, name: "Pin / módulo de carga" },
  { icon: <ShieldIcon width={22} height={22} />, name: "Cambio de tapa" },
  { icon: <CodeIcon width={22} height={22} />, name: "Flasheo / software" },
  { icon: <LockOpenIcon width={22} height={22} />, name: "Liberación de operador" },
  { icon: <SparklesIcon width={22} height={22} />, name: "Limpieza interna" },
  { icon: <StethoscopeIcon width={22} height={22} />, name: "Diagnóstico técnico" },
];

const STEPS = [
  {
    icon: <ClipboardIcon width={22} height={22} />,
    title: "1. Registra tu equipo",
    body: "En el taller o desde aquí: anotamos tu celular, los accesorios y la falla reportada.",
  },
  {
    icon: <SearchIcon width={22} height={22} />,
    title: "2. Recibe tu código y QR",
    body: "Te entregamos un código (REP-2026-…) y un código QR para dar seguimiento.",
  },
  {
    icon: <CheckIcon width={22} height={22} />,
    title: "3. Sigue el estado en línea",
    body: "Consulta cuándo está en diagnóstico, en reparación o listo para entrega, y su costo.",
  },
];

export default async function ClientHomePage() {
  const [repaired, customers] = await Promise.all([
    prisma.repairOrder.count({ where: { status: "DELIVERED" } }),
    prisma.customer.count(),
  ]);

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
            Servicio técnico de celulares · Rurrenabaque, Beni
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            Reparamos tu celular, tú sigues cada paso.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-zinc-600 dark:text-zinc-400">
            Pantalla, batería, carga, software y más. Registra tu reparación y
            consulta el estado en línea cuando quieras — sin llamadas, sin filas.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/solicitar" variant="primary" className="px-5 py-2.5">
              <WrenchIcon width={18} height={18} />
              Solicitar reparación
            </LinkButton>
            <LinkButton href="/status" variant="secondary" className="px-5 py-2.5">
              <SearchIcon width={18} height={18} />
              Consultar estado
            </LinkButton>
          </div>

          {/* Real stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div>
              <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                +{repaired}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Equipos reparados</div>
            </div>
            <div className="hidden h-10 w-px bg-zinc-200 sm:block dark:bg-zinc-800" />
            <div>
              <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                +{customers}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Clientes atendidos</div>
            </div>
            <div className="hidden h-10 w-px bg-zinc-200 sm:block dark:bg-zinc-800" />
            <div>
              <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                100%
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Seguimiento en línea</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            ¿Qué reparamos?
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Atención especializada para celulares de todas las marcas.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-500">
                {s.icon}
              </span>
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{s.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              ¿Cómo funciona?
            </h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Tres pasos, del ingreso a la entrega.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.title} className="text-center sm:text-left">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white sm:mx-0">
                  {s.icon}
                </span>
                <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl"
          />
          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              ¿Tu celular necesita reparación?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-zinc-600 dark:text-zinc-400">
              Regístralo en menos de un minuto y recibe tu código de seguimiento.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <LinkButton href="/solicitar" variant="primary" className="px-5 py-2.5">
                Solicitar reparación
                <ArrowRightIcon width={18} height={18} />
              </LinkButton>
              <LinkButton href="/status" variant="secondary" className="px-5 py-2.5">
                Ya tengo un código
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
