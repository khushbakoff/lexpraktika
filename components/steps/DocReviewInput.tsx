"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import type { Step } from "@/lib/content/scenario-schema";
import { scoreDocReview, type StepResult } from "@/lib/learning/scoring";
import GlassCard from "@/components/ui/GlassCard";

type Props = { step: Extract<Step, { type: "doc-review" }>; onSubmit: (r: StepResult) => void };

/** "Xatoni top": hujjatdagi bandlarni bosib, xato deb o'ylaganlarini belgilash. */
export default function DocReviewInput({ step, onSubmit }: Props) {
  const [flagged, setFlagged] = useState<string[]>([]);
  const total = step.clauses.filter((c) => c.flawed).length;
  const toggle = (id: string) => setFlagged((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  return (
    <div className="flex flex-col gap-3">
      <GlassCard strong className="flex items-center gap-3">
        <Flag size={22} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-accent" />
        <p className="text-sm">
          Bu hujjatda <b>{total} ta xato</b> bor. Xato deb o&apos;ylagan bandlaringizni bosing. To&apos;g&apos;ri bandni belgilasangiz, ball kamayadi.
        </p>
      </GlassCard>

      <GlassCard className="flex flex-col gap-2">
        {step.docTitle && <p className="text-center text-sm font-bold uppercase tracking-wide">{step.docTitle}</p>}
        {step.clauses.map((c, i) => {
          const on = flagged.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(c.id)}
              className={`flex min-h-[48px] items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm active:scale-[0.99] ${
                on ? "border-warn bg-warn/15 font-semibold" : "border-soft/30"
              }`}
            >
              <span className="mt-0.5 w-5 shrink-0 text-xs text-soft">{i + 1}.</span>
              <span className="flex-1">{c.text}</span>
              {on && <Flag size={16} strokeWidth={2} aria-label="Xato deb belgilangan" className="mt-0.5 shrink-0 text-warn" />}
            </button>
          );
        })}
      </GlassCard>

      <p className="text-xs text-soft" role="status">
        Belgilangan: {flagged.length} / {total}
      </p>
      <button
        type="button"
        disabled={flagged.length === 0}
        onClick={() => onSubmit(scoreDocReview(step, flagged))}
        className="min-h-[52px] rounded-2xl bg-accent px-5 text-base font-semibold text-[var(--accent-contrast)] shadow-[0_6px_18px_color-mix(in_srgb,var(--accent)_30%,transparent)] disabled:opacity-40"
      >
        Tekshirish
      </button>
    </div>
  );
}
