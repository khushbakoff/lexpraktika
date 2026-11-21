"use client";

import { aiHeaders } from "@/lib/ai-privacy";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, RefreshCw, Sparkles, TriangleAlert, X } from "lucide-react";
import type { Source } from "@/lib/scenario-schema";

/** Iqtibos ⟦ ⟧ belgilari bilan ajratilgan matnni <mark> bilan ko'rsatadi. */
function Highlighted({ text }: { text: string }) {
  const parts = text.split(/(⟦[^⟧]*⟧)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("⟦") ? (
          <mark key={i} className="rounded bg-accent/25 px-0.5 font-semibold text-text">
            {p.slice(1, -1)}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

type LiveState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ok"; same: boolean; text: string; amendments: string[]; fetchedAt: string };
type AiState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ok"; issue: string; watch: string[]; changed: string };

/** Lex.uz dan hozirgi matnni olib, saqlangan iqtibos bilan solishtiradi; AI shu matnni oddiy tilda tushuntiradi. */
function LiveCheck({ source, situation }: { source: Source; situation: string }) {
  const [live, setLive] = useState<LiveState>({ kind: "idle" });
  const [ai, setAi] = useState<AiState>({ kind: "idle" });
  if (!source.anchor || !source.url.startsWith("https://lex.uz/")) return null;

  const check = async () => {
    setLive({ kind: "loading" });
    setAi({ kind: "idle" });
    try {
      const res = await fetch("/api/lex-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: source.url, anchor: source.anchor, quote: source.quote }),
      });
      const data = await res.json();
      if (!res.ok) return setLive({ kind: "error", message: data.error ?? "Tekshirib bo'lmadi" });
      if (data.status === "notfound") return setLive({ kind: "error", message: "Lex.uz da bu modda topilmadi. Sahifa o'zgargan bo'lishi mumkin." });
      setLive({ kind: "ok", same: data.status === "same", text: data.live.text, amendments: data.live.amendments, fetchedAt: data.live.fetchedAt });
    } catch {
      setLive({ kind: "error", message: "Internet yo'q yoki Lex.uz javob bermadi" });
    }
  };

  const explain = async () => {
    setAi({ kind: "loading" });
    try {
      const res = await fetch("/api/lex-explain", {
        method: "POST",
        headers: aiHeaders(),
        body: JSON.stringify({ url: source.url, anchor: source.anchor, act: source.act, situation }),
      });
      const data = await res.json();
      if (!res.ok) return setAi({ kind: "error", message: data.error ?? "AI javob bermadi" });
      setAi({ kind: "ok", ...data.explanation });
    } catch {
      setAi({ kind: "error", message: "AI bilan aloqa yo'q" });
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-soft/25 p-3">
      {live.kind !== "ok" && (
        <button
          type="button"
          onClick={() => void check()}
          disabled={live.kind === "loading"}
          className="glass flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold disabled:opacity-60"
        >
          <RefreshCw size={16} aria-hidden="true" className={live.kind === "loading" ? "animate-spin" : ""} />
          {live.kind === "loading" ? "Lex.uz dan olinyapti…" : "Lex.uz da hozirgi holatini tekshirish"}
        </button>
      )}
      {live.kind === "error" && <p role="alert" className="text-sm text-warn">{live.message}</p>}
      {live.kind === "ok" && (
        <>
          <p className={`flex items-start gap-2 text-sm font-semibold ${live.same ? "text-success" : "text-warn"}`}>
            {live.same ? <CheckCircle2 size={18} aria-hidden="true" className="shrink-0" /> : <TriangleAlert size={18} aria-hidden="true" className="shrink-0" />}
            {live.same ? "Matn Lex.uz dagi hozirgi matn bilan mos." : "Lex.uz dagi matn o'zgargan ko'rinadi. Pastdagi hozirgi matnni o'qing."}
          </p>
          <p className="text-xs text-soft">Tekshirildi: {new Date(live.fetchedAt).toLocaleString("uz-UZ")}</p>
          {!live.same && <div className="max-h-40 overflow-y-auto rounded-xl bg-black/5 p-2 text-sm text-soft dark:bg-white/5">{live.text}</div>}
          {live.amendments.length > 0 && (
            <details className="text-sm text-soft">
              <summary className="min-h-[44px] cursor-pointer py-2 font-semibold text-text">Tahrir izohlari ({live.amendments.length})</summary>
              <ul className="flex flex-col gap-1">
                {live.amendments.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </details>
          )}
          {ai.kind !== "ok" && (
            <button
              type="button"
              onClick={() => void explain()}
              disabled={ai.kind === "loading"}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-accent/20 px-4 text-sm font-semibold text-accent disabled:opacity-60"
            >
              <Sparkles size={16} aria-hidden="true" />
              {ai.kind === "loading" ? "AI o'qiyapti…" : "AI shu modda nimani hal qilishini tushuntirsin"}
            </button>
          )}
          {ai.kind === "error" && <p role="alert" className="text-sm text-warn">{ai.message}</p>}
          {ai.kind === "ok" && (
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-soft">AI tushuntirishi (Lex.uz matni asosida)</p>
              <p>{ai.issue}</p>
              {ai.watch.length > 0 && (
                <ul className="list-disc pl-5 text-soft">
                  {ai.watch.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
              <p className="text-soft">{ai.changed}</p>
              <p className="text-xs text-soft">AI xato qilishi mumkin. Aniq matn uchun yuqoridagi Lex.uz havolasini oching.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Pastdan chiqadigan oyna: qonun nomi, modda sarlavhasi va aynan kerakli qism matni. */
export default function SourceSheet({ source, onClose, situation }: { source: Source; onClose: () => void; situation?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const body = source.text || (source.quote ? `⟦${source.quote}⟧` : "");

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Qonuniy asos">
      <button type="button" aria-label="Yopish" onClick={onClose} className="absolute inset-0 bg-black/45" />
      <div
        className="glass glass-strong absolute inset-x-0 bottom-0 mx-auto flex max-h-[78dvh] w-full max-w-md flex-col gap-3 rounded-t-[28px] px-5 pt-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-soft/40" aria-hidden="true" />
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-soft">Qonuniy asos</p>
            <p className="text-sm text-soft">{source.act}</p>
            <h2 className="mt-1 text-base font-bold leading-snug">{source.heading || source.article}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="glass grid h-11 w-11 shrink-0 place-items-center rounded-full"
          >
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto rounded-2xl bg-black/5 p-3 text-[15px] leading-relaxed text-soft dark:bg-white/5">
          {body ? (
            body.split("\n").map((line, i) => (
              <p key={i} className={i > 0 ? "mt-2" : ""}>
                <Highlighted text={line} />
              </p>
            ))
          ) : (
            <p>Matn mavjud emas. Lex.uz da oching.</p>
          )}
        </div>

        <LiveCheck source={source} situation={situation ?? source.act} />

        {source.url.startsWith("https://") && (
          <a
            href={source.anchor ? `${source.url}#${source.anchor}` : source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-[var(--accent-contrast)]"
          >
            Lex.uz da shu moddani ochish <ExternalLink size={16} aria-hidden="true" />
          </a>
        )}
        <p className="text-center text-xs text-soft">Rasmiy matn Lex.uz dan olingan. Bu o&apos;quv mashqi, yuridik maslahat emas.</p>
      </div>
    </div>
  );
}
