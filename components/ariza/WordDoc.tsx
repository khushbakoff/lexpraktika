"use client";

import { useEffect, useImperativeHandle, useLayoutEffect, useRef, type Ref } from "react";
import type { Align, Para } from "@/lib/ariza";

/**
 * Word kabi uzluksiz hujjat (contentEditable): matnni istalgan joydan belgilash, so'zni qalin/kursiv qilish,
 * bir nechta abzatsni birdaniga tekislash, Ctrl+A/C/V/Z brauzerning o'zida. Tekshiruv uchun hujjat abzatslar
 * modeliga (Para[]) aylantiriladi: har <p> bitta abzats.
 */

export type FormatState = { bold: boolean; italic: boolean; underline: boolean; align: Align; indent: boolean; para: number };
export type WordDocHandle = {
  exec: (cmd: "bold" | "italic" | "underline" | "justifyLeft" | "justifyCenter" | "justifyRight" | "justifyFull" | "undo" | "redo") => void;
  toggleIndent: () => void;
  toggleCase: () => void;
  focusPara: (i: number) => void;
  focusEnd: () => void;
  reset: (paras: Para[]) => void;
  html: () => string;
  /** AI taklif qilgan matnni oxirgi kursor joyiga qo'yadi (har qator yangi abzats). */
  insert: (text: string) => void;
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ALIGNS: Align[] = ["left", "center", "right", "justify"];
const normAlign = (v: string | null | undefined): Align => (ALIGNS.includes((v ?? "").toLowerCase() as Align) ? ((v as string).toLowerCase() as Align) : v === "start" || !v ? "left" : "left");

/** Abzatslar modelidan HTML (saqlangan qoralama yoki karkas uchun). */
export function parasToHtml(paras: Para[]): string {
  return paras
    .map((p) => {
      let inner = esc(p.text);
      if (inner && p.bold) inner = `<b>${inner}</b>`;
      if (inner && p.italic) inner = `<i>${inner}</i>`;
      if (inner && p.underline) inner = `<u>${inner}</u>`;
      const style = `text-align:${p.align};${p.indent ? "margin-left:50%;" : ""}`;
      return `<p style="${style}"${p.hint ? ` data-hint="${esc(p.hint)}"` : ""}>${inner || "<br>"}</p>`;
    })
    .join("");
}

/** Faqat ruxsat etilgan teglar va uslublar qoladi (saqlangan HTML ham shu yerdan o'tadi). */
export function sanitize(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const inline = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return esc(node.textContent ?? "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const kids = Array.from(el.childNodes).map(inline).join("");
    if (tag === "br") return "<br>";
    const st = el.style;
    let out = kids;
    if (tag === "b" || tag === "strong" || st.fontWeight === "bold" || Number(st.fontWeight) >= 600) out = `<b>${out}</b>`;
    if (tag === "i" || tag === "em" || st.fontStyle === "italic") out = `<i>${out}</i>`;
    if (tag === "u" || st.textDecoration.includes("underline") || st.textDecorationLine.includes("underline")) out = `<u>${out}</u>`;
    return out;
  };
  const block = (el: HTMLElement | null, content: string) => {
    const align = normAlign(el?.style.textAlign || el?.getAttribute("align"));
    const indent = el?.style.marginLeft === "50%";
    const hint = el?.getAttribute("data-hint");
    return `<p style="text-align:${align};${indent ? "margin-left:50%;" : ""}"${hint ? ` data-hint="${esc(hint)}"` : ""}>${content || "<br>"}</p>`;
  };
  const out: string[] = [];
  let loose = "";
  for (const n of Array.from(doc.body.childNodes)) {
    const isBlock = n.nodeType === Node.ELEMENT_NODE && ["p", "div", "h1", "h2", "h3", "li"].includes((n as HTMLElement).tagName.toLowerCase());
    if (isBlock) {
      if (loose) { out.push(block(null, loose)); loose = ""; }
      out.push(block(n as HTMLElement, Array.from(n.childNodes).map(inline).join("")));
    } else loose += inline(n);
  }
  if (loose) out.push(block(null, loose));
  return out.join("") || "<p><br></p>";
}

const textOf = (el: HTMLElement) => (el.innerText ?? el.textContent ?? "").replace(/\n$/, "").replace(/\n/g, " ").replace(/ /g, " ");
/** Abzatsning hamma matni shu uslubda bo'lsa true (sarlavha kabi butun abzats qalin). */
function allTextIs(el: HTMLElement, test: (cs: CSSStyleDeclaration) => boolean) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let any = false;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue;
    any = true;
    if (!test(getComputedStyle(n.parentElement as HTMLElement))) return false;
  }
  return any;
}

