"use client";

import { useSyncExternalStore } from "react";
import { getMe } from "@/app/actions/auth";
import { replaceAllResults, clearAllProgress } from "./progress";
import { setProfileLocal } from "./profile";
import type { StepResult } from "./scoring";

type Role = "individual" | "student" | "university_admin" | "org_member" | "platform_admin";

export type Me =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "anon" }
  | {
      status: "authed";
      role: Role;
      fullName: string | null;
      login: string | null;
      universityName: string | null;
      organizationName: string | null;
      mustChangePassword: boolean;
    };

const LOADING: Me = { status: "loading" };
const CACHE_KEY = "lexsim:me:v1";
let state: Me = LOADING;
let triedCache = false;
const listeners = new Set<() => void>();
const set = (m: Me) => {
  state = m;
  triedCache = true;
  // Keyingi ochilishda sahifa serverdan javob kutmasdan chizilishi uchun oxirgi holat eslab qolinadi (faqat interfeys uchun: ruxsatni server tekshiradi)
  try {
    if (m.status === "authed") window.localStorage.setItem(CACHE_KEY, JSON.stringify(m));
    else window.localStorage.removeItem(CACHE_KEY);
  } catch {
    /* private rejim */
  }
  listeners.forEach((l) => l());
};

/** Brauzerda birinchi o'qishda oxirgi ma'lum holatni beradi (server javobi kelguncha kutish ekrani chiqmaydi). */
function snapshot(): Me {
  if (state === LOADING && !triedCache) {
    triedCache = true;
    try {
      const raw = window.localStorage.getItem(CACHE_KEY);
      if (raw) {
        const m = JSON.parse(raw) as Me;
        if (m.status === "authed") state = m;
      }
    } catch {
      /* private rejim */
    }
  }
  return state;
}

export function useMe(): Me {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    snapshot,
    () => LOADING,
  );
}

/** Serverdan joriy foydalanuvchini oladi va mahalliy xotirani unga moslaydi. */
export async function refreshMe() {
  try {
    const r = await getMe();
    if (r.status !== "authed") {
      set({ status: r.status });
      return;
    }
    if (r.role === "student" || r.role === "individual") {
      replaceAllResults(r.results as Record<string, Record<string, StepResult>>);
      setProfileLocal(r.profile); // server profili bo'lmasa onboarding qayta chiqadi
    }
    set({
      status: "authed",
      role: r.role,
      fullName: r.fullName,
      login: r.login,
      universityName: r.universityName,
      organizationName: r.organizationName,
      mustChangePassword: r.mustChangePassword,
    });
  } catch {
    set({ status: "anon" }); // tarmoq xatosi: mahalliy rejimda davom etadi
  }
}

export function clearLocalAfterSignOut() {
  try {
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
    /* private rejim */
  }
  clearAllProgress();
  setProfileLocal(null);
  set({ status: "anon" });
}

export function homeFor(role: Role): string {
  if (role === "university_admin") return "/universitet";
  if (role === "org_member") return "/tashkilot";
  return "/";
}
