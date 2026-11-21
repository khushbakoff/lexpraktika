"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark" | "system";
const KEY = "lexsim-theme";
const listeners = new Set<() => void>();

const isMode = (v: unknown): v is ThemeMode => v === "light" || v === "dark" || v === "system";

function read(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    return isMode(v) ? v : "system";
  } catch {
    return "system"; // xotiraga ruxsat yo'q (masalan maxfiy rejim)
  }
}

/** Tanlangan rejimni <html data-theme="light|dark"> ga yozadi ("system" bo'lsa qurilma sozlamasi). */
export function applyTheme(mode: ThemeMode) {
  const dark = mode === "dark" || (mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function setThemeMode(mode: ThemeMode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // saqlanmasa ham joriy sessiyada ishlaydi
  }
  applyTheme(mode);
  listeners.forEach((l) => l());
}

export function useTheme(): [ThemeMode, (m: ThemeMode) => void] {
  const mode = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    read,
    () => "system" as ThemeMode,
  );

  // "Tizim" rejimida qurilma mavzusi o'zgarsa, ilova ham o'zgaradi
  useEffect(() => {
    if (mode !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const on = () => applyTheme("system");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [mode]);

  const set = useCallback((m: ThemeMode) => setThemeMode(m), []);
  return [mode, set];
}

/** Sahifa chizilishidan oldin ishlaydi (miltillashning oldini oladi). layout.tsx <head> ga qo'yiladi. */
export const THEME_INIT_SCRIPT = `try{var m=localStorage.getItem('${KEY}');var d=m==='dark'||(m!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}`;
