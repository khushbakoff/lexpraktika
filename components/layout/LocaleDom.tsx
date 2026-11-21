"use client";

import { useEffect } from "react";
import { convertText } from "@/lib/i18n/convert";
import { readLocale, subscribeLocale, type Locale } from "@/lib/i18n/locale";

const ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;
const SKIP = "script,style,textarea,noscript,[data-no-i18n],[contenteditable='true']";
const LANG: Record<Locale, string> = { uz: "uz", "uz-cyrl": "uz-Cyrl", "uz-new": "uz", ru: "ru", en: "en" };

/**
 * Tanlangan til/yozuvni sahifadagi matn va atributlarga qo'llaydi (tarjima qatlami).
 * React matnni yangilasa, kuzatuvchi uni qayta o'tkazadi. Asl matn WeakMap'da saqlanadi,
 * shuning uchun o'zbek lotinga qaytish har doim aniq.
 */
export default function LocaleDom() {
  useEffect(() => {
    const textOrig = new WeakMap<Node, string>();
    const textLast = new WeakMap<Node, string>();
    const attrOrig = new WeakMap<Element, Record<string, string>>();
    const attrLast = new WeakMap<Element, Record<string, string>>();
    let locale: Locale = readLocale();

    // React hali "hydrate" qilmagan elementga tegilmaydi (aks holda hydration xatosi chiqadi).
    // Hydrate bo'lgan element ichki __reactFiber$ kalitiga ega bo'ladi.
    const hydrated = new WeakSet<Element>();
    const isHydrated = (el: Element) => {
      if (hydrated.has(el)) return true;
      for (const k in el) {
        if (k.startsWith("__reactFiber$")) {
          hydrated.add(el);
          return true;
        }
      }
      return false;
    };

    const skipped = (n: Node) => {
      const el = n.nodeType === Node.ELEMENT_NODE ? (n as Element) : n.parentElement;
      return !el || el.closest(SKIP) !== null || !isHydrated(el);
    };

    const doText = (n: Node) => {
      if (skipped(n)) return;
      const cur = n.nodeValue ?? "";
      let base = textOrig.get(n);
      if (base === undefined || cur !== textLast.get(n)) {
        base = cur; // React yangi matn yozgan
        textOrig.set(n, cur);
      }
      const out = convertText(base, locale);
      textLast.set(n, out);
      if (out !== cur) n.nodeValue = out;
    };

    const doAttrs = (el: Element) => {
      if (el.closest("[data-no-i18n]") || !isHydrated(el)) return;
      const orig = attrOrig.get(el) ?? {};
      const last = attrLast.get(el) ?? {};
      for (const a of ATTRS) {
        const cur = el.getAttribute(a);
        if (cur === null) continue;
        if (orig[a] === undefined || cur !== last[a]) orig[a] = cur;
        const out = convertText(orig[a], locale);
        last[a] = out;
        if (out !== cur) el.setAttribute(a, out);
      }
      attrOrig.set(el, orig);
      attrLast.set(el, last);
    };

    const walk = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) return doText(root);
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      if ((root as Element).closest(SKIP)) return;
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      let n: Node | null = tw.currentNode;
      while (n) {
        if (n.nodeType === Node.TEXT_NODE) doText(n);
        else doAttrs(n as Element);
        n = tw.nextNode();
      }
    };

    const obs = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "characterData") doText(r.target);
        else if (r.type === "attributes") doAttrs(r.target as Element);
        else r.addedNodes.forEach((a) => walk(a));
      }
    });

    const start = () => {
      document.documentElement.lang = LANG[locale];
      walk(document.body);
      obs.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [...ATTRS],
      });
    };

    start();
    // Sahifa asta-sekin "hydrate" bo'ladi: dastlabki soniyalarda o'tkazilmagan joylarni qayta o'tamiz (idempotent)
    const retry = setInterval(() => walk(document.body), 500);
    const stopRetry = setTimeout(() => clearInterval(retry), 20000);
    const off = subscribeLocale(() => {
      locale = readLocale();
      obs.disconnect();
      start();
    });
    return () => {
      off();
      obs.disconnect();
      clearInterval(retry);
      clearTimeout(stopRetry);
    };
  }, []);
  return null;
}
