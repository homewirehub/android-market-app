// Spanish display labels for enums that are stored in English in the DB.
// Keep the enum keys in English (NEW, DIAGNOSIS, ...) but always render
// these labels in the UI, since the users are Spanish-speaking.
import type {
  RepairStatus,
  Priority,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

// Status labels follow the terminology of the academic proposal (Recibido,
// En reparación, Listo para entrega, Entregado, Cancelado).
export const STATUS_LABELS: Record<RepairStatus, string> = {
  NEW: "Recibido",
  DIAGNOSIS: "Diagnóstico",
  WAITING_FOR_PARTS: "Esperando repuestos",
  REPAIRING: "En reparación",
  COMPLETED: "Listo para entrega",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

// Ordered list of statuses (workflow order), handy for selects and dashboards.
export const STATUS_ORDER: RepairStatus[] = [
  "NEW",
  "DIAGNOSIS",
  "WAITING_FOR_PARTS",
  "REPAIRING",
  "COMPLETED",
  "DELIVERED",
  "CANCELLED",
];

// Dot color per status, used inside the (neutral) status badge.
export const STATUS_DOT: Record<RepairStatus, string> = {
  NEW: "bg-zinc-400",
  DIAGNOSIS: "bg-blue-500",
  WAITING_FOR_PARTS: "bg-amber-500",
  REPAIRING: "bg-indigo-500",
  COMPLETED: "bg-emerald-500",
  DELIVERED: "bg-brand-600",
  CANCELLED: "bg-red-500",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  QR: "QR",
  TRANSFER: "Transferencia",
};

export const PAYMENT_METHOD_ORDER: PaymentMethod[] = ["CASH", "QR", "TRANSFER"];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
};

export function paymentMethodLabel(m: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[m] ?? m;
}

export function paymentStatusLabel(s: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[s] ?? s;
}

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

// Short numeric date for ETAs (e.g. "15/06/2026").
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Cost in bolivianos (e.g. "250 Bs").
export function formatBs(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `${amount.toLocaleString("es-BO")} Bs`;
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
