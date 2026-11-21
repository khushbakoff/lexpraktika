"use client";

import { useMemo, useSyncExternalStore } from "react";

const KEY = "lexsim:activity:v1";
const MAX_DAYS = 90;
const EMPTY: string[] = [];

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: string[] = EMPTY;

/** Mahalliy sana kaliti: YYYY-MM-DD. */
export function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw ? (JSON.parse(raw) as string[]) : EMPTY;
    return cachedValue;
  } catch {
    return EMPTY;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** Bugun faol bo'lganini yozadi (bosqich topshirilganda chaqiriladi). */
export function recordToday() {
  try {
    const today = dayKey(new Date());
    const cur = read();
    if (cur.includes(today)) return;
    window.localStorage.setItem(KEY, JSON.stringify([...cur, today].slice(-MAX_DAYS)));
    listeners.forEach((l) => l());
  } catch {
    /* private rejim */
  }
}

export function clearActivity() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* private rejim */
  }
  listeners.forEach((l) => l());
}

const noop = () => () => {};
/** Bugungi sana kaliti. Server render paytida bo'sh (Date prerender'ga kirmasligi uchun), brauzerda haqiqiy sana. */
function useTodayKey(): string {
  return useSyncExternalStore(noop, () => dayKey(new Date()), () => "");
}

export type WeekDay = { key: string; label: string; active: boolean; today: boolean };

/** Ketma-ket faol kunlar (seriya), bugungi maqsad va oxirgi 7 kun. */
export function useStreak() {
  const days = useSyncExternalStore(subscribe, read, () => EMPTY);
  const todayKey = useTodayKey();
  return useMemo(() => {
    const set = new Set(days);
    const [y, m, d0] = (todayKey || "1970-01-01").split("-").map(Number);
    const now = new Date(y, m - 1, d0);
    const doneToday = set.has(todayKey);
    // Bugun hali faol bo'lmasa, seriya kechadan hisoblanadi (bugun uzilmaydi)
    const cursor = new Date(now);
    if (!doneToday) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (set.has(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    const LABELS = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
    const week: WeekDay[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      week.push({ key, label: LABELS[d.getDay()], active: set.has(key), today: key === todayKey });
    }
    return { streak, doneToday, week };
  }, [days, todayKey]);
}
