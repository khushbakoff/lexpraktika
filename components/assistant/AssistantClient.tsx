"use client";

import { aiHeaders } from "@/lib/ui/ai-privacy";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronRight, Scale, Send, ShieldAlert, Sparkles } from "lucide-react";
import type { Source } from "@/lib/content/scenario-schema";
import SourceSheet from "@/components/ui/SourceSheet";

type Candidate = { ref: number; act: string; article: string; heading: string; url: string; anchor: string; snippet: string };
type Ai = { mode: "ask" | "answer"; answer: string; situation?: string; steps?: string[]; deadline?: string; missing?: string[]; notFound: boolean; matches: { ref: number; why: string; quote: string }[]; questions: { q: string; options: string[] }[] };
type Reply = { candidates: Candidate[]; ai: Ai | null; aiError: string | null; indexedAt: string };
type Msg = { id: number; role: "user"; text: string } | { id: number; role: "assistant"; text: string; kind?: "ask" | "answer"; reply?: Reply; error?: boolean };

const EXAMPLES = [
  "Ish beruvchi 3 oydan beri ish haqini to'lamayapti",
  "Ijarachi uch oy ijara haqini to'lamadi",
  "Ota farzandiga aliment to'lamayapti",
  "Sifatsiz telefon sotib oldim, do'kon qaytarib olmayapti",
];

const toSource = (c: Candidate, quote = ""): Source => ({
  act: c.act,
  article: c.article,
  url: c.url,
  anchor: c.anchor,
  quote,
  heading: c.heading,
  text: quote && c.snippet.includes(quote) ? c.snippet.replace(quote, `⟦${quote}⟧`) : c.snippet,
});

function ArticleRow({ c, why, onOpen }: { c: Candidate; why?: string; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="glass flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-soft">{c.act}</p>
        <p className="text-sm font-semibold leading-snug">{c.heading}</p>
        {why && <p className="mt-1 text-sm text-soft">{why}</p>}
      </div>
      <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-soft" />
    </button>
  );
}

