"use client";

import { useEffect, useSyncExternalStore } from "react";
import { refreshMe, useMe } from "@/lib/me";

type WebApp = { initData: string; ready: () => void; expand: () => void; disableVerticalSwipes?: () => void; setHeaderColor?: (c: string) => void };
declare global {
  interface Window {
    Telegram?: { WebApp?: WebApp };
  }
}

export const getMiniApp = (): WebApp | null => (typeof window !== "undefined" && window.Telegram?.WebApp?.initData ? window.Telegram.WebApp : null);

/** Telegram skripti kech yuklanishi mumkin: 3 soniya davomida tekshirib turadi. */
export function useInMiniApp(): boolean {
  return useSyncExternalStore(
    (cb) => {
      let n = 0;
      const t = setInterval(() => {
        cb();
        if (getMiniApp() || ++n > 10) clearInterval(t);
      }, 300);
      return () => clearInterval(t);
    },
    () => Boolean(getMiniApp()),
    () => false,
  );
}

/** Telegram Mini App ichida ochilganda: to'liq ekran va mavjud hisob bilan jim kirish. */
export default function TelegramMiniApp() {
  const me = useMe();
  useEffect(() => {
    const app = getMiniApp();
    if (!app) return;
    app.ready();
    app.expand();
    app.disableVerticalSwipes?.();
  }, []);

  useEffect(() => {
    if (me.status !== "anon") return;
    const app = getMiniApp();
    if (!app) return;
    void fetch("/api/auth/telegram-webapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: app.initData }),
    }).then(async (r) => {
      if (r.ok) await refreshMe();
    });
  }, [me.status]);
  return null;
}