export function readParas(root: HTMLElement): Para[] {
  return Array.from(root.children)
    .filter((el): el is HTMLElement => el instanceof HTMLElement && el.tagName === "P")
    .map((el) => ({
      text: textOf(el),
      align: normAlign(el.style.textAlign || el.getAttribute("align")),
      indent: el.style.marginLeft === "50%",
      bold: allTextIs(el, (cs) => Number(cs.fontWeight) >= 600),
      italic: allTextIs(el, (cs) => cs.fontStyle === "italic"),
      underline: allTextIs(el, (cs) => cs.textDecorationLine.includes("underline")),
      ...(el.dataset.hint ? { hint: el.dataset.hint } : {}),
    }));
}

export default function WordDoc({ docKey, initialHtml, font, fontSize, lineHeight, bad, ref, onChange, onFormat, onLayout }: {
  docKey: string;
  initialHtml: string;
  font: string;
  fontSize: number;
  lineHeight: number;
  bad: number[];
  ref?: Ref<WordDocHandle>;
  onChange: (paras: Para[], html: string) => void;
  onFormat: (s: FormatState) => void;
  onLayout: (tops: number[]) => void;
}) {
  const root = useRef<HTMLDivElement | null>(null);
  // Hujjatdagi oxirgi kursor/belgilash: panel tugmasi bosilganda fokus ketsa ham shu joyga qo'yiladi
  const saved = useRef<Range | null>(null);
  const cb = useRef({ onChange, onFormat, onLayout });
  useLayoutEffect(() => {
    cb.current = { onChange, onFormat, onLayout };
  });

  const blocks = () => Array.from(root.current?.children ?? []).filter((el): el is HTMLElement => el instanceof HTMLElement && el.tagName === "P");
  const blockOf = (node: Node | null): HTMLElement | null => {
    let n: Node | null = node;
    while (n && n.parentNode !== root.current) n = n.parentNode;
    return n instanceof HTMLElement && n.tagName === "P" ? n : null;
  };
  const selectedBlocks = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return [];
    const r = sel.getRangeAt(0);
    const all = blocks();
    const a = blockOf(r.startContainer);
    const b = blockOf(r.endContainer);
    const ia = a ? all.indexOf(a) : -1;
    const ib = b ? all.indexOf(b) : ia;
    return ia < 0 ? [] : all.slice(Math.min(ia, ib), Math.max(ia, ib) + 1);
  };
  const caretAtEnd = (el: HTMLElement) => {
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
  };

  // Hujjat tuzilmasini tartibga keltirish: yuqori darajada faqat <p>; bo'sh abzats ko'rsatmasi; takror ko'rsatma olib tashlanadi
  const normalize = () => {
    const el = root.current;
    if (!el) return;
    let changed = false;
    for (const n of Array.from(el.childNodes)) {
      if (n instanceof HTMLElement && n.tagName === "P") continue;
      if (n instanceof HTMLElement && n.tagName === "DIV") {
        const p = document.createElement("p");
        p.style.cssText = n.style.cssText;
        while (n.firstChild) p.appendChild(n.firstChild);
        n.replaceWith(p);
      } else if (n.nodeType === Node.TEXT_NODE && !n.textContent) {
        n.remove();
      } else {
        const p = document.createElement("p");
        n.replaceWith(p);
        p.appendChild(n);
      }
      changed = true;
    }
    if (!el.firstChild) {
      el.innerHTML = "<p><br></p>";
      changed = true;
    }
    if (changed && document.activeElement === el) {
      const last = blocks().at(-1);
      if (last) caretAtEnd(last);
    }
    const all = blocks();
    all.forEach((p, i) => {
      const empty = !textOf(p).trim();
      p.dataset.empty = empty ? "true" : "false";
      if (p.dataset.hint && i > 0 && all[i - 1].dataset.hint === p.dataset.hint) delete p.dataset.hint;
    });
    el.dataset.blank = all.length === 1 && !all[0].dataset.hint && all[0].dataset.empty === "true" ? "true" : "false";
  };

  const layout = () => cb.current.onLayout(blocks().map((p) => p.offsetTop));
  const emit = () => {
    const el = root.current;
    if (!el) return;
    normalize();
    cb.current.onChange(readParas(el), sanitize(el.innerHTML));
    layout();
  };
  const reportFormat = () => {
    const sel = window.getSelection();
    if (!sel || !root.current || !sel.anchorNode || !root.current.contains(sel.anchorNode)) return;
    if (sel.rangeCount) saved.current = sel.getRangeAt(0).cloneRange();
    const p = blockOf(sel.anchorNode);
    const all = blocks();
    cb.current.onFormat({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      align: normAlign(p?.style.textAlign || p?.getAttribute("align")),
      indent: p?.style.marginLeft === "50%",
      para: p ? all.indexOf(p) : 0,
    });
  };

  // Mashq almashganda (yoki qoralama yuklanganda) hujjat qaytadan yoziladi
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    el.innerHTML = sanitize(initialHtml);
    document.execCommand("defaultParagraphSeparator", false, "p");
    emit();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- faqat docKey o'zgarganda (yozish paytida emas)
  }, [docKey]);

  // Xato abzatslar Word'dagidek qizil to'lqinli chiziq bilan
  useEffect(() => {
    blocks().forEach((p, i) => {
      if (bad.includes(i)) p.dataset.bad = "true";
      else delete p.dataset.bad;
    });
    layout();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bad ro'yxati o'zgarganda
  }, [bad.join(",")]);

  useEffect(() => {
    const onSel = () => reportFormat();
    document.addEventListener("selectionchange", onSel);
    const ro = new ResizeObserver(() => layout());
    if (root.current) ro.observe(root.current);
    return () => {
      document.removeEventListener("selectionchange", onSel);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bir marta ulanadi
  }, []);

  useImperativeHandle(ref, () => ({
    exec: (cmd) => {
      root.current?.focus();
      document.execCommand(cmd, false);
      emit();
      reportFormat();
    },
    toggleIndent: () => {
      const bs = selectedBlocks();
      if (!bs.length) return;
      const on = bs[0].style.marginLeft !== "50%";
      for (const p of bs) {
        p.style.marginLeft = on ? "50%" : "";
        if (on && (p.style.textAlign === "center" || p.style.textAlign === "right")) p.style.textAlign = "left";
      }
      emit();
      reportFormat();
    },
    toggleCase: () => {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      if (sel.isCollapsed) {
        const p = blockOf(sel.anchorNode);
        if (!p) return;
        const r = document.createRange();
        r.selectNodeContents(p);
        sel.removeAllRanges();
        sel.addRange(r);
      }
      const t = sel.toString();
      if (!t) return;
      document.execCommand("insertText", false, t === t.toUpperCase() ? t.toLowerCase() : t.toUpperCase());
      emit();
    },
    focusPara: (i) => {
      const p = blocks()[i];
      if (!p) return;
      root.current?.focus();
      caretAtEnd(p);
      p.scrollIntoView({ block: "nearest" });
    },
    focusEnd: () => {
      const last = blocks().at(-1);
      if (!last) return;
      root.current?.focus();
      caretAtEnd(last);
    },
    reset: (paras) => {
      if (!root.current) return;
      root.current.innerHTML = parasToHtml(paras);
      root.current.focus();
      const first = blocks()[0];
      if (first) {
        const r = document.createRange();
        r.setStart(first, 0);
        r.collapse(true);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(r);
      }
      emit();
    },
    html: () => sanitize(root.current?.innerHTML ?? ""),
    insert: (text) => {
      const el = root.current;
      if (!el) return;
      el.focus();
      const sel = window.getSelection();
      const r = saved.current;
      if (sel && r && el.contains(r.startContainer)) {
        sel.removeAllRanges();
        sel.addRange(r);
      } else {
        const last = blocks().at(-1);
        if (last) caretAtEnd(last);
      }
      // Taklif alohida abzatsdan boshlanadi: kursor matnli abzatsda bo'lsa, shu abzats oxirida yangi abzats ochiladi
      const cur = sel?.anchorNode ? blockOf(sel.anchorNode) : null;
      if (cur && textOf(cur).trim()) {
        caretAtEnd(cur);
        document.execCommand("insertParagraph", false);
      }
      text.replace(/\r/g, "").split("\n").forEach((line, k) => {
        if (k > 0) document.execCommand("insertParagraph", false);
        if (line) document.execCommand("insertText", false, line);
      });
      emit();
    },
  }));

  return (
    <div
      ref={root}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-label="Ariza matni (Word varag'i)"
      spellCheck={false}
      className="word-doc min-h-full whitespace-pre-wrap break-words text-[#1b1b1f] caret-black outline-none"
      style={{ fontFamily: font, fontSize, lineHeight }}
      onInput={emit}
      onKeyDown={(e) => {
        // Word tugmalari: hamma brauzerda bir xil ishlashi uchun aniq bajariladi
        if ((e.metaKey || e.ctrlKey) && !e.altKey) {
          const k = e.key.toLowerCase();
          const cmd = ({ z: e.shiftKey ? "redo" : "undo", y: "redo", b: "bold", i: "italic", u: "underline" } as Record<string, string>)[k];
          if (cmd) {
            e.preventDefault();
            document.execCommand(cmd, false);
            emit();
            reportFormat();
            return;
          }
          if (k === "a" && root.current) {
            // Ctrl+A: butun sahifa emas, faqat hujjat matni belgilanadi
            e.preventDefault();
            const r = document.createRange();
            r.selectNodeContents(root.current);
            window.getSelection()?.removeAllRanges();
            window.getSelection()?.addRange(r);
            reportFormat();
            return;
          }
        }
        if (e.key === "Tab") {
          e.preventDefault();
          document.execCommand("insertText", false, "\t");
          return;
        }
        if (e.key === "Enter" && !e.shiftKey) {
          // Karkasda: abzats oxirida Enter keyingi tayyor (bo'sh) qatorga o'tadi
          const sel = window.getSelection();
          const p = sel ? blockOf(sel.anchorNode) : null;
          const next = p?.nextElementSibling as HTMLElement | null;
          if (p?.dataset.hint && next?.dataset.hint && next.dataset.empty === "true" && sel?.isCollapsed) {
            const r = document.createRange();
            r.selectNodeContents(p);
            r.setStart(sel.anchorNode as Node, sel.anchorOffset);
            if (!r.toString()) {
              e.preventDefault();
              const to = document.createRange();
              to.setStart(next, 0);
              to.collapse(true);
              sel.removeAllRanges();
              sel.addRange(to);
            }
          }
        }
      }}
      onPaste={(e) => {
        // Faqat oddiy matn: har qator yangi abzats (boshqa saytdan rang va shriftlar kirmaydi)
        e.preventDefault();
        const lines = e.clipboardData.getData("text/plain").replace(/\r/g, "").split("\n");
        lines.forEach((line, k) => {
          if (k > 0) document.execCommand("insertParagraph", false);
          if (line) document.execCommand("insertText", false, line);
        });
        emit();
      }}
      onKeyUp={reportFormat}
      onMouseUp={reportFormat}
    />
  );
}
