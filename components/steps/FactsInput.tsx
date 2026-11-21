"use client";

import { aiHeaders } from "@/lib/ui/ai-privacy";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { Scenario, Step } from "@/lib/content/scenario-schema";
import { scoreFacts, type StepResult } from "@/lib/learning/scoring";
import GlassCard from "@/components/ui/GlassCard";
import Icon3D from "@/components/ui/Icon3D";

type Props = {
  scenario: Scenario;
  step: Extract<Step, { type: "client-chat" }>;
  onSubmit: (r: StepResult) => void;
};

type Turn = { role: "user" | "assistant"; text: string };

/**
 * Mijoz bilan suhbat. Erkin matn AI mijozga (server `/api/client-chat`) boradi,
 * tez savollar esa tayyor javob bilan ishlaydi (AI sozlanmagan yoki xato bo'lsa ham mashq to'xtamaydi).
 */
export default function FactsInput({ scenario, step, onSubmit }: Props) {
  const who = step.counterpart ?? scenario.client;
  const [asked, setAsked] = useState<string[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [aiFacts, setAiFacts] = useState<string[]>([]);
  const [proof, setProof] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiOff, setAiOff] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const remaining = step.questions.filter((q) => !asked.includes(q.id));
  const found = new Set([
    ...step.questions.filter((q) => asked.includes(q.id) && q.factId).map((q) => q.factId as string),
    ...aiFacts,
  ]);
  const foundRequired = step.requiredFactIds.filter((id) => found.has(id)).length;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, busy]);

  const ask = (q: (typeof step.questions)[number]) => {
    setAsked((a) => [...a, q.id]);
    setTurns((t) => [...t, { role: "user", text: q.text }, { role: "assistant", text: q.reply }]);
  };

  const send = async () => {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setError(null);
    setText("");
    const history = turns.slice(-16);
    setTurns((t) => [...t, { role: "user", text: message }]);
    try {
      const res = await fetch("/api/client-chat", {
        method: "POST",
        headers: aiHeaders(),
        body: JSON.stringify({ scenarioId: scenario.id, stepId: step.id, message, history, facts: aiFacts, proof }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; facts?: string[]; proof?: string; error?: string };
      if (res.status === 503) setAiOff(true);
      if (!res.ok || !data.reply) throw new Error(data.error || "Javob olinmadi");
      setTurns((t) => [...t, { role: "assistant", text: data.reply as string }]);
      setAiFacts(data.facts ?? []);
      setProof(data.proof ?? "");
    } catch (e) {
      // Xabar suhbatdan olib tashlanadi va matn qaytariladi: qayta yuborish mumkin.
      setTurns((t) => t.slice(0, -1));
      setText(message);
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    const r = scoreFacts(step, scenario, asked, aiFacts);
    // proof server action'ga boradi (imzoni tekshiradi), natija ekranida ko'rsatilmaydi.
    onSubmit({ ...r, answer: aiFacts.length > 0 ? { asked, facts: aiFacts, proof } : asked });
  };

  const bubble = (who: "user" | "assistant", body: string, key: string | number) =>
    who === "user" ? (
      <div
        key={key}
        className="ml-10 self-end rounded-2xl bg-accent px-3 py-2 text-sm text-[var(--accent-contrast)]"
      >
        {body}
      </div>
    ) : (
      <div key={key} className="flex items-start gap-2">
        <Icon3D name="profile" size={36} />
        <GlassCard className="flex-1 !rounded-2xl !p-3 text-sm">{body}</GlassCard>
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <Icon3D name="profile" size={36} />
        <GlassCard className="flex-1 !rounded-2xl !p-3 text-sm">
          <p className="mb-1 text-xs font-semibold text-soft">{who.persona}</p>
          {who.openingLine}
        </GlassCard>
      </div>

      {turns.map((t, i) => bubble(t.role, t.text, i))}

      {busy && (
        <p className="ml-12 text-xs text-soft" role="status">
          Mijoz yozmoqda…
        </p>
      )}
      <div ref={endRef} />

      <p className="text-xs text-soft">
        Aniqlangan muhim faktlar: {foundRequired} / {step.requiredFactIds.length}
      </p>

      {!aiOff && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="flex items-end gap-2"
        >
          <label htmlFor="client-msg" className="sr-only">
            Mijozga savol
          </label>
          <textarea
            id="client-msg"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            maxLength={400}
            rows={2}
            placeholder="Mijozga savol yozing…"
            className="glass min-h-[52px] flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={busy || text.trim().length === 0}
            aria-label="Yuborish"
            className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-accent text-[var(--accent-contrast)] disabled:opacity-40"
          >
            <Send size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </form>
      )}

      {error && (
        <p role="status" className="rounded-2xl bg-warn/15 px-4 py-2 text-xs text-warn">
          {error}. Tez savollardan foydalanishingiz mumkin.
        </p>
      )}

      {remaining.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-soft">
            {aiOff ? "Savol tanlang" : "Yoki tez savol tanlang"}
          </p>
          <p className="mb-2 text-xs text-soft">Faqat ish uchun kerakli savollarni bering. Keraksiz savol ballni kamaytiradi.</p>
          <div className="flex flex-col gap-2">
            {remaining.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => ask(q)}
                className="glass min-h-[48px] rounded-2xl px-4 py-2 text-left text-sm font-medium active:scale-[0.99]"
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={turns.length === 0 || busy}
        onClick={finish}
        className="mt-2 min-h-[52px] rounded-2xl bg-accent px-5 text-base font-semibold text-[var(--accent-contrast)] shadow-[0_6px_18px_color-mix(in_srgb,var(--accent)_30%,transparent)] disabled:opacity-40"
      >
        Suhbatni tugatish
      </button>
    </div>
  );
}
