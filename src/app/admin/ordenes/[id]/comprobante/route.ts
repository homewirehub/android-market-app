// Generates a printable PDF repair receipt with an embedded QR code.
// GET /admin/ordenes/[id]/comprobante  ->  application/pdf
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { statusUrl } from "@/lib/appUrl";
import { qrPngBuffer } from "@/lib/qr";
import { statusLabel, formatBs, formatDateShort } from "@/lib/labels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Brand emerald (#059669) and neutral ink.
const BRAND = rgb(0.02, 0.588, 0.412);
const INK = rgb(0.09, 0.09, 0.11);
const MUTED = rgb(0.45, 0.45, 0.5);

// pdf-lib StandardFonts use WinAnsi. Normalize typographic characters to ASCII
// (incl. NBSP / narrow-NBSP via \s), then drop anything still unencodable so the
// document never fails on arbitrary customer input (emoji, etc.).
function pdfText(s: string | null | undefined): string {
  return (s ?? "-")
    .replace(/\s+/g, " ") // normalize whitespace incl.   and
    .replace(/[‐-―−·]/g, "-") // dashes + minus + middle dot
    .replace(/[‘’]/g, "'") // smart single quotes
    .replace(/[“”]/g, '"') // smart double quotes
    .replace(/[^\x20-\x7E\xA1-\xFF]/g, "?") // remaining unencodable
    .trim();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const order = await prisma.repairOrder.findUnique({
    where: { id },
    include: {
      device: { include: { customer: true } },
      parts: true,
      payment: true,
    },
  });
  if (!order) {
    return new Response("Orden no encontrada", { status: 404 });
  }

  const partsTotal = order.parts.reduce((s, p) => s + p.unitPriceBs * p.quantity, 0);
  const labor = order.laborCost ?? 0;
  const discount = order.payment?.discountBs ?? 0;
  const total = Math.max(0, labor + partsTotal - discount);

  const trackUrl = statusUrl(order.orderCode);

  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 56;
  let y = height - margin;

  // Top accent bar
  page.drawRectangle({ x: 0, y: height - 8, width, height: 8, color: BRAND });

  // Header
  page.drawText("Android Market", { x: margin, y: y - 14, size: 22, font: bold, color: INK });
  page.drawText("Servicio Técnico", { x: margin, y: y - 32, size: 12, font, color: MUTED });

  // QR (top-right)
  const qrPng = await doc.embedPng(await qrPngBuffer(trackUrl));
  const qrSize = 96;
  page.drawImage(qrPng, { x: width - margin - qrSize, y: y - qrSize - 6, width: qrSize, height: qrSize });
  page.drawText("Escanee para ver el estado", {
    x: width - margin - qrSize - 6,
    y: y - qrSize - 18,
    size: 7.5,
    font,
    color: MUTED,
  });

  y -= 64;
  // Divider
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.88, 0.88, 0.9),
  });
  y -= 28;

  // Code highlight
  page.drawText("CÓDIGO DE ORDEN", { x: margin, y, size: 8, font: bold, color: MUTED });
  y -= 22;
  page.drawText(pdfText(order.orderCode), { x: margin, y, size: 24, font: bold, color: BRAND });
  y -= 40;

  // Fields
  const fields: [string, string][] = [
    ["Cliente", pdfText(order.device.customer.name)],
    ["Teléfono", pdfText(order.device.customer.phone)],
    ["Equipo", pdfText(`${order.device.brand} ${order.device.model} (${order.device.type})`)],
    ["N.º de serie", pdfText(order.device.serialNumber)],
    ["Problema", pdfText(order.description)],
    ["Estado", pdfText(statusLabel(order.status))],
    ["Entrega estimada", pdfText(formatDateShort(order.estimatedReadyAt))],
    [
      "Fecha de ingreso",
      pdfText(order.createdAt.toLocaleString("es-BO", { dateStyle: "long", timeStyle: "short" })),
    ],
    ["Mano de obra", pdfText(formatBs(labor))],
    ["Repuestos", pdfText(formatBs(partsTotal))],
    ["Descuento", pdfText(formatBs(discount))],
    ["TOTAL", pdfText(formatBs(total))],
  ];

  const labelX = margin;
  const valueX = margin + 130;
  const maxValueWidth = width - margin - valueX;

  for (const [label, value] of fields) {
    page.drawText(label, { x: labelX, y, size: 10, font: bold, color: MUTED });
    const lines = wrapText(value, font, 11, maxValueWidth);
    for (const line of lines) {
      page.drawText(line, { x: valueX, y, size: 11, font, color: INK });
      y -= 16;
    }
    y -= 6; // gap between fields
  }

  // Footer
  const footerY = margin + 6;
  page.drawLine({
    start: { x: margin, y: footerY + 26 },
    end: { x: width - margin, y: footerY + 26 },
    thickness: 1,
    color: rgb(0.88, 0.88, 0.9),
  });
  page.drawText(pdfText(`Seguimiento en línea: ${trackUrl}`), {
    x: margin,
    y: footerY + 12,
    size: 8,
    font,
    color: MUTED,
  });
  page.drawText(
    pdfText(`Generado el ${new Date().toLocaleString("es-BO", { dateStyle: "long", timeStyle: "short" })}`),
    { x: margin, y: footerY, size: 8, font, color: MUTED },
  );

  const pdfBytes = await doc.save();
  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${order.orderCode}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

// Greedy word-wrap to fit a max pixel width at the given font size.
function wrapText(
  text: string,
  font: import("pdf-lib").PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : ["-"];
}
