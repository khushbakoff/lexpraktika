"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "lexsim:profile:v1";

export type Profile = {
  trackId: string;
  interests: string[];
  level: string;
  /** Qayerga ishga kirmoqchi (content/employers). */
  employerId?: string;
};

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedValue: Profile | null = null;

function read(): Profile | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw ? (JSON.parse(raw) as Profile) : null;
    return cachedValue;
  } catch {
    return null;
  }
}

function emit() {
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

/** `undefined` = hali o'qilmagan (server/hydration), `null` = profil yo'q, aks holda profil. */
export function useProfile() {
  const profile = useSyncExternalStore<Profile | null | undefined>(subscribe, read, () => undefined);

  const save = useCallback((p: Profile) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      /* private rejim */
    }
    cachedRaw = undefined;
    emit();
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* private rejim */
    }
    cachedRaw = undefined;
    emit();
  }, []);

  return { profile, save, clear };
}

/** Serverdan kelgan profilni mahalliy xotiraga yozadi (null = o'chirish). */
export function setProfileLocal(p: Profile | null) {
  try {
    if (p) window.localStorage.setItem(KEY, JSON.stringify(p));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* private rejim */
  }
  cachedRaw = undefined;
  emit();
}
