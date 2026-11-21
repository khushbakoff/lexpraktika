"use client";

import { Moon, Smartphone, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/ui/theme";

const OPTIONS: { id: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Yorug'", Icon: Sun },
  { id: "dark", label: "Qorong'i", Icon: Moon },
  { id: "system", label: "Tizim", Icon: Smartphone },
];

/** Mavzu tanlash: yorug', qorong'i yoki qurilma sozlamasi. Tanlov shu qurilmada saqlanadi. */
export default function ThemeToggle({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const [mode, setMode] = useTheme();
  return (
    <div role="radiogroup" aria-label="Mavzu" className={`glass flex gap-1 rounded-2xl p-1 ${className}`}>
      {OPTIONS.map(({ id, label, Icon }) => {
        const on = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setMode(id)}
            aria-label={label}
            title={label}
            className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-colors ${compact ? "w-11" : "flex-1 px-3"} ${
              on ? "bg-accent text-[var(--accent-contrast)]" : "text-text"
            }`}
          >
            <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
            {!compact && label}
          </button>
        );
      })}
    </div>
  );
}
