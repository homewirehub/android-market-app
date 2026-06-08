// Admin-side shell: sidebar (lg+) + sticky topbar. Staff area to view and
// manage all repair orders.
import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WrenchIcon, ArrowLeftIcon } from "@/components/icons";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      {/* Sidebar (large screens) */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-zinc-200 bg-white px-3 py-4 dark:border-zinc-800 dark:bg-zinc-900 lg:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <WrenchIcon width={18} height={18} />
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Android Market
          </span>
        </Link>

        <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Administración
        </div>
        <AdminNav variant="sidebar" />

        <div className="mt-auto border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <ArrowLeftIcon width={18} height={18} />
            Ir al sitio del cliente
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            {/* Brand shown on small screens (sidebar is hidden) */}
            <Link href="/admin" className="flex items-center gap-2 lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <WrenchIcon width={18} height={18} />
              </span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Admin
              </span>
            </Link>
            <div className="hidden text-xs font-medium uppercase tracking-wider text-zinc-400 lg:block">
              Panel de administración
            </div>
            <ThemeToggle />
          </div>
          {/* Horizontal nav on small screens */}
          <div className="border-t border-zinc-200 px-3 py-2 dark:border-zinc-800 lg:hidden">
            <AdminNav variant="top" />
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
