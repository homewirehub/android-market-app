// Resolves the public base URL used inside QR codes and receipts.
// Defaults to localhost. For a live demo where customers scan the QR with their
// phone, set APP_URL in .env to the laptop's LAN address (e.g. http://192.168.1.6:3000).
export function getAppUrl(): string {
  const raw = process.env.APP_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/+$/, ""); // strip trailing slashes
}

// Public status-tracking URL for a given order code.
export function statusUrl(orderCode: string): string {
  return `${getAppUrl()}/status?code=${encodeURIComponent(orderCode)}`;
}
