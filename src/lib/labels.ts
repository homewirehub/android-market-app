// Spanish display labels for enums that are stored in English in the DB.
// Keep the enum keys in English (NEW, DIAGNOSIS, ...) but always render
// these labels in the UI, since the users are Spanish-speaking.
import type { RepairStatus, Priority } from "@prisma/client";

export const STATUS_LABELS: Record<RepairStatus, string> = {
  NEW: "Nuevo",
  DIAGNOSIS: "Diagnóstico",
  WAITING_FOR_PARTS: "Esperando repuestos",
  REPAIRING: "En reparación",
  COMPLETED: "Completado",
  DELIVERED: "Entregado",
};

// Ordered list of statuses (workflow order), handy for selects and dashboards.
export const STATUS_ORDER: RepairStatus[] = [
  "NEW",
  "DIAGNOSIS",
  "WAITING_FOR_PARTS",
  "REPAIRING",
  "COMPLETED",
  "DELIVERED",
];

// Dot color per status, used inside the (neutral) status badge.
export const STATUS_DOT: Record<RepairStatus, string> = {
  NEW: "bg-zinc-400",
  DIAGNOSIS: "bg-blue-500",
  WAITING_FOR_PARTS: "bg-amber-500",
  REPAIRING: "bg-indigo-500",
  COMPLETED: "bg-emerald-500",
  DELIVERED: "bg-brand-600",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const PRIORITY_ORDER: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function statusLabel(status: RepairStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function priorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority] ?? priority;
}

// Format a date for Bolivian Spanish display (es-BO).
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-BO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Date + time for the order history timeline (e.g. "8 jun 2026, 12:25").
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("es-BO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
