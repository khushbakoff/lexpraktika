"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Step } from "@/lib/content/scenario-schema";
import { scoreDocuments, type StepResult } from "@/lib/learning/scoring";
import Icon3D from "@/components/ui/Icon3D";

type Props = { step: Extract<Step, { type: "document-pick" }>; onSubmit: (r: StepResult) => void };

export default function DocumentInput({ step, onSubmit }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-soft">{step.prompt || "Kerakli hujjatlarni belgilang (bir nechta bo'lishi mumkin)."}</p>
      <ul className="flex flex-col gap-2">
        {step.options.map((o) => {
          const on = selected.includes(o.id);
          return (
            <li key={o.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(o.id)}
                className="glass flex min-h-[60px] w-full items-center gap-3 rounded-2xl px-3 text-left transition-transform active:scale-[0.99]"
              >
                <Icon3D name="document" size={36} />
                <span className="flex-1 font-medium">{o.label}</span>
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full border ${
                    on ? "border-accent bg-accent text-[var(--accent-contrast)]" : "border-soft/40"
                  }`}
                >
                  {on && <Check size={16} strokeWidth={2.5} aria-hidden="true" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        disabled={selected.length === 0}
        onClick={() => onSubmit(scoreDocuments(step, selected))}
        className="mt-2 min-h-[52px] rounded-2xl bg-accent px-5 text-base font-semibold text-[var(--accent-contrast)] shadow-[0_6px_18px_color-mix(in_srgb,var(--accent)_30%,transparent)] disabled:opacity-40"
      >
        {step.submitLabel || "Hujjatlarni topshirish"}
      </button>
    </div>
  );
}
