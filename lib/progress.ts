"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { StepResult } from "./scoring";
import { clearActivity, recordToday } from "./activity";

const KEY = "lexsim:progress:v4";
type Store = Record<string, { results: Record<string, StepResult> }>;

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: Store = {};
const EMPTY: Store = {};
const NO_RESULTS: Record<string, StepResult> = {};

function read(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw ? (JSON.parse(raw) as Store) : {};
    return cachedValue;
  } catch {
    return EMPTY;
  }
}

function write(next: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private rejim: saqlanmaydi, UI baribir ishlaydi */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** `ready` false bo'lsa hali localStorage o'qilmagan (server render). */
export function useScenarioProgress(scenarioId: string) {
  const store = useSyncExternalStore(subscribe, read, () => EMPTY);
  const results = store[scenarioId]?.results ?? NO_RESULTS;
  const completed = Object.keys(results);

  const submit = useCallback(
    (stepId: string, result: StepResult) => {
      const cur = read();
      const prev = cur[scenarioId]?.results ?? {};
      write({ ...cur, [scenarioId]: { results: { ...prev, [stepId]: result } } });
      recordToday();
    },
    [scenarioId],
  );

  const reset = useCallback(() => {
    const cur = { ...read() };
    delete cur[scenarioId];
    write(cur);
  }, [scenarioId]);

  return { results, completed, submit, reset };
}

/** Barcha vaziyatlar bo'yicha jami XP (ball yig'indisi) va daraja (har 100 XP = 1 daraja). */
export function useTotalXp() {
  const store = useSyncExternalStore(subscribe, read, () => EMPTY);
  let xp = 0;
  for (const sc of Object.values(store)) for (const r of Object.values(sc.results)) xp += r.score;
  return { xp, level: Math.floor(xp / 100) + 1, intoLevel: xp % 100 };
}

/** Serverdagi natijalar bilan mahalliy natijalarni to'liq almashtiradi (kirishdan keyin). */
export function replaceAllResults(byScenario: Record<string, Record<string, StepResult>>) {
  const next: Store = {};
  for (const [sid, results] of Object.entries(byScenario)) next[sid] = { results };
  write(next);
}

/** Chiqishda: boshqa hisob natijalari telefonda qolib ketmasin. */
export function clearAllProgress() {
  write({});
  clearActivity();
}

/** Barcha vaziyatlar bo'yicha natijalar (ish beruvchi tayyorlik hisobi uchun). */
export function useAllResults(): Record<string, Record<string, StepResult>> {
  const store = useSyncExternalStore(subscribe, read, () => EMPTY);
  return useMemo(() => Object.fromEntries(Object.entries(store).map(([k, v]) => [k, v.results])), [store]);
}
