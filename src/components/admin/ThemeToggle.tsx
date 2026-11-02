"use client";

import { useState, useSyncExternalStore } from "react";
import { saveServerTheme, setTheme, storedTheme, subscribeTheme, type Theme } from "@/lib/theme";

const options: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Terang", icon: "☀" },
  { value: "dark", label: "Gelap", icon: "☾" },
];

export default function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribeTheme, storedTheme, () => null);
  const [error, setError] = useState<string | null>(null);

  const choose = async (value: Theme) => {
    if (value === theme) return;
    const previous = theme ?? "light";
    setError(null);
    setTheme(value);
    try {
      await saveServerTheme(value);
    } catch (e) {
      setTheme(previous);
      setError(e instanceof Error ? e.message : "Gagal menyimpan tema");
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5 self-start">
      <div role="radiogroup" aria-label="Tema tampilan" className="flex gap-1 rounded-2xl bg-neu p-1.5 neu-inset-sm">
        {options.map((o) => {
          const active = theme === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choose(o.value)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                active ? "bg-neu text-navy-900 neu-raised-sm" : "text-slate-500 hover:text-navy-800"
              }`}
            >
              <span aria-hidden className={active ? "text-accent-500" : ""}>{o.icon}</span>
              {o.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">Berlaku juga untuk layar TV</p>
      {error && <p className="max-w-56 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}
