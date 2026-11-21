"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/app/actions/auth";
import { homeFor, refreshMe, useMe } from "@/lib/me";
import GlassCard from "@/components/ui/GlassCard";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import SelectMark from "@/components/ui/SelectMark";
import { getMiniApp, useInMiniApp } from "@/components/TelegramMiniApp";

const input =
  "min-h-[52px] w-full rounded-2xl border border-soft/30 bg-white/40 px-4 text-base text-text placeholder:text-soft dark:bg-white/10";
const primary =
  "min-h-[52px] w-full rounded-2xl bg-accent px-5 text-base font-semibold text-[var(--accent-contrast)] shadow-[0_6px_18px_color-mix(in_srgb,var(--accent)_30%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-soft/20 disabled:text-soft disabled:shadow-none";

const ERRORS: Record<string, string> = {
  consent: "Davom etish uchun shartlar va maxfiylik siyosatiga rozilik bering.",
  telegram: "Telegram orqali kirib bo'lmadi. Qayta urinib ko'ring.",
  "telegram-off": "Telegram orqali kirish hali sozlanmagan.",
  state: "Kirish seansi eskirgan. Qayta urinib ko'ring.",
};

type Providers = { telegram: string | null };

/** Rozilik holati cookie'da: Telegram qaytish marshrutlari yangi hisob yaratishdan oldin shuni tekshiradi. */
function setConsentCookie(on: boolean) {
  document.cookie = `lexsim_consent=${on ? "1" : ""}; path=/; max-age=${on ? 600 : 0}; SameSite=Lax`;
}


function TelegramWidget({ bot }: { bot: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.setAttribute("data-telegram-login", bot);
    s.setAttribute("data-size", "large");
    s.setAttribute("data-radius", "16");
    s.setAttribute("data-auth-url", "/api/auth/telegram");
    s.setAttribute("data-request-access", "write");
    el.appendChild(s);
    return () => {
      el.innerHTML = "";
    };
  }, [bot]);
  return <div ref={ref} data-no-i18n className="flex min-h-[52px] items-center justify-center" />;
}

