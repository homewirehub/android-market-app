// Shared UI kit. Neutral zinc surfaces + a single emerald (brand) accent.
// Light + dark variants. Designed for a clean, modern dashboard look.
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { RepairStatus } from "@prisma/client";
import { STATUS_DOT, statusLabel } from "@/lib/labels";

/* ---------- Headings ---------- */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ---------- Surfaces ---------- */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Buttons ---------- */

type ButtonVariant = "primary" | "secondary" | "ghost";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-500 shadow-sm shadow-brand-600/20",
  secondary:
    "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
};

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:opacity-50";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return (
    <button className={`${buttonBase} ${buttonStyles[variant]} ${className}`} {...props} />
  );
}

export function LinkButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return (
    <Link className={`${buttonBase} ${buttonStyles[variant]} ${className}`} {...props} />
  );
}

/* ---------- Badges ---------- */

export function StatusBadge({ status }: { status: RepairStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {statusLabel(status)}
    </span>
  );
}

/* ---------- Form controls ---------- */

export const fieldClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500";

export const labelClass =
  "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-0.5 text-brand-600">*</span> : null}
      </label>
      {children}
    </div>
  );
}

/* ---------- Table ---------- */

export function Table({ children }: { children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">{children}</table>
      </div>
    </Card>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th className="whitespace-nowrap bg-zinc-50/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
      {children}
    </th>
  );
}

export function Td({ children }: { children: ReactNode }) {
  return (
    <td className="border-t border-zinc-100 px-4 py-3 align-top text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
      {children}
    </td>
  );
}
