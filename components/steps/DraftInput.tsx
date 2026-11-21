"use client";

import { aiHeaders } from "@/lib/ai-privacy";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Scenario, Step } from "@/lib/scenario-schema";
import { scoreDraft, scoreDraftSkipped, type StepResult } from "@/lib/scoring";
import GlassCard from "@/components/ui/GlassCard";

type Props = {
  scenario: Scenario;
  step: Extract<Step, { type: "draft" }>;
  onSubmit: (r: StepResult) => void;
};

type Item = { id: string; met: boolean; comment: string; quote: string };

/** "Hujjat yozing": erkin matn, AI mezonlar bo'yicha tekshiradi, talaba tuzatib qayta tekshirtirishi mumkin. */
export default function DraftInput({ scenario, step, onSubmit }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiOff, setAiOff] = useState(false);
  const [graded, setGraded] = useState<{ items: Item[]; proof: string; forText: string } | null>(null);

  const long = text.trim().length >= step.minChars;
  const stale = graded !== null && graded.forText !== text;

  const check = async () => {
    if (!long || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/grade-document", {
        method: "POST",
        headers: aiHeaders(),
        body: JSON.stringify({ scenarioId: scenario.id, stepId: step.id, text }),
      });
      const data = (await res.json().catch(() => ({}))) as { items?: Item[]; proof?: string; error?: string };
      if (res.status === 503) setAiOff(true);
      if (!res.ok || !data.items) throw new Error(data.error || "Tekshiruv bajarilmadi");
      setGraded({ items: data.items, proof: data.proof ?? "", forText: text });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (!graded) return;
    const met = graded.items.filter((i) => i.met).map((i) => i.id);
    const notes = Object.fromEntries(graded.items.map((i) => [i.id, i.comment]).filter(([, c]) => c));
    onSubmit(scoreDraft(step, met, notes, graded.proof));
  };

  const metCount = graded?.items.filter((i) => i.met).length ?? 0;

  return (
    <div className="flex flex-col gap-3">
      {step.prompt && (
        <GlassCard strong>
          <p className="text-sm">{step.prompt}</p>
        </GlassCard>
      )}

      <label htmlFor="draft-text" className="sr-only">
        Hujjat matni
      </label>
      <textarea
        id="draft-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={4000}
        rows={10}
        placeholder="Hujjat matnini shu yerga yozing…"
        className="glass min-h-[220px] w-full resize-y rounded-2xl px-4 py-3 text-sm outline-none"
      />
      <p className="text-xs text-soft">
        {text.trim().length} / kamida {step.minChars} belgi
      </p>

      {error && (
        <p role="status" className="rounded-2xl bg-warn/15 px-4 py-2 text-xs text-warn">
          {error}
        </p>
      )}

      {graded && (
        <GlassCard className="flex flex-col gap-2" aria-live="polite">
          <p className="text-sm font-bold">
            Mezonlar: {metCount} / {step.rubric.length} bajarilgan{stale ? " (matn o'zgargan, qayta tekshiring)" : ""}
          </p>
          {step.rubric.map((r) => {
            const it = graded.items.find((x) => x.id === r.id);
            return (
              <div key={r.id} className="flex items-start gap-2 text-sm">
                {it?.met ? (
                  <Check size={18} strokeWidth={2.25} aria-label="Bajarilgan" className="mt-0.5 shrink-0 text-success" />
                ) : (
                  <X size={18} strokeWidth={2.25} aria-label="Bajarilmagan" className="mt-0.5 shrink-0 text-warn" />
                )}
                <div>
                  <p className="font-semibold">{r.label}</p>
                  {it?.comment && <p className="text-soft">{it.comment}</p>}
                  {it?.quote && <p className="mt-1 rounded-lg bg-accent/10 px-2 py-1 text-xs italic">«{it.quote}»</p>}
                </div>
              </div>
            );
          })}
        </GlassCard>
      )}

      <button
        type="button"
        disabled={!long || busy || aiOff}
        onClick={() => void check()}
        className="min-h-[52px] rounded-2xl bg-accent px-5 text-base font-semibold text-[var(--accent-contrast)] shadow-[0_6px_18px_color-mix(in_srgb,var(--accent)_30%,transparent)] disabled:opacity-40"
      >
        {busy ? "Tekshirilmoqda…" : graded ? "Qayta tekshirish" : "AI bilan tekshirish"}
      </button>

      {graded && !stale && (
        <button type="button" onClick={submit} className="min-h-[52px] rounded-2xl glass px-5 text-base font-semibold">
          Natijani saqlash va davom etish
        </button>
      )}

      {(aiOff || error) && !graded && (
        <button
          type="button"
          onClick={() => onSubmit(scoreDraftSkipped(step))}
          className="min-h-[48px] rounded-2xl px-4 text-sm font-medium text-soft underline"
        >
          AI&apos;siz o&apos;tkazib yuborish (ball berilmaydi)
        </button>
      )}
    </div>
  );
}
