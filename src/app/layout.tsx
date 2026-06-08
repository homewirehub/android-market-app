import type { Metadata } from "next";
import "./globals.css";

// System fonts only — no next/font/google, so there is no network fetch at
// build or runtime. This keeps the app fully offline-capable.
export const metadata: Metadata = {
  title: "Android Market Reparación",
  description:
    "Sistema local de gestión para taller de reparación de electrónicos (Android Market).",
};

// Runs before paint to apply the saved/system theme and avoid a flash.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
