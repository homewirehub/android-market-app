// QR-code helpers. Pure-JS (the `qrcode` package), so it works fully offline.
import QRCode from "qrcode";

const OPTS = { margin: 1, width: 320 } as const;

// PNG data URL — for rendering an <img> in the browser (order detail page).
export function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, OPTS);
}

// PNG buffer — for embedding into the generated PDF receipt.
export async function qrPngBuffer(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, { ...OPTS, type: "png" });
}
