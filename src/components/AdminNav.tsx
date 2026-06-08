"use client";

// Admin navigation with active-route highlighting. Rendered as a vertical
// sidebar on large screens and a horizontal bar on small screens.
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  GridIcon,
  ClipboardIcon,
  UsersIcon,
  DeviceIcon,
  BoxIcon,
  ChartIcon,
} from "@/components/icons";

const LINKS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/admin", label: "Panel", icon: <GridIcon /> },
  { href: "/admin/ordenes", label: "Órdenes", icon: <ClipboardIcon /> },
  { href: "/admin/clientes", label: "Clientes", icon: <UsersIcon /> },
  { href: "/admin/equipos", label: "Equipos", icon: <DeviceIcon /> },
  { href: "/admin/repuestos", label: "Repuestos", icon: <BoxIcon /> },
  { href: "/admin/reportes", label: "Reportes", icon: <ChartIcon /> },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ variant = "sidebar" }: { variant?: "sidebar" | "top" }) {
  const pathname = usePathname();

  if (variant === "top") {
    return (
      <nav className="flex gap-1 overflow-x-auto">
        {LINKS.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-500"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-500"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