export default function LoginForm() {
  const router = useRouter();
  const me = useMe();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Providers>({ telegram: null });
  const [pending, start] = useTransition();

  // ?error=... (Telegram qaytishidan keyin)
  const search = useSyncExternalStore(
    () => () => {},
    () => window.location.search,
    () => "",
  );
  const urlCode = new URLSearchParams(search).get("error");
  const urlError = urlCode ? (ERRORS[urlCode] ?? "Kirishda xatolik yuz berdi.") : null;

  useEffect(() => {
    fetch("/api/auth/providers", { cache: "no-store" })
      .then((r) => r.json())
      .then((p: Providers) => setProviders(p))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setConsentCookie(accepted);
  }, [accepted]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      if (mode === "login") {
        const r = await signIn(login, password);
        if (!r.ok) return setError(r.error);
      } else {
        if (!accepted) return setError(ERRORS.consent);
        const r = await signUp(login, password, fullName, accepted);
        if (!r.ok) return setError(r.error);
      }
      await refreshMe();
    });
  };

  // Kirgandan keyin rolga qarab yo'naltirish
  const target = me.status === "authed" ? (me.mustChangePassword ? "/profil" : homeFor(me.role)) : null;
  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  const inMiniApp = useInMiniApp();
  const miniLogin = () =>
    start(async () => {
      const app = getMiniApp();
      if (!app) return;
      const r = await fetch("/api/auth/telegram-webapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: app.initData, accepted }),
      });
      if (r.ok) return void (await refreshMe());
      const d = (await r.json().catch(() => ({}))) as { error?: string };
      setError(d.error === "consent" ? ERRORS.consent : ERRORS.telegram);
    });

  const social = accepted ? "" : "pointer-events-none opacity-50";

  return (
    <div className="flex flex-col gap-4">
      <ThemeToggle compact className="self-end" />
      <header className="flex flex-col items-center gap-2 text-center">
        <Logo size={72} />
        <h1 className="text-2xl font-bold">{mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}</h1>
        <p className="text-sm text-soft">Ilovadan foydalanish uchun hisob kerak.</p>
      </header>

      {me.status === "unconfigured" && (
        <p className="rounded-2xl bg-warn/15 px-4 py-2 text-xs text-warn">
          Server hali sozlanmagan (MongoDB ulanmagan). Kirish ishlamaydi.
        </p>
      )}

      <div role="tablist" aria-label="Kirish yoki ro'yxatdan o'tish" className="glass flex gap-1 rounded-2xl p-1">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`min-h-[44px] flex-1 rounded-xl text-sm font-semibold transition-colors ${
              mode === m ? "bg-accent text-[var(--accent-contrast)]" : "text-text"
            }`}
          >
            {m === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
          </button>
        ))}
      </div>

      <GlassCard strong>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              className={input}
              placeholder="Ism familiya"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
            />
          )}
          <input
            className={input}
            placeholder={mode === "login" ? "Login yoki email" : "Email"}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            inputMode={mode === "signup" ? "email" : "text"}
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <input
            className={input}
            type="password"
            placeholder="Parol"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {(error ?? urlError) && (
            <p role="alert" className="text-sm text-warn">
              {error ?? urlError}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || !login || !password || (mode === "signup" && !accepted)}
            aria-busy={pending}
            className={primary}
          >
            {pending ? "Kutilmoqda..." : mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
          </button>
        </form>
      </GlassCard>

      <button
        type="button"
        role="checkbox"
        aria-checked={accepted}
        onClick={() => setAccepted((a) => !a)}
        className="glass flex items-start gap-3 rounded-2xl p-3 text-left text-sm"
      >
        <SelectMark on={accepted} shape="square" />
        <span className="flex-1">
          Men{" "}
          <Link href="/shartlar" onClick={(e) => e.stopPropagation()} className="font-semibold text-accent underline">
            Foydalanish shartlari
          </Link>{" "}
          va{" "}
          <Link href="/maxfiylik" onClick={(e) => e.stopPropagation()} className="font-semibold text-accent underline">
            Maxfiylik siyosati
          </Link>{" "}
          bilan tanishdim va roziman.
        </span>
      </button>

      <div className="flex items-center gap-3 text-xs text-soft" aria-hidden="true">
        <span className="h-px flex-1 bg-soft/30" />
        yoki
        <span className="h-px flex-1 bg-soft/30" />
      </div>

      <div className={`flex flex-col gap-3 transition-opacity ${social}`}>
        {inMiniApp ? (
          <button
            type="button"
            onClick={miniLogin}
            disabled={pending}
            className="flex min-h-[52px] items-center justify-center gap-3 rounded-2xl bg-accent px-5 font-semibold text-[var(--accent-contrast)] disabled:opacity-60"
          >
            <span>Telegram hisobim bilan kirish</span>
          </button>
        ) : providers.telegram ? (
          <TelegramWidget bot={providers.telegram} />
        ) : (
          <button
            type="button"
            onClick={() => setError(ERRORS["telegram-off"])}
            className="glass flex min-h-[52px] items-center justify-center gap-3 rounded-2xl px-5 font-semibold"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#229ED9" d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.300-1.800.8l-4.900-3.600-2.400 2.300c-.3.300-.5.500-1 .5l.4-5 9.100-8.200c.4-.4-.1-.6-.6-.2L6.300 13 1.500 11.500c-1-.3-1-1 .2-1.500L20.300 2.900c.9-.3 1.600.2 1.600 1.400z" />
            </svg>
            <span>Telegram orqali davom etish</span>
          </button>
        )}
        {!accepted && <p className="text-center text-xs text-soft">Telegram uchun avval rozilik belgisini qo&apos;ying.</p>}
      </div>
    </div>
  );
}