/** Aniqlashtiruvchi savollar: variantlar faqat belgilanadi, "Javoblarni yuborish" bosilgandagina bitta xabar bo'lib ketadi. */
function AskQuestions({ ai, onAnswer, locked }: { ai: Ai; onAnswer: (t: string) => void; locked: boolean }) {
  const [picked, setPicked] = useState<(string | null)[]>(() => ai.questions.map(() => null));
  const [sent, setSent] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const count = picked.filter(Boolean).length;
  const off = locked || sent;
  // Variant tanlangach "Javoblarni yuborish" tugmasi pastdagi yozish paneli ostida qolib ketmasin
  useEffect(() => {
    if (count > 0) btnRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [count]);
  const toggle = (i: number, o: string) => setPicked((p) => p.map((v, k) => (k === i ? (v === o ? null : o) : v)));
  const submit = () => {
    const parts = picked.map((v, i) => (v ? `${i + 1}) ${v}` : null)).filter(Boolean);
    if (parts.length === 0) return;
    setSent(true);
    onAnswer(parts.join("; "));
  };
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[15px] leading-relaxed">{ai.answer}</p>
      {ai.questions.map((q, i) => (
        <div key={i} className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{i + 1}. {q.q}</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={q.q}>
            {q.options.map((o) => {
              const on = picked[i] === o;
              return (
                <button
                  key={o}
                  type="button"
                  aria-pressed={on}
                  disabled={off}
                  onClick={() => toggle(i, o)}
                  className="glass flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm disabled:opacity-60"
                >
                  {on && <Check size={15} strokeWidth={3} aria-hidden="true" />}
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!off && (
        <button
          type="button"
          ref={btnRef}
          disabled={count === 0}
          onClick={submit}
          className="min-h-[48px] scroll-mb-44 rounded-2xl bg-accent px-5 text-sm font-semibold text-[var(--accent-contrast)] disabled:opacity-45"
        >
          {count === 0 ? "Variantni tanlang" : `Javoblarni yuborish (${count}/${ai.questions.length})`}
        </button>
      )}
      {!off && <p className="text-xs text-soft">Variantlarni tanlab, pastdagi tugma bilan yuboring. Yoki o&apos;zingiz yozing.</p>}
    </div>
  );
}

function ReplyView({ reply, onOpen, onPick, disabled }: { reply: Reply; onOpen: (s: Source) => void; onPick: (t: string) => void; disabled: boolean }) {
  const { ai, candidates } = reply;
  if (ai?.mode === "ask") return <AskQuestions ai={ai} onAnswer={onPick} locked={disabled} />;
  const matched = new Set(ai?.matches.map((m) => m.ref));
  const others = candidates.filter((c) => !matched.has(c.ref));
  return (
    <div className="flex flex-col gap-2">
      {ai ? (
        <>
          {ai.situation && (
            <div className="rounded-xl bg-accent/10 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-soft">Sizning holatingiz</p>
              <p className="text-[15px] leading-relaxed">{ai.situation}</p>
            </div>
          )}
          <p className="text-[15px] leading-relaxed">{ai.answer}</p>
          {ai.steps && ai.steps.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-soft">Nima qilish mumkin</p>
              <ol className="list-decimal space-y-1 pl-5 text-[15px] leading-relaxed">
                {ai.steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
            </div>
          )}
          {ai.deadline && (
            <p className="rounded-xl bg-warn/15 px-3 py-2 text-sm">
              <span className="font-semibold">Muddat: </span>
              {ai.deadline}
            </p>
          )}
          {ai.missing && ai.missing.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-soft">Aniqlash kerak</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-soft">
                {ai.missing.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
          {ai.notFound && <p className="text-sm text-warn">Mos modda aniq topilmadi. Savolni boshqacha yozing yoki yurist bilan maslahatlashing.</p>}
          {ai.matches.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-soft">Shu holatga mos moddalar</p>
              {ai.matches.map((m) => {
                const c = candidates[m.ref];
                return c ? <ArticleRow key={m.ref} c={c} why={m.why} onOpen={() => onOpen(toSource(c, m.quote))} /> : null;
              })}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-soft">{reply.aiError ?? "Mos moddalar topilmadi. Savolni boshqacha yozib ko'ring."}</p>
      )}
      {others.length > 0 && (
        <details>
          <summary className="min-h-[44px] cursor-pointer py-2 text-sm font-semibold text-accent">
            {ai ? "Boshqa topilgan moddalar" : "Topilgan moddalar (qidiruv)"} ({others.length})
          </summary>
          <div className="flex flex-col gap-2">
            {others.map((c) => (
              <ArticleRow key={c.ref} c={c} onOpen={() => onOpen(toSource(c))} />
            ))}
          </div>
        </details>
      )}
      <div role="note" className="flex items-start gap-2 rounded-xl border border-warn/40 bg-warn/10 px-3 py-2.5 text-sm">
        <ShieldAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-warn" />
        <p>
          <span className="font-semibold">Qaror qilishdan oldin tekshiring.</span> AI xato qilishi mumkin. Moddani ochib, Lex.uz dagi matnni o&apos;zingiz o&apos;qing va muhim ish uchun yurist bilan maslahatlashing.
        </p>
      </div>
      <p className="text-xs text-soft">Lex.uz, {reply.indexedAt} holatiga. O&apos;quv yordamchisi, yuridik maslahat emas.</p>
    </div>
  );
}

/** Huquqiy yordamchi (chat): holatni yozasiz, u Lex.uz moddalari ichidan mos modda va qismni ko'rsatadi; davom savollar beriladi. */
export default function AssistantClient() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<Source | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  // Yozilgan matn ko'paysa maydon o'zi kengayadi (ko'pi bilan ~5 qator), yuborilgach qayta qisqaradi
  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [text]);
  const msgsRef = useRef<Msg[]>([]);
  useEffect(() => {
    msgsRef.current = msgs;
  }, [msgs]);
  const nextId = useRef(1);
  const lastAssistantId = [...msgs].reverse().find((m) => m.role === "assistant")?.id;

  useEffect(() => {
    if (msgs.length > 0) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs.length, busy]);

  const send = async (raw: string) => {
    const question = raw.trim();
    if (question.length < 3 || busy) return;
    const history = msgsRef.current.slice(-8).map((m) => ({ role: m.role, text: m.text.slice(0, 1200), ...(m.role === "assistant" && m.kind ? { kind: m.kind } : {}) }));
    // Oxirgi javobdagi nomzod moddalar: davom savolda xuddi shular ustida ishlash uchun
    const lastReply = [...msgsRef.current].reverse().map((m) => (m.role === "assistant" ? m.reply : undefined)).find(Boolean);
    const prior = (lastReply?.candidates ?? []).slice(0, 8).map((c) => ({ u: c.url, id: c.anchor }));
    setMsgs((m) => [...m, { id: nextId.current++, role: "user", text: question }]);
    setText("");
    setBusy(true);
    try {
      const r = await fetch("/api/lex-ask", { method: "POST", headers: aiHeaders(), body: JSON.stringify({ question, history, prior }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Javob olib bo'lmadi");
      const ai = data.ai as Ai | null;
      const summary = ai?.mode === "ask" ? `${ai.answer}\n${ai.questions.map((q, i) => `${i + 1}. ${q.q}`).join("\n")}` : (ai?.answer ?? "Qidiruv natijalari");
      setMsgs((m) => [...m, { id: nextId.current++, role: "assistant", text: summary, kind: ai?.mode, reply: data }]);
    } catch (e) {
      setMsgs((m) => [...m, { id: nextId.current++, role: "assistant", text: e instanceof Error ? e.message : "Internet yo'q", error: true }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Scale size={26} strokeWidth={1.75} aria-hidden="true" className="text-accent" /> Huquqiy yordamchi
        </h1>
        <p className="text-sm text-soft">Holatni yozing. Avval kerakli savollarni beraman, keyin Lex.uz qonunlaridan qaysi moddaga va qaysi qismga to&apos;g&apos;ri kelishini ko&apos;rsataman.</p>
      </header>

      <p className="rounded-2xl bg-warn/15 px-3 py-2 text-xs text-warn">
        Ism, manzil va boshqa shaxsiy ma&apos;lumotni yozmang. Telefon, pasport va karta raqami avtomatik yashiriladi.
      </p>

      {msgs.length === 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-soft">Namunalar</p>
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" onClick={() => void send(ex)} className="glass min-h-[48px] rounded-2xl px-4 py-2 text-left text-sm">
              {ex}
            </button>
          ))}
        </div>
      )}

      <ul className="flex flex-col gap-3" aria-live="polite" aria-label="Suhbat">
        {msgs.map((m) => (
          <li key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            {m.role === "user" ? (
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[15px] text-[var(--accent-contrast)]">{m.text}</p>
            ) : (
              <div className="glass max-w-[95%] rounded-2xl rounded-bl-md px-4 py-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-soft">
                  <Sparkles size={13} aria-hidden="true" /> Yordamchi
                </p>
                {m.reply ? <ReplyView reply={m.reply} onOpen={setOpen} onPick={(t) => void send(t)} disabled={busy || m.id !== lastAssistantId} /> : <p className={`text-sm ${m.error ? "text-warn" : ""}`}>{m.text}</p>}
              </div>
            )}
          </li>
        ))}
        {busy && (
          <li className="flex justify-start">
            <p className="glass rounded-2xl rounded-bl-md px-4 py-3 text-sm text-soft">Lex.uz dan qidirilyapti…</p>
          </li>
        )}
      </ul>
      <div ref={endRef} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(text);
        }}
        className="input-dock sticky z-10 -mx-2 flex items-end gap-2 rounded-[26px] p-2"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 88px)" }}
      >
        <label htmlFor="ask-q" className="sr-only">Savolingiz</label>
        <textarea
          id="ask-q"
          ref={taRef}
          enterKeyHint="send"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(text);
            }
          }}
          rows={1}
          maxLength={800}
          placeholder={msgs.length ? "Davom savol yozing…" : "Holatingizni yozing…"}
          className="glass min-h-[52px] flex-1 resize-none overflow-y-auto rounded-2xl px-3 py-3.5 text-base leading-snug text-text placeholder:text-soft"
        />
        <button
          type="submit"
          disabled={busy || text.trim().length < 3}
          aria-label="Yuborish"
          className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl bg-accent text-[var(--accent-contrast)] disabled:opacity-50"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </form>

      {open && <SourceSheet source={open} situation={msgs.filter((m) => m.role === "user").at(-1)?.text} onClose={() => setOpen(null)} />}
    </div>
  );
}
