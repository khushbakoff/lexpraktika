"use client";

import SelectMark from "@/components/ui/SelectMark";
import { useState } from "react";
import type { Step } from "@/lib/scenario-schema";
import { scoreDeadline, type StepResult } from "@/lib/scoring";

type Props = { step: Extract<Step, { type: "deadline-pick" }>; onSubmit: (r: StepResult) => void };

export default function DeadlineInput({ step, onSubmit }: Props) {
  const graded = step.options.length > 0 && step.correct !== "";
  const [choice, setChoice] = useState("");
  const [note, setNote] = useState("");
  const ready = graded ? choice !== "" : note.trim() !== "";

  return (
    <div className="flex flex-col gap-3">
      {graded ? (
        <div role="radiogroup" aria-label={step.title} className="flex flex-col gap-2">
          {step.options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={choice === o.id}
              onClick={() => setChoice(o.id)}
              className="glass flex min-h-[52px] items-center gap-3 rounded-2xl px-4 text-left font-medium"
            >
              <span className="flex-1">{o.label}</span>
              <SelectMark on={choice === o.id} />
            </button>
          ))}
        </div>
      ) : (
        <>
          <p className="rounded-2xl bg-warn/15 px-4 py-2 text-xs text-warn">
            To&apos;g&apos;ri muddatlar yurist tasdiqlamagan, shuning uchun bu bosqich ballanmaydi. Fikringizni yozing.
          </p>
          <label className="text-sm font-semibold" htmlFor="deadline-note">
            Qaysi muddatlarda murojaat qilish kerak deb o&apos;ylaysiz?
          </label>
          <textarea
            id="deadline-note"
            rows={4}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-2xl border border-soft/30 bg-white/40 p-3 text-base text-text dark:bg-white/10"
          />
        </>
      )}
      <button
        type="button"
        disabled={!ready}
        onClick={() => onSubmit(scoreDeadline(step, choice, note.trim()))}
        className="min-h-[52px] rounded-2xl bg-accent px-5 text-base font-semibold text-[var(--accent-contrast)] shadow-[0_6px_18px_color-mix(in_srgb,var(--accent)_30%,transparent)] disabled:opacity-40"
      >
        Yakunlash
      </button>
    </div>
  );
}
