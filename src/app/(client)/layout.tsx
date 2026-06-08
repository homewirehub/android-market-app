// Client-side shell. Public area where customers request and track repairs.
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WrenchIcon } from "@/components/icons";

const CLIENT_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/solicitar", label: "Solicitar reparación" },
  { href: "/status", label: "Consultar estado" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2 whitespace-nowrap">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
              <WrenchIcon width={18} height={18} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Android Market
              <span className="hidden font-normal text-zinc-400 lg:inline"> · Servicio Técnico</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {CLIENT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="hidden rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:inline-block"
            >
              Administración
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500">
        Android Market · Servicio técnico de celulares · Rurrenabaque, Beni · Funciona sin conexión
      </footer>
    </div>
  );
}
