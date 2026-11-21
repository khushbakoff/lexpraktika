"use client";

import { useState } from "react";
import type { Step } from "@/lib/scenario-schema";
import { scoreForm, type StepResult } from "@/lib/scoring";
import GlassCard from "@/components/ui/GlassCard";

type Props = { step: Extract<Step, { type: "form" }>; onSubmit: (r: StepResult) => void };

export default function FormInput({ step, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const set = (id: string, v: string) => setValues((s) => ({ ...s, [id]: v }));
  const complete = step.fields.every((f) => (values[f.id] ?? "").trim() !== "");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-soft">Talabnoma maydonlarini to&apos;ldiring.</p>
      {step.fields.map((f) => (
        <GlassCard key={f.id} className="flex flex-col gap-2">
          <p className="font-semibold">{f.label}</p>
          {f.kind === "choice" ? (
            <div role="radiogroup" aria-label={f.label} className="flex flex-col gap-2">
              {f.options.map((o) => {
                const on = values[f.id] === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set(f.id, o.id)}
                    className={`min-h-[48px] rounded-xl border px-3 text-left text-sm ${
                      on ? "border-accent bg-accent/15 font-semibold" : "border-soft/30"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              inputMode="numeric"
              pattern="[0-9 ]*"
              placeholder="Masalan: 1 000 000"
              value={values[f.id] ?? ""}
              onChange={(e) => set(f.id, e.target.value)}
              className="min-h-[48px] rounded-xl border border-soft/30 bg-white/40 px-3 text-base text-text placeholder:text-soft dark:bg-white/10"
            />
          )}
        </GlassCard>
      ))}
      <p className="text-xs text-soft">Erkin matnli ariza va uni AI bilan baholash keyingi bosqichda qo&apos;shiladi.</p>
      <button
        type="button"
        disabled={!complete}
        onClick={() => onSubmit(scoreForm(step, values))}
        className="min-h-[52px] rounded-2xl bg-accent px-5 text-base font-semibold text-[var(--accent-contrast)] shadow-[0_6px_18px_color-mix(in_srgb,var(--accent)_30%,transparent)] disabled:opacity-40"
      >
        Arizani topshirish
      </button>
    </div>
  );
}
