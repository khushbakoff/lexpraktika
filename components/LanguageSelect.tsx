"use client";

import { Check } from "lucide-react";
import { LOCALES, useLocale } from "@/lib/i18n/locale";

/** Til va yozuv tanlash. Nomlar o'z yozuvida turadi va tarjima qilinmaydi (data-no-i18n). */
export default function LanguageSelect() {
  const [locale, setLocale] = useLocale();
  return (
    <div role="radiogroup" aria-label="Til" data-no-i18n className="flex flex-col gap-2">
      {LOCALES.map((l) => {
        const on = locale === l.id;
        return (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setLocale(l.id)}
            className="glass flex min-h-[52px] items-center gap-3 rounded-2xl px-4 text-left"
          >
            <span className="flex flex-1 flex-col">
              <span className="font-semibold">{l.label}</span>
              <span className="text-xs text-soft">{l.note}</span>
            </span>
            <span
              aria-hidden="true"
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
                on ? "border-accent bg-accent text-[var(--accent-contrast)]" : "border-soft/50"
              }`}
            >
              {on && <Check size={14} strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
