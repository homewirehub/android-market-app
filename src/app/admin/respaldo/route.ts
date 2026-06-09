// Database backup / export. Streams the local SQLite file as a download so the
// shop can keep daily copies (USB stick, etc.). GET /admin/respaldo
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Resolve the SQLite file from DATABASE_URL ("file:./dev.db" is relative to the
// prisma/ directory).
function dbFilePath(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const rel = url.replace(/^file:/, "");
  return path.resolve(process.cwd(), "prisma", rel);
}

export async function GET() {
  try {
    // Flush any WAL pages into the main file so the copy is complete.
    try {
      await prisma.$queryRawUnsafe("PRAGMA wal_checkpoint(TRUNCATE);");
    } catch {
      // ignore — harmless if the database is not in WAL mode
    }

    const data = await readFile(dbFilePath());
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filename = `android-market-backup-${date}.db`;

    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(data.length),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("No se pudo generar el respaldo.", { status: 500 });
  }
}
