"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AREAS, LEVELS, TRACKS, trackById } from "@/lib/tracks";
import { useProfile } from "@/lib/profile";
import { useMe } from "@/lib/me";
import { saveMyProfile } from "@/app/actions/progress";
import type { EmployerSummary } from "@/lib/employers";
import Icon3D, { type IconName } from "@/components/ui/Icon3D";
import Logo from "@/components/ui/Logo";
import SelectMark from "@/components/ui/SelectMark";
import GlassCard from "@/components/ui/GlassCard";

type Stage = "employer" | "track" | "interests" | "level";
const DOT: Record<Stage, number> = { employer: 0, track: 0, interests: 1, level: 2 };

const primary =
  "min-h-[52px] w-full rounded-2xl bg-accent px-5 text-base font-semibold text-[var(--accent-contrast)] shadow-[0_6px_18px_color-mix(in_srgb,var(--accent)_30%,transparent)] disabled:opacity-40";

export default function Onboarding({ employers }: { employers: EmployerSummary[] }) {
  const router = useRouter();
  const { profile, save } = useProfile();
  const me = useMe();
  const [history, setHistory] = useState<Stage[]>(["employer"]);
  const stage = history[history.length - 1];
  const go = (s: Stage) => setHistory((h) => [...h, s]);
  const back = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));

  const [employerId, setEmployerId] = useState<string>(profile?.employerId ?? "");
  const [trackId, setTrackId] = useState<string>(profile?.trackId ?? "");
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [level, setLevel] = useState<string>(profile?.level ?? "");

  const employer = employers.find((e) => e.id === employerId);

  const pickEmployer = (e: EmployerSummary) => {
    setEmployerId(e.id);
    setTrackId(e.trackId);
    setInterests(["kasb", ...(trackById(e.trackId)?.areas ?? [])]);
    go("level");
  };
  const otherPlace = () => {
    setEmployerId("");
    go("track");
  };
  const pickTrack = (id: string) => {
    setTrackId(id);
    if (interests.length === 0) setInterests(trackById(id)?.areas ?? []);
  };
  const toggleInterest = (id: string) =>
    setInterests((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const finish = () => {
    const p = { trackId, interests, level, ...(employerId ? { employerId } : {}) };
    save(p);
    if (me.status === "authed" && (me.role === "student" || me.role === "individual")) void saveMyProfile(p);
    router.replace("/");
  };

  const progressIdx = DOT[stage];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {history.length > 1 ? (
          <button
            type="button"
            onClick={back}
            aria-label="Orqaga"
            className="glass grid h-11 w-11 place-items-center rounded-full"
          >
            <ChevronLeft size={22} strokeWidth={1.75} aria-hidden="true" />
          </button>
        ) : (
          <span className="h-11 w-11" />
        )}
        <div className="flex flex-1 gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={progressIdx + 1}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= progressIdx ? "bg-accent" : "bg-black/10 dark:bg-white/15"}`} />
          ))}
        </div>
      </div>

      {stage === "employer" && (
        <>
          <header className="flex flex-col gap-1">
            <Logo size={56} />
            <h1 className="text-2xl font-bold leading-tight">Qayerga ishga kirmoqchisiz?</h1>
            <p className="text-sm text-soft">
              Ish beruvchining talablariga moslab o&apos;rgatamiz: nomzodga talablar va real ish jarayoni.
            </p>
          </header>
          <ul className="flex flex-col gap-3">
            {employers.map((e) => {
              const on = employerId === e.id;
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => pickEmployer(e)}
                    aria-pressed={on}
                    className="glass flex min-h-[88px] w-full items-center gap-3 rounded-3xl p-4 text-left transition-transform active:scale-[0.98]"
                  >
                    <Icon3D name={e.icon as IconName} size={48} />
                    <span className="flex-1">
                      <span className="block font-bold leading-tight">{e.title}</span>
                      <span className="block text-xs text-soft">{e.tagline}</span>
                    </span>
                    <SelectMark on={on} />
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={otherPlace} className="glass min-h-[52px] rounded-2xl px-5 font-semibold active:scale-[0.99]">
            Boshqa joy yoki hali bilmayman
          </button>
        </>
      )}

      {stage === "track" && (
        <>
          <header className="flex flex-col gap-1">
            <Icon3D name="rocket" size={48} />
            <h1 className="text-2xl font-bold leading-tight">Qaysi yo&apos;nalishda ishlamoqchisiz?</h1>
            <p className="text-sm text-soft">Mashqlarni shu kasbga moslab beramiz.</p>
          </header>
          <ul className="grid grid-cols-2 gap-3">
            {TRACKS.map((t, i) => {
              const on = trackId === t.id;
              return (
                <li key={t.id} className={i === TRACKS.length - 1 ? "col-span-2" : ""}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => pickTrack(t.id)}
                    className="glass relative flex h-full min-h-[132px] w-full flex-col items-start gap-2 rounded-3xl p-3 text-left transition-transform active:scale-[0.98]"
                  >
                    <span className="absolute right-3 top-3">
                      <SelectMark on={on} />
                    </span>
                    <Icon3D name={t.icon} size={44} />
                    <span className="font-bold leading-tight">{t.title}</span>
                    <span className="text-xs text-soft">{t.tagline}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" disabled={!trackId} onClick={() => go("interests")} className={primary}>
            Davom etish
          </button>
        </>
      )}

      {stage === "interests" && (
        <>
          <header className="flex flex-col gap-1">
            <Icon3D name="target" size={48} />
            <h1 className="text-2xl font-bold leading-tight">Qaysi sohalar qiziq?</h1>
            <p className="text-sm text-soft">Bir nechtasini tanlang. Birinchi vaziyatlar shulardan bo&apos;ladi.</p>
          </header>
          <ul className="flex flex-col gap-2">
            {AREAS.map((a) => {
              const on = interests.includes(a.id);
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggleInterest(a.id)}
                    className="glass flex min-h-[60px] w-full items-center gap-3 rounded-2xl px-3 text-left active:scale-[0.99]"
                  >
                    <Icon3D name={a.icon} size={36} />
                    <span className="flex-1 font-medium">{a.title}</span>
                    <SelectMark on={on} shape="square" />
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" disabled={interests.length === 0} onClick={() => go("level")} className={primary}>
            Davom etish
          </button>
        </>
      )}

      {stage === "level" && (
        <>
          <header className="flex flex-col gap-1">
            <Icon3D name="star" size={48} />
            <h1 className="text-2xl font-bold leading-tight">Hozirgi darajangiz?</h1>
            <p className="text-sm text-soft">Mashq qiyinligini shunga qarab tanlaymiz.</p>
          </header>
          <ul className="flex flex-col gap-2">
            {LEVELS.map((l) => {
              const on = level === l.id;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setLevel(l.id)}
                    className="glass flex min-h-[64px] w-full items-center gap-3 rounded-2xl px-4 text-left active:scale-[0.99]"
                  >
                    <span className="flex flex-1 flex-col">
                      <span className="font-semibold">{l.title}</span>
                      <span className="text-xs text-soft">{l.note}</span>
                    </span>
                    <SelectMark on={on} />
                  </button>
                </li>
              );
            })}
          </ul>

          {level && (
            <GlassCard className="flex items-center gap-3">
              <Icon3D name={(employer?.icon as IconName) ?? trackById(trackId)?.icon ?? "rocket"} size={44} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-soft">
                  {employer ? "Siz kirmoqchi bo'lgan joy" : "Sizning yo'lingiz"}
                </p>
                <p className="font-bold">{employer?.title ?? trackById(trackId)?.title}</p>
                {!employer && (
                  <p className="text-xs text-soft">
                    {interests.map((i) => AREAS.find((a) => a.id === i)?.title).join(", ")}
                  </p>
                )}
              </div>
            </GlassCard>
          )}

          <button type="button" disabled={!level} onClick={finish} className={primary}>
            Yo&apos;limni boshlash
          </button>
        </>
      )}
    </div>
  );
}
