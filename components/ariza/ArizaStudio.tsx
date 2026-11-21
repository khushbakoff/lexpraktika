"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, ArrowRight, BookOpen, Bold, Check, ChevronLeft, Download, IndentIncrease, Italic,
  Lock, Maximize2, MessageSquare, Minimize2, Monitor, PanelLeft, Redo2, RotateCcw, Send, Sparkles, Type, Underline, Undo2, X,
} from "lucide-react";
import { aiHeaders } from "@/lib/ui/ai-privacy";
import {
  ARIZA_TASKS, LEVEL_TITLE, PART_LABEL, newParts, totalChars,
  type Align, type ArizaResult, type ArizaTask, type LayoutCheck, type Para, type Part,
} from "@/lib/ariza";
import WordDoc, { parasToHtml, type FormatState, type WordDocHandle } from "@/components/ariza/WordDoc";

const KEY = "lexsim-ariza-v3";
/** Eski qoralamalar (abzatslar ro'yxati); yangisi HTML ko'rinishida saqlanadi. */
const DRAFT = "lexsim-ariza-draft-v3";
const DRAFT_HTML = "lexsim-ariza-html-v1";
const DOC = "lexsim-ariza-doc-v1";
type Store = Record<string, ArizaResult>;
type Drafts = Record<string, Para[]>;
type DocSettings = { size: number; spacing: number };
const EMPTY: Para = { text: "", align: "left", indent: false, bold: false };

// A4 varaq haqiqiy o'lchamning 88% ida: 21 sm = 700 px. Maydonlar rasmiy hujjatdagidek: chap 3 sm, o'ng 1,5 sm, yuqori/past 2 sm.
const PAGE_W = 700;
const PAGE_H = Math.round(PAGE_W * 1.4142);
const CM = PAGE_W / 21;
const MARGIN = { left: 3 * CM, right: 1.5 * CM, top: 2 * CM, bottom: 2 * CM };
const PT = (96 / 72) * (PAGE_W / ((21 / 2.54) * 96)); // 1 pt -> px shu masshtabda (14 pt ~ 16,5 px)
const FONT = '"Times New Roman", Times, var(--font-doc), serif';
const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const uzDate = (d: Date) => `${d.getFullYear()}-yil ${d.getDate()}-${MONTHS[d.getMonth()]}`;
/** Vaqt faqat tugma bosilganda olinadi (render paytida emas). */
const nowMs = () => Date.now();
const today = () => uzDate(new Date());

const read = <T,>(k: string, fb: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fb;
  } catch {
    return fb;
  }
};
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* saqlash mumkin emas */
  }
};

/** Yangi varaq: karkasli mashqda har qatorga ko'rsatma qo'yilgan bo'sh abzatslar, aks holda bitta bo'sh abzats. */
const blankSheet = (t: ArizaTask): Para[] => (t.scaffold?.length ? t.scaffold.map((hint) => ({ ...EMPTY, hint })) : [EMPTY]);

/** Namuna varag'idagi abzats ko'rinishi. */
function paraStyle(p: Para, doc: DocSettings): CSSProperties {
  return {
    textAlign: p.align,
    marginLeft: p.indent ? "50%" : 0,
    fontFamily: FONT,
    fontSize: doc.size * PT,
    lineHeight: doc.spacing * 1.15,
    fontWeight: p.bold ? 700 : 400,
    fontStyle: p.italic ? "italic" : "normal",
    textDecoration: p.underline ? "underline" : "none",
  };
}

/** Varaq ustidagi chizg'ich (sm), maydonlar kulrang. */
function Ruler() {
  const ticks = Array.from({ length: 43 }, (_, k) => k / 2);
  return (
    <div aria-hidden="true" className="relative h-[22px] shrink-0 border border-[#c8c6c4] bg-white font-sans text-[9px] text-[#605e5c]" style={{ width: PAGE_W }}>
      <div className="absolute inset-y-0 left-0 bg-[#e1dfdd]" style={{ width: MARGIN.left }} />
      <div className="absolute inset-y-0 right-0 bg-[#e1dfdd]" style={{ width: MARGIN.right }} />
      {ticks.map((t) => {
        const whole = Number.isInteger(t);
        const label = Math.abs(t - 3);
        return (
          <span key={t} className="absolute bottom-0 flex flex-col items-center" style={{ left: t * CM, transform: "translateX(-50%)" }}>
            {whole && label > 0 ? <span className="leading-none">{label}</span> : null}
            <span className={`w-px bg-[#8a8886] ${whole ? "h-1.5" : "h-1"}`} />
          </span>
        );
      })}
    </div>
  );
}

/** Word lentasidagi guruh (pastida nomi). */
function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 border-r border-[#e1dfdd] px-3 last:border-r-0 dark:border-white/10">
      <div className="flex items-center gap-1">{children}</div>
      <span className="text-[10px] text-[#605e5c] dark:text-soft">{label}</span>
    </div>
  );
}

type Letter = { organ: string; number: string; date: string; passed: boolean; reasons: string[] };
type Turn = { role: "user" | "assistant"; text: string; snippet?: string };
const AI_CHIPS = ["Arizamni ko'rib chiq", "Nima yetishmayapti?", "Keyingi qismni qanday yozaman?", "Shapka qanday joylashadi?"];

