"use client";

// Dark-mode toggle. Adds/removes the `dark` class on <html> and persists the
// choice in localStorage. The initial class is set by an inline script in the
// root layout to avoid a flash of the wrong theme on load.
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@/components/icons";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // ignore storage errors (e.g. private mode)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema claro u oscuro"
      title="Cambiar tema claro / oscuro"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {/* Render a neutral icon until mounted to avoid hydration mismatch. */}
      {mounted ? (
        isDark ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />
      ) : (
        <MoonIcon width={18} height={18} />
      )}
    </button>
  );
}
