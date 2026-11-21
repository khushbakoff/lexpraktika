"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Locale = "uz" | "uz-cyrl" | "uz-new" | "ru" | "en";

export const LOCALES: { id: Locale; label: string; note: string }[] = [
  { id: "uz", label: "O'zbekcha (Lotin)", note: "Standart" },
  { id: "uz-cyrl", label: "Ўзбекча (Кирилл)", note: "Кирилл алифбоси" },
  { id: "uz-new", label: "Özbekça (Yangi alifbo)", note: "ç, ş, ö, ğ" },
  { id: "ru", label: "Русский", note: "Интерфейс" },
  { id: "en", label: "English", note: "Interface" },
];

const KEY = "lexsim-locale";
const listeners = new Set<() => void>();
const isLocale = (v: unknown): v is Locale => LOCALES.some((l) => l.id === v);

export function readLocale(): Locale {
  try {
    const v = localStorage.getItem(KEY);
    return isLocale(v) ? v : "uz";
  } catch {
    return "uz";
  }
}

export function setLocale(l: Locale) {
  try {
    localStorage.setItem(KEY, l);
  } catch {
    // saqlanmasa ham joriy sessiyada ishlaydi
  }
  listeners.forEach((f) => f());
}

export function subscribeLocale(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useLocale(): [Locale, (l: Locale) => void] {
  const locale = useSyncExternalStore(subscribeLocale, readLocale, () => "uz" as Locale);
  return [locale, useCallback((l: Locale) => setLocale(l), [])];
}