/** Ariza yozish ustaxonasi (kompyuter): Word oynasi, chapda topshiriq paneli, oxirida arizani organga yuborish. */
export default function ArizaStudio() {
  const [results, setResults] = useState<Store>({});
  const [legacy, setLegacy] = useState<Drafts>({});
  const [htmls, setHtmls] = useState<Record<string, string>>({});
  const [model, setModel] = useState<Record<string, Para[]>>({});
  const [loaded, setLoaded] = useState(false);
  const [doc, setDoc] = useState<DocSettings>({ size: 14, spacing: 1.5 });
  const [activeId, setActiveId] = useState(ARIZA_TASKS[0].id);
  const [fmt, setFmt] = useState<FormatState>({ bold: false, italic: false, underline: false, align: "left", indent: false, para: 0 });
  const [tops, setTops] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [pane, setPane] = useState<"task" | "review">("task");
  const [paneOpen, setPaneOpen] = useState(true);
  const [fileMenu, setFileMenu] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [showOk, setShowOk] = useState(false);
  const [lessonOpen, setLessonOpen] = useState<Record<string, boolean>>({});
  const [letter, setLetter] = useState<Letter | null>(null);
  const [focusNote, setFocusNote] = useState<number | null>(null);
  const [pages, setPages] = useState(1);
  const [aiOpen, setAiOpen] = useState(false);
  const [chats, setChats] = useState<Record<string, Turn[]>>({});
  const [aiInput, setAiInput] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isFs, setIsFs] = useState(false);
  // Masshtab: Word'dagi "Sahifa kengligi" (oynaga moslashadi) yoki qo'lda tanlangan
  const [fitZoom, setFitZoom] = useState(1);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const zoom = manualZoom ?? fitZoom;
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const docRef = useRef<WordDocHandle | null>(null);
  const chatEnd = useRef<HTMLDivElement | null>(null);

  // Brauzerning to'liq ekran rejimi (F11 kabi)
  useEffect(() => {
    const on = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const toggleFs = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  /* eslint-disable react-hooks/set-state-in-effect -- localStorage va ekran o'lchami faqat brauzerda o'qiladi */
  useEffect(() => {
    const r = read<Store>(KEY, {});
    setResults(r);
    setLegacy(read<Drafts>(DRAFT, {}));
    setHtmls(read<Record<string, string>>(DRAFT_HTML, {}));
    setDoc(read<DocSettings>(DOC, { size: 14, spacing: 1.5 }));
    const next = ARIZA_TASKS.find((t) => (r[t.id]?.score ?? 0) < t.passAt) ?? ARIZA_TASKS[ARIZA_TASKS.length - 1];
    setActiveId(next.id);
    // Keng ekranda AI yordamchi darhol ko'rinadi (topshiriq paneli har doim ochiq)
    setAiOpen(window.innerWidth >= 1600);
    setLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Varaq oyna kengligiga moslashadi (panellar ochilib-yopilganda ham)
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const fit = (el.clientWidth - 40) / (PAGE_W + 48);
      setFitZoom(Math.round(Math.min(1.4, Math.max(0.55, fit)) * 100) / 100);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Qoralama har o'zgarishda brauzerga saqlanadi
  useEffect(() => {
    if (loaded) write(DRAFT_HTML, htmls);
  }, [htmls, loaded]);

  // Sahifalar soni: matn A4 dan oshsa keyingi sahifa
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPages(Math.max(1, Math.ceil((el.scrollHeight - 2) / PAGE_H))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const passedAt = (i: number) => (results[ARIZA_TASKS[i].id]?.score ?? 0) >= ARIZA_TASKS[i].passAt;
  const unlocked = (i: number) => i === 0 || passedAt(i - 1) || passedAt(i);
  const task = ARIZA_TASKS.find((t) => t.id === activeId) as ArizaTask;
  const idx = ARIZA_TASKS.findIndex((t) => t.id === activeId);
  const paras = model[activeId] ?? blankSheet(task);
  const initialHtml = htmls[activeId] ?? parasToHtml(legacy[activeId]?.length ? legacy[activeId] : blankSheet(task));
  const res = results[activeId];
  const fresh = newParts(task);
  const lessonShown = task.lesson ? (lessonOpen[activeId] ?? (task.level <= 3 && !((res?.score ?? 0) >= task.passAt))) : false;
  const stale = Boolean(res && res.sig !== JSON.stringify(paras));
  const passed = res ? res.score >= task.passAt : false;
  const doneCount = ARIZA_TASKS.filter((t) => (results[t.id]?.score ?? 0) >= t.passAt).length;
  const chars = totalChars(paras);
  const enough = chars >= task.minChars;
  const words = paras.map((p) => p.text).join(" ").trim().split(/\s+/).filter(Boolean).length;
  const maxLevel = Math.max(...ARIZA_TASKS.filter((_, i) => unlocked(i)).map((t) => t.level));
  const shownLevels = [...new Set(ARIZA_TASKS.map((t) => t.level))].filter((l) => l <= maxLevel);
  const docName = `Ariza_${idx + 1}`;

  const fails = res?.layout.filter((c) => !c.ok) ?? [];
  const goods = res?.layout.filter((c) => c.ok) ?? [];
  const aiMissing = res?.aiOk ? res.items.filter((it) => !it.met) : [];
  const badParas = stale ? [] : [...new Set(fails.filter((c) => c.para !== undefined).map((c) => c.para as number))];
  // Word izohlari: har xato raqamlanadi, raqam varaq chetida ham ko'rinadi
  const marksOf = (i: number) => (stale ? [] : fails.map((c, n) => (c.para === i ? n + 1 : 0)).filter(Boolean));
  const partState = (k: Part): "ok" | "bad" | null => {
    if (!res || stale) return null;
    const cs = res.layout.filter((c) => c.part === k);
    if (!cs.length) return null;
    return cs.every((c) => c.ok) ? "ok" : "bad";
  };

  // ---------- Hujjat ----------
  const onDocChange = (next: Para[], html: string) => {
    setModel((m) => ({ ...m, [activeId]: next }));
    setHtmls((h) => ({ ...h, [activeId]: html }));
  };
  const setDocWith = (patch: Partial<DocSettings>) => {
    const d = { ...doc, ...patch };
    setDoc(d);
    write(DOC, d);
  };
  const resetSheet = () => {
    setFileMenu(false);
    if (chars > 0 && !window.confirm("Varaqdagi matn o'chiriladi. Davom etasizmi?")) return;
    docRef.current?.reset(blankSheet(task));
  };
  const downloadDoc = () => {
    setFileMenu(false);
    const body = (docRef.current?.html() ?? "").replace(/<p /g, '<p style="margin:0" ').replace(/style="margin:0" style="/g, 'style="margin:0;');
    const html = `<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${docName}</title><style>@page{size:21cm 29.7cm;margin:2cm 1.5cm 2cm 3cm}body{font-family:'Times New Roman';font-size:${doc.size}pt;line-height:${doc.spacing}}p{margin:0}</style></head><body>${body}</body></html>`;
    const url = URL.createObjectURL(new Blob(["﻿", html], { type: "application/msword" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docName}.doc`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const pick = (id: string) => {
    setActiveId(id);
    setShowExample(false);
    setShowOk(false);
    setError(null);
    setAiNote(null);
    setLetter(null);
    setPane("task");
  };

  // ---------- Tekshirish va yuborish ----------
  const runCheck = async (): Promise<ArizaResult | null> => {
    if (busy || !enough) return null;
    setBusy(true);
    setError(null);
    setAiNote(null);
    try {
      const r = await fetch("/api/ariza-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: activeId, paras: paras.map(({ text, align, indent, bold }) => ({ text, align, indent, bold })) }),
      });
      const data = (await r.json().catch(() => ({}))) as { layout?: LayoutCheck[]; items?: ArizaResult["items"] | null; aiNote?: string | null; score?: number; error?: string };
      if (!r.ok || !data.layout) throw new Error(data.error || "Tekshiruv bajarilmadi");
      const next: ArizaResult = { taskId: activeId, score: data.score ?? 0, layout: data.layout, items: data.items ?? [], aiOk: Boolean(data.items), at: nowMs(), sig: JSON.stringify(paras) };
      const all = { ...results, [activeId]: next };
      setResults(all);
      write(KEY, all);
      setAiNote(data.aiNote ?? null);
      setShowOk(false);
      return next;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi");
      return null;
    } finally {
      setBusy(false);
    }
  };
  const check = async () => {
    const r = await runCheck();
    if (r) {
      setPane("review");
      setPaneOpen(true);
    }
  };
  const submit = async () => {
    const r = await runCheck();
    if (!r || !task.organ) return;
    const ok = r.score >= task.passAt;
    const seed = [...(task.id + paras.map((p) => p.text).join(""))].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) % 9000, 7);
    setLetter({
      organ: task.organ,
      number: `01-${1000 + seed}`,
      date: today(),
      passed: ok,
      reasons: [...r.layout.filter((c) => !c.ok).map((c) => `${c.title}: ${c.detail}`), ...(r.aiOk ? r.items.filter((it) => !it.met).map((it) => it.label) : [])],
    });
  };
  // ---------- AI yordamchi (Word'dagi Copilot kabi) ----------
  const chat = chats[activeId] ?? [];
  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || aiBusy) return;
    const before = chat;
    const mine: Turn[] = [...before, { role: "user", text: question }];
    setChats((c) => ({ ...c, [activeId]: mine }));
    setAiInput("");
    setAiBusy(true);
    setAiError(null);
    setTimeout(() => chatEnd.current?.scrollIntoView({ block: "end" }), 0);
    try {
      const r = await fetch("/api/ariza-assist", {
        method: "POST",
        headers: aiHeaders(),
        body: JSON.stringify({
          taskId: activeId,
          question,
          paras: paras.map(({ text, align, indent, bold }) => ({ text, align, indent, bold })),
          history: before.slice(-6).map((t) => ({ role: t.role, text: t.snippet ? `${t.text}\n${t.snippet}` : t.text })),
        }),
      });
      const data = (await r.json().catch(() => ({}))) as { answer?: string; snippet?: string; error?: string };
      if (!r.ok || !data.answer) throw new Error(data.error || "AI javob bermadi");
      setChats((c) => ({ ...c, [activeId]: [...mine, { role: "assistant", text: data.answer as string, snippet: data.snippet || undefined }] }));
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setAiBusy(false);
      setTimeout(() => chatEnd.current?.scrollIntoView({ block: "end" }), 0);
    }
  };

  const openNote = (n: number) => {
    setPane("review");
    setPaneOpen(true);
    setFocusNote(n);
    setTimeout(() => document.getElementById(`izoh-${n}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 0);
  };

  // ---------- Ko'rinish ----------
  const rb = (on: boolean) =>
    `grid h-8 w-8 place-items-center rounded transition-colors ${on ? "bg-[#c7e0f4] text-[#0b3a6e] dark:bg-[#2f4b6e] dark:text-white" : "text-[#323130] hover:bg-black/[0.06] dark:text-[#e3e6ed] dark:hover:bg-white/10"}`;
  const sel = "h-8 rounded border border-[#c8c6c4] bg-white px-2 text-[13px] text-[#323130] dark:border-white/15 dark:bg-[#1e2025] dark:text-[#e3e6ed]";
  const keep = (e: { preventDefault: () => void }) => e.preventDefault(); // tugma bosilganda matndagi belgilash yo'qolmasin

  return (
    <>
      <div className="flex flex-col items-center gap-4 py-16 text-center lg:hidden">
        <Monitor size={48} strokeWidth={1.5} aria-hidden="true" className="text-accent" />
        <h1 className="text-xl font-bold">Ariza yozish kompyuter versiyasida</h1>
        <p className="max-w-xs text-sm text-soft">Katta ekranda hujjatni Word oynasida o&apos;zingiz tuzasiz va organga yuborasiz. Kompyuterda oching: lex.193-180-213-14.sslip.io</p>
        <Link href="/" className="glass rounded-2xl px-5 py-3 text-sm font-semibold text-accent">Bosh sahifaga</Link>
      </div>

      {/* Kompyuter: Word oynasi butun ekranni egallaydi (haqiqiy dastur kabi) */}
      <div className="fixed inset-0 z-[60] hidden bg-white lg:flex dark:bg-[#1e2025]">
        <h1 className="sr-only">Ariza yozish</h1>
        {/* ---------- Word oynasi ---------- */}
        <section aria-label="Word: ariza hujjati" className="flex h-full w-full flex-col overflow-hidden">
          {/* Sarlavha satri */}
          <div className="flex h-11 shrink-0 items-center gap-2 bg-[#185abd] px-3 text-white">
            <Link href="/" title="LexPraktika bosh sahifasi" className="flex h-8 items-center gap-1 rounded pl-1 pr-2 text-[13px] font-semibold hover:bg-white/15">
              <ChevronLeft size={16} aria-hidden="true" /> LexPraktika
            </Link>
            <span className="mx-1 h-5 w-px bg-white/30" aria-hidden="true" />
            <span className="grid h-6 w-6 place-items-center rounded-sm bg-white font-sans text-[13px] font-black text-[#185abd]" aria-hidden="true">W</span>
            <button type="button" onMouseDown={keep} onClick={() => docRef.current?.exec("undo")} title="Bekor qilish (Ctrl+Z)" aria-label="Bekor qilish" className="grid h-8 w-8 place-items-center rounded hover:bg-white/15"><Undo2 size={16} aria-hidden="true" /></button>
            <button type="button" onMouseDown={keep} onClick={() => docRef.current?.exec("redo")} title="Qaytarish (Ctrl+Y)" aria-label="Qaytarish" className="grid h-8 w-8 place-items-center rounded hover:bg-white/15"><Redo2 size={16} aria-hidden="true" /></button>
            <span className="ml-2 truncate text-[13px] font-semibold">{docName}.docx — Word</span>
            <span className="flex items-center gap-1 text-[11px] text-white/80"><Check size={12} aria-hidden="true" /> Avtomatik saqlandi</span>
            <span className="ml-auto flex items-center gap-2">
              {res && !stale && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${passed ? "bg-[#dff6dd] text-[#0e5c2f]" : "bg-[#fff4ce] text-[#6d4b00]"}`}>{res.score}%</span>
              )}
              <button type="button" onClick={check} disabled={busy || !enough} title={enough ? "Xatolarni tekshirish (qoralama)" : `Kamida ${task.minChars} belgi yozing`}
                className="h-8 rounded border border-white/50 px-3 text-[13px] font-semibold hover:bg-white/15 disabled:opacity-50">
                {busy ? "Tekshirilmoqda..." : "Tekshirish"}
              </button>
              {task.organ && (
                <button type="button" onClick={submit} disabled={busy || !enough} title={`Arizani yuborish: ${task.organ}`}
                  className="flex h-8 items-center gap-1.5 rounded bg-white px-3 text-[13px] font-bold text-[#185abd] hover:bg-[#eff6fc] disabled:opacity-50">
                  <Send size={14} aria-hidden="true" /> Yuborish
                </button>
              )}
              <button type="button" onClick={toggleFs} title={isFs ? "To'liq ekrandan chiqish" : "To'liq ekran"} aria-label={isFs ? "To'liq ekrandan chiqish" : "To'liq ekran"} className="grid h-8 w-8 place-items-center rounded hover:bg-white/15">
                {isFs ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
              </button>
            </span>
          </div>

          {/* Lenta: yorliqlar */}
          <div className="relative flex h-9 shrink-0 items-end gap-1 bg-[#f3f2f1] px-2 text-[13px] text-[#323130] dark:bg-[#26282d] dark:text-[#e3e6ed]">
            <button type="button" onClick={() => setFileMenu((v) => !v)} aria-expanded={fileMenu} className="rounded-t px-3 py-1.5 font-semibold text-[#185abd] hover:bg-black/5 dark:text-[#8aa6f5]">Fayl</button>
            <span className="rounded-t border-b-2 border-[#185abd] bg-white px-3 py-1.5 font-semibold dark:border-[#8aa6f5] dark:bg-[#1e2025]">Bosh</span>
            <span className="px-3 py-1.5 text-[#a19f9d]" title="Bu mashqda kerak emas">Qo&apos;yish</span>
            <span className="px-3 py-1.5 text-[#a19f9d]" title="Bu mashqda kerak emas">Maket</span>
            <button type="button" onClick={() => { setPane("review"); setPaneOpen(true); }} className="rounded-t px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">Ko&apos;rib chiqish</button>
            <button type="button" onClick={() => setPaneOpen((v) => !v)} className="rounded-t px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">Ko&apos;rinish</button>
            {fileMenu && (
              <div role="menu" className="absolute left-2 top-9 z-40 flex w-60 flex-col rounded-md border border-[#c8c6c4] bg-white py-1 text-[13px] shadow-xl dark:border-white/15 dark:bg-[#26282d]">
                <button type="button" role="menuitem" onClick={downloadDoc} className="flex items-center gap-2 px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"><Download size={15} aria-hidden="true" /> Yuklab olish (.doc, Word)</button>
                {task.example.length > 0 && (
                  <button type="button" role="menuitem" onClick={() => { setFileMenu(false); setShowExample(true); }} className="flex items-center gap-2 px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"><BookOpen size={15} aria-hidden="true" /> {task.exampleKind === "template" ? "Tuzilma namunasi" : "To'g'ri namuna"}</button>
                )}
                <button type="button" role="menuitem" onClick={resetSheet} className="flex items-center gap-2 px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"><RotateCcw size={15} aria-hidden="true" /> Varaqni tozalash</button>
              </div>
            )}
          </div>

          {/* Lenta: Bosh guruhlari. Belgilangan matnga yoki joriy abzatsga qo'llanadi (Word'dagidek) */}
          <div className="flex shrink-0 items-stretch border-b border-[#e1dfdd] bg-white py-1.5 dark:border-white/10 dark:bg-[#1e2025]">
            <Group label="Shrift">
              <select aria-label="Shrift" className={`${sel} w-40`} defaultValue="tnr"><option value="tnr">Times New Roman</option></select>
              <select aria-label="Shrift o'lchami" className={`${sel} w-16`} value={doc.size} onChange={(e) => setDocWith({ size: Number(e.target.value) })}>
                {[12, 13, 14].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="button" title="Qalin (Ctrl+B)" aria-label="Qalin" aria-pressed={fmt.bold} onMouseDown={keep} onClick={() => docRef.current?.exec("bold")} className={rb(fmt.bold)}><Bold size={16} aria-hidden="true" /></button>
              <button type="button" title="Kursiv (Ctrl+I)" aria-label="Kursiv" aria-pressed={fmt.italic} onMouseDown={keep} onClick={() => docRef.current?.exec("italic")} className={rb(fmt.italic)}><Italic size={16} aria-hidden="true" /></button>
              <button type="button" title="Tagiga chizish (Ctrl+U)" aria-label="Tagiga chizish" aria-pressed={fmt.underline} onMouseDown={keep} onClick={() => docRef.current?.exec("underline")} className={rb(fmt.underline)}><Underline size={16} aria-hidden="true" /></button>
              <button type="button" title="KATTA / kichik harflar" aria-label="Katta yoki kichik harflar" onMouseDown={keep} onClick={() => docRef.current?.toggleCase()} className={rb(false)}><Type size={16} aria-hidden="true" /></button>
            </Group>
            <Group label="Abzats">
              {([["left", "justifyLeft", AlignLeft, "Chapga tekislash"], ["center", "justifyCenter", AlignCenter, "Markazga tekislash"], ["right", "justifyRight", AlignRight, "O'ngga tekislash"], ["justify", "justifyFull", AlignJustify, "Ikki tomonga tekislash"]] as const).map(([a, cmd, Icon, label]) => (
                <button key={a} type="button" title={label} aria-label={label} aria-pressed={fmt.align === a && !fmt.indent} onMouseDown={keep} onClick={() => docRef.current?.exec(cmd)} className={rb(fmt.align === a && !fmt.indent)}><Icon size={16} aria-hidden="true" /></button>
              ))}
              <button type="button" title="Chekinish: abzatsni varaqning o'ng yarmiga surish (shapka uchun)" aria-label="O'ng yarmiga surish" aria-pressed={fmt.indent} onMouseDown={keep}
                onClick={() => docRef.current?.toggleIndent()} className={rb(fmt.indent)}><IndentIncrease size={16} aria-hidden="true" /></button>
              <select aria-label="Qator oralig'i" title="Qator oralig'i" className={`${sel} w-16`} value={doc.spacing} onChange={(e) => setDocWith({ spacing: Number(e.target.value) })}>
                {[1, 1.15, 1.5, 2].map((s) => <option key={s} value={s}>{String(s).replace(".", ",")}</option>)}
              </select>
            </Group>
            <Group label="Panel">
              <button type="button" onClick={() => setPaneOpen((v) => !v)} aria-pressed={paneOpen} className={`flex h-8 items-center gap-1.5 rounded px-2 text-[13px] ${paneOpen ? "bg-[#c7e0f4] text-[#0b3a6e] dark:bg-[#2f4b6e] dark:text-white" : "text-[#323130] hover:bg-black/[0.06] dark:text-[#e3e6ed] dark:hover:bg-white/10"}`}>
                <PanelLeft size={16} aria-hidden="true" /> Topshiriq
              </button>
            </Group>
            <Group label="AI">
              <button type="button" onClick={() => setAiOpen((v) => !v)} aria-pressed={aiOpen}
                className={`flex h-8 items-center gap-1.5 rounded px-2.5 text-[13px] font-semibold ${aiOpen ? "bg-gradient-to-r from-[#185abd] to-[#0f8f5f] text-white" : "text-[#185abd] ring-1 ring-[#185abd]/40 hover:bg-[#eff6fc] dark:text-[#8aa6f5] dark:ring-[#8aa6f5]/40 dark:hover:bg-white/10"}`}>
                <Sparkles size={16} aria-hidden="true" /> AI yordamchi
              </button>
            </Group>
          </div>

          <div className="relative flex min-h-0 flex-1">
            {/* ---------- Chap panel: topshiriq va izohlar ---------- */}
            {paneOpen && (
              <aside aria-label="Topshiriq va izohlar" className="flex w-[300px] shrink-0 flex-col border-r border-[#e1dfdd] bg-white xl:w-[330px] dark:border-white/10 dark:bg-[#1e2025]">
                <div role="tablist" aria-label="Panel" className="flex shrink-0 border-b border-[#e1dfdd] text-[13px] dark:border-white/10">
                  {([["task", "Topshiriq"], ["review", `Izohlar${res && !stale ? ` (${fails.length + aiMissing.length})` : ""}`]] as const).map(([k, label]) => (
                    <button key={k} type="button" role="tab" aria-selected={pane === k} onClick={() => setPane(k)}
                      className={`flex-1 px-3 py-2.5 font-semibold ${pane === k ? "border-b-2 border-[#185abd] text-[#185abd] dark:border-[#8aa6f5] dark:text-[#8aa6f5]" : "text-soft hover:text-text"}`}>{label}</button>
                  ))}
                  <button type="button" onClick={() => setPaneOpen(false)} aria-label="Panelni yopish" title="Panelni yopish" className="px-3 text-soft hover:text-text"><X size={16} aria-hidden="true" /></button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 text-sm">
                  {pane === "task" ? (
                    <>
                      {/* Mashqlar: faqat ochilgan darajalar, oldingisi bajarilsa keyingisi ochiladi */}
                      <div className="flex flex-col gap-2 border-b border-black/10 pb-3 dark:border-white/10">
                        <p className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-soft">
                          <span>Mashqlar</span>
                          <span>{doneCount} / {ARIZA_TASKS.length} bajarildi</span>
                        </p>
                        {shownLevels.map((lv) => (
                          <div key={lv} role="group" aria-label={LEVEL_TITLE[lv]} className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-accent">{LEVEL_TITLE[lv]}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {ARIZA_TASKS.map((t, i) => {
                                if (t.level !== lv) return null;
                                const open = unlocked(i);
                                const done = (results[t.id]?.score ?? 0) >= t.passAt;
                                return (
                                  <button key={t.id} type="button" disabled={!open} onClick={() => pick(t.id)} aria-current={t.id === activeId ? "step" : undefined}
                                    aria-label={`${i + 1}-mashq: ${t.title}${open ? "" : ", qulflangan"}`} title={t.title}
                                    className={`grid h-8 w-8 place-items-center rounded-full text-[13px] font-bold transition-colors ${t.id === activeId ? "bg-[#185abd] text-white ring-4 ring-[#185abd]/20" : done ? "bg-success/20 text-success" : open ? "border border-black/15 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10" : "border border-black/10 opacity-50 dark:border-white/10"}`}>
                                    {done ? <Check size={14} aria-hidden="true" /> : !open ? <Lock size={12} aria-hidden="true" /> : i + 1}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        {maxLevel < 4 && <span className="flex items-center gap-1.5 text-xs text-soft"><Lock size={12} aria-hidden="true" /> Keyingi daraja mashqlarni bajargach ochiladi</span>}
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-soft">{idx + 1}-mashq · {LEVEL_TITLE[task.level]}</p>
                        <h2 className="text-lg font-bold leading-snug">{task.title}</h2>
                        <p className="mt-1 text-soft">{task.intro}</p>
                      </div>

                      <div className="rounded-lg border border-[#c7e0f4] bg-[#eff6fc] p-3 text-[#1b1b1f] dark:border-white/10 dark:bg-white/[0.04] dark:text-text">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#185abd] dark:text-accent">Vaziyat</p>
                        <ul className="ml-4 list-disc space-y-1">{task.given.map((g) => <li key={g}>{g}</li>)}</ul>
                      </div>

                      {task.level <= 3 && (
                        <div>
                          <p className="mb-1.5 font-semibold">Arizada bo&apos;lishi kerak:</p>
                          <ul className="flex flex-col gap-1">
                            {task.requires.map((k) => {
                              const st = partState(k);
                              return (
                                <li key={k} className="flex items-center gap-2">
                                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${st === "ok" ? "border-success bg-success text-white" : st === "bad" ? "border-danger bg-danger text-white" : "border-soft/40"}`}>
                                    {st === "ok" ? <Check size={12} strokeWidth={3} aria-label="to'g'ri" /> : st === "bad" ? <X size={12} strokeWidth={3} aria-label="xato bor" /> : null}
                                  </span>
                                  {PART_LABEL[k]}
                                  {fresh.includes(k) && <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">yangi</span>}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {task.lesson && (
                        <div className="rounded-lg border border-black/10 dark:border-white/10">
                          <button type="button" onClick={() => setLessonOpen((o) => ({ ...o, [activeId]: !lessonShown }))} aria-expanded={lessonShown} className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left">
                            <span className="flex items-center gap-2 font-semibold"><BookOpen size={16} aria-hidden="true" className="text-accent" />{task.lesson.title}</span>
                            <span className="text-xs font-semibold text-accent">{lessonShown ? "Yashirish" : "Ko'rish"}</span>
                          </button>
                          {lessonShown && (
                            <div className="flex flex-col gap-3 border-t border-black/10 p-3 dark:border-white/10">
                              {task.lesson.points.map((pt) => (
                                <div key={pt.part} className="flex flex-col gap-1.5">
                                  <p className="font-semibold">{pt.part}</p>
                                  <p className="text-soft">{pt.what}</p>
                                  <p><span className="text-[11px] font-bold uppercase tracking-wide text-accent">Qayerda: </span>{pt.where}</p>
                                  <p><span className="text-[11px] font-bold uppercase tracking-wide text-accent">Qanday: </span>{pt.how}</p>
                                  <p className="rounded border border-black/10 bg-white px-2.5 py-1.5 text-[#1b1b1f]" style={{ fontFamily: FONT }}>{pt.example}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
                        {task.example.length > 0 && (
                          <button type="button" onClick={() => setShowExample(true)} className="font-semibold text-accent hover:underline">{task.exampleKind === "template" ? "Tuzilma namunasini ko'rish" : "To'g'ri namunani ko'rish"}</button>
                        )}
                        <button type="button" onClick={resetSheet} className="text-soft hover:text-text">Varaqni tozalash</button>
                      </div>
                      <p className="text-xs text-soft">
                        {task.scaffold?.length ? "Varaqda har qatorga nima yozilishi kulrang ko'rsatma bilan berilgan. " : ""}
                        Word&apos;dagidek ishlang: matnni belgilab, lentadagi tugmalar bilan tekislang va formatlang. Tayyor bo&apos;lgach <b>Tekshirish</b>{task.organ ? <>, keyin <b>Yuborish</b></> : null} tugmasini bosing.
                      </p>
                    </>
                  ) : !res ? (
                    <p className="text-soft">Hali tekshirilmagan. Arizani yozib, yuqoridagi <b className="text-text">Tekshirish</b> tugmasini bosing: xatolar Word izohlari kabi shu yerda va varaq chetida chiqadi.</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-lg font-bold ${passed ? "bg-success/20 text-success" : "bg-warn/20 text-warn"}`}>{res.score}%</span>
                        <div>
                          <p className="font-bold leading-tight">{passed ? "Mashq bajarildi" : `Tuzatib qayta tekshiring (${task.passAt}% kerak)`}</p>
                          <p className="text-xs text-soft">{fails.length + aiMissing.length ? `${fails.length + aiMissing.length} ta izoh` : "Xato topilmadi"} · {goods.length} ta to&apos;g&apos;ri</p>
                        </div>
                      </div>
                      {stale && (
                        <div role="status" className="flex items-center justify-between gap-2 rounded-lg bg-warn/15 px-3 py-2 text-xs text-warn">
                          <span>Hujjat o&apos;zgardi, izohlar eski variantga tegishli.</span>
                          <button type="button" onClick={check} disabled={busy || !enough} className="shrink-0 rounded bg-warn px-2.5 py-1 font-bold text-white disabled:opacity-50">Qayta tekshirish</button>
                        </div>
                      )}
                      {passed && idx < ARIZA_TASKS.length - 1 && (
                        <button type="button" onClick={() => pick(ARIZA_TASKS[idx + 1].id)} className="flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-[var(--accent-contrast)]">
                          Keyingi mashq <ArrowRight size={16} aria-hidden="true" />
                        </button>
                      )}
                      {aiNote && <p className="rounded-lg bg-warn/15 px-3 py-2 text-xs text-warn">{aiNote}</p>}

                      {fails.length > 0 && (
                        <ol className="flex flex-col gap-2" aria-label="Izohlar">
                          {fails.map((c, n) => (
                            <li key={c.id} id={`izoh-${n + 1}`}
                              className={`rounded-lg border-l-4 border-[#c42b1c] bg-[#fdf3f4] p-3 text-[#1b1b1f] dark:bg-white/[0.05] dark:text-text ${focusNote === n + 1 ? "ring-2 ring-[#c42b1c]/50" : ""}`}>
                              <p className="mb-1 flex items-center gap-2 text-xs text-[#605e5c] dark:text-soft">
                                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#c42b1c] text-[10px] font-bold text-white">{n + 1}</span>
                                Tekshiruvchi{c.para !== undefined ? ` · ${c.para + 1}-abzats` : ""}
                              </p>
                              <p className="font-semibold">{c.title}</p>
                              <p className="text-[13px]">{c.detail}</p>
                              {c.para !== undefined && <button type="button" onClick={() => docRef.current?.focusPara(c.para as number)} className="mt-1 text-xs font-semibold text-accent hover:underline">Abzatsga o&apos;tish</button>}
                            </li>
                          ))}
                        </ol>
                      )}

                      {aiMissing.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-soft">Mazmun bo&apos;yicha (AI)</p>
                          {aiMissing.map((it) => (
                            <div key={it.id} className="rounded-lg border-l-4 border-warn bg-warn/10 p-3">
                              <p className="font-semibold">{it.label}</p>
                              {it.comment && <p className="text-[13px] text-soft">{it.comment}</p>}
                              {it.quote && <p className="mt-1 rounded bg-black/5 px-2 py-1 text-xs italic dark:bg-white/10" style={{ fontFamily: FONT }}>«{it.quote}»</p>}
                            </div>
                          ))}
                          <p className="text-xs text-soft">AI xato qilishi mumkin. Qonun moddasini Lex.uz dan tekshiring.</p>
                        </div>
                      )}

                      {(goods.length > 0 || (res.aiOk && res.items.some((it) => it.met))) && (
                        <div>
                          <button type="button" onClick={() => setShowOk((v) => !v)} aria-expanded={showOk} className="flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-wide text-soft">
                            To&apos;g&apos;ri bajarilganlar <span>{showOk ? "Yashirish" : "Ko'rsatish"}</span>
                          </button>
                          {showOk && (
                            <ul className="mt-2 flex flex-col gap-1.5">
                              {goods.map((c) => <li key={c.id} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-success" aria-label="To'g'ri" /><span>{c.title}</span></li>)}
                              {res.aiOk && res.items.filter((it) => it.met).map((it) => <li key={it.id} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-success" aria-label="To'g'ri" /><span>{it.label}</span></li>)}
                            </ul>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {error && <p role="alert" className="rounded-lg bg-danger/15 px-3 py-2 text-xs text-danger">{error}</p>}
                </div>
              </aside>
            )}

            {/* ---------- Hujjat maydoni: chizg'ich va A4 varaq ---------- */}
            <div ref={canvasRef} className="min-w-0 flex-1 overflow-auto bg-[#e7e7e7] dark:bg-[#17191d]">
              <div className="mx-auto flex w-fit flex-col items-center px-6 pb-10" style={{ zoom }}>
                <div className="sticky top-0 z-10 bg-[#e7e7e7] pb-2 pt-3 dark:bg-[#17191d]"><Ruler /></div>
                <div
                  ref={pageRef}
                  className="relative flex cursor-text flex-col bg-white text-[#1b1b1f] shadow-[0_1px_3px_rgba(0,0,0,0.18),0_6px_20px_rgba(0,0,0,0.08)]"
                  style={{ width: PAGE_W, minHeight: PAGE_H, padding: `${MARGIN.top}px ${MARGIN.right}px ${MARGIN.bottom}px ${MARGIN.left}px` }}
                  onMouseDown={(e) => {
                    // Varaqning bo'sh joyi bosilsa kursor hujjat oxiriga (Word'dagidek)
                    if (e.target !== e.currentTarget) return;
                    e.preventDefault();
                    docRef.current?.focusEnd();
                  }}
                >
                  {Array.from({ length: pages - 1 }, (_, k) => (
                    <div key={k} aria-hidden="true" className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[#c8c6c4]" style={{ top: (k + 1) * PAGE_H }}>
                      <span className="absolute right-2 top-1 font-sans text-[10px] text-[#a19f9d]">{k + 2}-sahifa</span>
                    </div>
                  ))}
                  <WordDoc
                    ref={docRef}
                    docKey={`${activeId}:${loaded ? 1 : 0}`}
                    initialHtml={initialHtml}
                    font={FONT}
                    fontSize={doc.size * PT}
                    lineHeight={doc.spacing * 1.15}
                    bad={badParas}
                    onChange={onDocChange}
                    onFormat={setFmt}
                    onLayout={setTops}
                  />
                  {/* Word izoh belgilari varaqning o'ng chetida */}
                  {tops.map((top, i) => {
                    const ms = marksOf(i);
                    if (!ms.length) return null;
                    return (
                      <button key={i} type="button" onClick={() => openNote(ms[0])} aria-label={`Izoh ${ms.join(", ")}`}
                        style={{ top: top + 2, right: 6 }}
                        className="absolute flex items-center gap-0.5 rounded bg-[#fde7e9] px-1 py-0.5 font-sans text-[10px] font-bold text-[#c42b1c] shadow-sm ring-1 ring-[#c42b1c]/30 hover:bg-[#fbd5d9]">
                        <MessageSquare size={10} strokeWidth={2.5} aria-hidden="true" />
                        {ms.join(",")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ---------- O'ng panel: AI yordamchi (Word'dagi Copilot kabi) ---------- */}
            {aiOpen && (
              <aside aria-label="AI yordamchi" className="flex w-[360px] shrink-0 flex-col border-l border-[#e1dfdd] bg-white dark:border-white/10 dark:bg-[#1e2025]">
                <div className="flex shrink-0 items-center gap-2 border-b border-[#e1dfdd] px-4 py-2.5 dark:border-white/10">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-[#185abd] to-[#0f8f5f] text-white"><Sparkles size={15} aria-hidden="true" /></span>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold leading-tight">AI yordamchi</p>
                    <p className="text-[11px] text-soft">Hujjatingizni ko&apos;rib maslahat beradi</p>
                  </div>
                  <button type="button" onClick={() => setAiOpen(false)} aria-label="AI panelini yopish" className="grid h-8 w-8 place-items-center rounded text-soft hover:bg-black/5 hover:text-text dark:hover:bg-white/10"><X size={16} aria-hidden="true" /></button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 text-sm" aria-live="polite">
                  {chat.length === 0 && (
                    <div className="flex flex-col gap-3">
                      <p className="text-soft">
                        Arizangiz haqida so&apos;rang. AI varaqdagi matnni ko&apos;rib, nima yetishmayotganini, qaysi qism qayerda turishini va keyingi qismni qanday yozishni aytadi. Taklif qilgan matnini bir tugma bilan varaqqa qo&apos;yasiz.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {AI_CHIPS.map((c) => (
                          <button key={c} type="button" onClick={() => void ask(c)} disabled={aiBusy} className="rounded-full border border-[#185abd]/30 px-3 py-1.5 text-left text-[13px] text-[#185abd] hover:bg-[#eff6fc] disabled:opacity-50 dark:border-[#8aa6f5]/30 dark:text-[#8aa6f5] dark:hover:bg-white/10">{c}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chat.map((t, k) =>
                    t.role === "user" ? (
                      <p key={k} className="ml-8 self-end whitespace-pre-wrap rounded-2xl rounded-br-md bg-[#185abd] px-3 py-2 text-white">{t.text}</p>
                    ) : (
                      <div key={k} className="mr-4 flex flex-col gap-2 rounded-2xl rounded-bl-md bg-[#f3f2f1] px-3 py-2.5 text-[#1b1b1f] dark:bg-white/[0.06] dark:text-text">
                        <p className="whitespace-pre-wrap">{t.text}</p>
                        {t.snippet && (
                          <div className="flex flex-col gap-2 rounded-lg border border-black/10 bg-white p-2.5 text-[#1b1b1f]">
                            <p className="whitespace-pre-wrap text-[14px] leading-snug" style={{ fontFamily: FONT }}>{t.snippet}</p>
                            <div className="flex gap-2 font-sans">
                              <button type="button" onMouseDown={keep} onClick={() => docRef.current?.insert(t.snippet as string)} className="rounded bg-[#185abd] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#124a9e]">Varaqqa qo&apos;yish</button>
                              <button type="button" onClick={() => void navigator.clipboard?.writeText(t.snippet as string)} className="rounded px-2.5 py-1 text-xs font-semibold text-[#185abd] hover:bg-[#eff6fc]">Nusxa olish</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  )}
                  {aiBusy && <p className="flex items-center gap-2 text-soft"><Sparkles size={14} className="animate-pulse text-[#185abd]" aria-hidden="true" /> AI javob yozmoqda...</p>}
                  {aiError && <p role="alert" className="rounded-lg bg-danger/15 px-3 py-2 text-xs text-danger">{aiError}</p>}
                  <div ref={chatEnd} />
                </div>

                <form className="flex shrink-0 flex-col gap-2 border-t border-[#e1dfdd] p-3 dark:border-white/10" onSubmit={(e) => { e.preventDefault(); void ask(aiInput); }}>
                  {chat.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                      {AI_CHIPS.slice(0, 3).map((c) => (
                        <button key={c} type="button" onClick={() => void ask(c)} disabled={aiBusy} className="shrink-0 rounded-full border border-black/10 px-2.5 py-1 text-[12px] text-soft hover:text-text disabled:opacity-50 dark:border-white/15">{c}</button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <label htmlFor="ai-savol" className="sr-only">AI ga savol</label>
                    <textarea id="ai-savol" rows={2} value={aiInput} onChange={(e) => setAiInput(e.target.value)} maxLength={800}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void ask(aiInput); } }}
                      placeholder="Masalan: talab qismini qanday yozaman?"
                      className="min-h-[44px] flex-1 resize-none rounded-lg border border-[#c8c6c4] bg-white px-3 py-2 text-sm text-[#1b1b1f] outline-none focus:border-[#185abd] dark:border-white/15 dark:bg-[#17191d] dark:text-text" />
                    <button type="submit" disabled={aiBusy || !aiInput.trim()} aria-label="Yuborish" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#185abd] text-white disabled:opacity-40"><Send size={16} aria-hidden="true" /></button>
                  </div>
                  <p className="text-[11px] text-soft">AI xato qilishi mumkin. Bu o&apos;quv mashqi, yuridik maslahat emas.</p>
                </form>
              </aside>
            )}
          </div>

          {/* Holat satri */}
          <div className="flex h-7 shrink-0 items-center gap-4 border-t border-[#e1dfdd] bg-[#f3f2f1] px-3 text-[11px] text-[#605e5c] dark:border-white/10 dark:bg-[#26282d] dark:text-soft">
            <span>Sahifalar: {pages}</span>
            <span>{words} so&apos;z</span>
            <span className={enough ? "" : "text-danger"}>{chars} / kamida {task.minChars} belgi</span>
            <span>O&apos;zbek (lotin)</span>
            <span className="ml-auto hidden xl:inline">Belgilab formatlang · Ctrl+B/I/U · Tab: chekinish · Ctrl+Z: bekor qilish</span>
            {/* Masshtab (Word'dagidek): foiz haqiqiy A4 o'lchamiga nisbatan */}
            <span className="ml-auto flex items-center gap-1 xl:ml-0" role="group" aria-label="Masshtab">
              <button type="button" onClick={() => setManualZoom(Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10))} aria-label="Kichraytirish" className="grid h-5 w-5 place-items-center rounded text-[13px] hover:bg-black/10 dark:hover:bg-white/10">−</button>
              <button type="button" onClick={() => setManualZoom(null)} title="Sahifa kengligi bo'yicha" className={`min-w-[44px] rounded px-1 tabular-nums hover:bg-black/10 dark:hover:bg-white/10 ${manualZoom === null ? "font-semibold" : ""}`}>
                {Math.round((zoom * 100 * PAGE_W) / ((21 / 2.54) * 96))}%
              </button>
              <button type="button" onClick={() => setManualZoom(Math.min(2, Math.round((zoom + 0.1) * 10) / 10))} aria-label="Kattalashtirish" className="grid h-5 w-5 place-items-center rounded text-[13px] hover:bg-black/10 dark:hover:bg-white/10">+</button>
            </span>
          </div>
        </section>
      </div>

      {/* ---------- Namuna oynasi ---------- */}
      {showExample && (
        <div role="dialog" aria-modal="true" aria-label="Namuna" className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/45 p-8" onClick={() => setShowExample(false)} onKeyDown={(e) => { if (e.key === "Escape") setShowExample(false); }}>
          <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex w-full items-center justify-between text-white">
              <p className="font-semibold">{task.exampleKind === "template" ? "Tuzilma namunasi" : "To'g'ri namuna"}: {task.title}</p>
              <button type="button" autoFocus onClick={() => setShowExample(false)} className="rounded bg-white/15 px-3 py-1.5 text-sm font-semibold hover:bg-white/25">Yopish</button>
            </div>
            {task.exampleKind === "template" && (
              <p className="w-full rounded bg-white/90 px-3 py-2 text-xs text-[#323130]">[Qavs] ichidagi joylarni vaziyat ma&apos;lumoti bilan to&apos;ldirasiz. Qonun moddasini Lex.uz dan tekshirib yozing.</p>
            )}
            <div className="bg-white text-[#1b1b1f] shadow-2xl" style={{ width: PAGE_W, minHeight: PAGE_H * 0.7, padding: `${MARGIN.top}px ${MARGIN.right}px ${MARGIN.bottom}px ${MARGIN.left}px` }}>
              {task.example.map((p, i) => <p key={i} style={paraStyle(p, doc)}>{p.text || " "}</p>)}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Organdan javob xati ---------- */}
      {letter && (
        <div role="dialog" aria-modal="true" aria-labelledby="javob-xat" className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/45 p-8" onKeyDown={(e) => { if (e.key === "Escape") setLetter(null); }}>
          <div className="flex w-[620px] flex-col gap-3">
            <div className="bg-white px-14 py-12 text-[#1b1b1f] shadow-2xl" style={{ fontFamily: FONT, fontSize: 15 }}>
              <p className="text-center text-[13px] font-bold uppercase tracking-wide">{letter.organ}</p>
              <div className="mt-1 border-t-2 border-[#1b1b1f]" />
              <div className="mt-3 flex justify-between text-[13px]">
                <span>{letter.date}</span>
                <span>Kiruvchi № {letter.number}</span>
              </div>
              <h2 id="javob-xat" className="mt-6 text-center font-bold">{letter.passed ? "ARIZA QABUL QILINDI" : "ARIZA QABUL QILINMADI"}</h2>
              <p className="mt-4 text-justify indent-8">Hurmatli murojaatchi!</p>
              {letter.passed ? (
                <p className="mt-2 text-justify indent-8">
                  &quot;{task.title}&quot; bo&apos;yicha arizangiz qabul qilindi va {letter.number} raqami bilan ro&apos;yxatga olindi. Ariza belgilangan tartibda ko&apos;rib chiqiladi.
                </p>
              ) : (
                <>
                  <p className="mt-2 text-justify indent-8">Arizangiz rasmiylashtirishdagi quyidagi kamchiliklar sababli ko&apos;rib chiqishga qabul qilinmadi:</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-12 text-[14px]">{letter.reasons.slice(0, 8).map((r, k) => <li key={k}>{r}</li>)}</ol>
                  <p className="mt-3 text-justify indent-8">Kamchiliklarni tuzatib, arizani qayta yuborishingiz mumkin.</p>
                </>
              )}
              <div className="mt-10 flex justify-between text-[14px]">
                <span>Mas&apos;ul xodim</span>
                <span>__________</span>
              </div>
              <p className="mt-8 font-sans text-[11px] text-[#8a8886]">O&apos;quv simulyatsiyasi: bu haqiqiy organ javobi emas.</p>
            </div>
            <div className="flex justify-end gap-2">
              {letter.passed && idx < ARIZA_TASKS.length - 1 ? (
                <>
                  <button type="button" onClick={() => setLetter(null)} className="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-[#323130]">Yopish</button>
                  <button type="button" autoFocus onClick={() => pick(ARIZA_TASKS[idx + 1].id)} className="flex items-center gap-2 rounded-lg bg-[#185abd] px-4 py-2 text-sm font-semibold text-white">Keyingi mashq <ArrowRight size={16} aria-hidden="true" /></button>
                </>
              ) : (
                <button type="button" autoFocus onClick={() => { setLetter(null); if (!letter.passed) { setPane("review"); setPaneOpen(true); } }} className="rounded-lg bg-[#185abd] px-4 py-2 text-sm font-semibold text-white">{letter.passed ? "Yopish" : "Tuzatish"}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Align turi eski qoralamalar bilan mos kelishi uchun eksport qilinadi
export type { Align };
