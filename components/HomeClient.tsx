"use client";

import { useEffect } from "react";
import { Flame, Zap } from "lucide-react";
import { useStreak } from "@/lib/activity";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ScenarioSummary } from "@/lib/scenarios";
import type { EmployerSummary } from "@/lib/employers";
import { useProfile } from "@/lib/profile";
import { useAllResults, useTotalXp } from "@/lib/progress";
import { homeFor, useMe } from "@/lib/me";
import { MIN_SHOWN, listForLevel, matchScore, userLevel } from "@/lib/recommend";
import { AREAS, trackById } from "@/lib/tracks";
import GlassCard from "@/components/ui/GlassCard";
import Icon3D, { type IconName } from "@/components/ui/Icon3D";
import PathMap, { type PathNode } from "@/components/PathMap";
import ProgressRing from "@/components/ui/ProgressRing";
import Logo from "@/components/ui/Logo";

export default function HomeClient({ scenarios, employers }: { scenarios: ScenarioSummary[]; employers: EmployerSummary[] }) {
  const router = useRouter();
  const { profile } = useProfile();
  const { xp, level, intoLevel } = useTotalXp();
  const allResults = useAllResults();
  const me = useMe();
  const { streak, doneToday, week } = useStreak();

  // Birinchi kirishda yo'nalish tanlash
  useEffect(() => {
    if (me.status === "loading") return;
    if (me.status === "authed" && homeFor(me.role) !== "/") {
      router.replace(homeFor(me.role)); // universitet/tashkilot o'z paneliga
      return;
    }
    if (profile === null) router.replace("/boshlash");
  }, [profile, me, router]);

  if (!profile || me.status === "loading" || (me.status === "authed" && homeFor(me.role) !== "/")) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="glass h-16 animate-pulse rounded-3xl" />
        <div className="glass h-24 animate-pulse rounded-3xl" />
        <div className="glass h-32 animate-pulse rounded-3xl" />
      </div>
    );
  }

  const track = trackById(profile.trackId);
  // Yo'nalishga mos vaziyatlar, foydalanuvchi darajasiga yaqinlari birinchi (kamida MIN_SHOWN ta mavjud)
  const employer = employers.find((e) => e.id === profile.employerId);
  const empIds = new Set(employer?.scenarioIds ?? []);
  const pool = (() => {
    const mine = scenarios.filter((s) => matchScore(s, profile) >= 2 || empIds.has(s.id));
    return mine.length >= MIN_SHOWN ? mine : scenarios;
  })();
  
  // Ish beruvchi tayyorlik foizi: bajarilgan bosqichlar / jami bosqichlar
  const byId = new Map(scenarios.map((s) => [s.id, s]));
  const totalSteps = (employer?.scenarioIds ?? []).reduce((n, id) => n + (byId.get(id)?.stepCount ?? 0), 0);
  const doneSteps = (employer?.scenarioIds ?? []).reduce(
    (n, id) => n + Math.min(Object.keys(allResults[id] ?? {}).length, byId.get(id)?.stepCount ?? 0),
    0,
  );
  const readiness = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const doneOf = (id: string) => Math.min(Object.keys(allResults[id] ?? {}).length, byId.get(id)?.stepCount ?? 0);
  const path = listForLevel(pool, profile, userLevel(profile), empIds);
  const currentIdx = Math.max(0, path.findIndex(({ s }) => doneOf(s.id) < s.stepCount));

  // Duolingo kabi: joriy mavzuning bosqichlari alohida tugun, avvalgisi bajarilmasa keyingisi qulflangan
  const STEP_ICON: Record<string, IconName> = { "client-chat": "chat", "document-pick": "folder", form: "document", "doc-review": "document", draft: "document", "authority-pick": "court", "deadline-pick": "clock" };
  const nodes: PathNode[] = [];
  const currentHref = path[currentIdx] ? `/vaziyatlar/${path[currentIdx].s.id}` : "/";
  path.forEach(({ s }, i) => {
    const icon = (AREAS.find((a) => a.id === s.areaId)?.icon ?? "briefcase") as IconName;
    if (i === currentIdx) {
      const res = allResults[s.id] ?? {};
      const firstOpen = s.steps.findIndex((st) => !res[st.id]);
      s.steps.forEach((st, k) => {
        const state = res[st.id] ? "done" : k === firstOpen ? "current" : "locked";
        nodes.push({
          key: `${s.id}/${st.id}`,
          title: st.title,
          sub: `${k + 1}/${s.steps.length} · ${s.title}`,
          href: `/vaziyatlar/${s.id}/${st.id}`,
          lockHref: firstOpen >= 0 ? `/vaziyatlar/${s.id}/${s.steps[firstOpen].id}` : currentHref,
          icon: STEP_ICON[st.type] ?? icon,
          state,
        });
      });
    } else {
      const complete = doneOf(s.id) >= s.stepCount;
      nodes.push({ key: s.id, title: s.title, sub: `${doneOf(s.id)}/${s.stepCount} bosqich`, href: `/vaziyatlar/${s.id}`, icon, state: complete ? "done" : "open" });
    }
  });

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-x-10">
      <div className="flex items-center gap-2 lg:hidden">
        <Logo size={32} />
        <span className="flex-1 text-base font-bold tracking-tight">LexPraktika</span>
        <span className="glass flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold" aria-label={`${streak} kunlik seriya`}>
          <Flame size={18} strokeWidth={2} aria-hidden="true" className={streak > 0 ? "text-warn" : "text-soft"} />
          {streak}
        </span>
        <span className="glass flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold" aria-label={`${xp} XP`}>
          <Zap size={18} strokeWidth={2} aria-hidden="true" className="text-accent" />
          {xp}
        </span>
      </div>

      <GlassCard strong className="flex flex-col gap-3 lg:col-start-2">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="font-bold leading-tight">
              {doneToday ? "Bugungi maqsad bajarildi" : "Bugungi maqsad: 1 bosqich"}
            </p>
            <p className="text-sm text-soft">
              {streak > 0 ? `${streak} kunlik seriya. Uzmang.` : "Bitta bosqich bajarib, seriyani boshlang."}
            </p>
          </div>
          <span className="text-right text-xs text-soft">
            {level}-daraja
            <br />
            <span className="font-semibold text-text">{100 - intoLevel} XP qoldi</span>
          </span>
        </div>
        <ul className="flex justify-between" aria-label="Oxirgi 7 kun">
          {week.map((d) => (
            <li key={d.key} className="flex flex-col items-center gap-1 text-xs text-soft">
              <span
                className={`grid h-9 w-9 place-items-center rounded-full border-2 ${
                  d.active ? "border-warn bg-warn/20 text-warn" : d.today ? "border-accent text-accent" : "border-soft/30"
                }`}
              >
                {d.active ? <Flame size={16} strokeWidth={2.25} aria-hidden="true" /> : null}
              </span>
              <span className={d.today ? "font-bold text-text" : ""}>{d.label}</span>
            </li>
          ))}
        </ul>
        <div className="h-2.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10" role="progressbar" aria-label="Daraja" aria-valuenow={intoLevel} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${intoLevel}%` }} />
        </div>
      </GlassCard>

      <header className="flex items-center gap-3 rounded-3xl bg-accent px-4 py-3 text-[var(--accent-contrast)] lg:col-start-2 dark:border dark:border-accent/30 dark:bg-accent/15 dark:text-text">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Yo&apos;nalish</p>
          <h1 className="text-xl font-bold leading-tight">{track?.title}</h1>
        </div>
        <Link href="/boshlash" className="rounded-full bg-white/20 px-3 py-2 text-xs font-semibold">
          O&apos;zgartirish
        </Link>
      </header>

      <section aria-label="Sizning yo'lingiz" className="flex flex-col items-center overflow-x-clip py-2 lg:col-start-1 lg:row-span-4 lg:row-start-1 lg:items-stretch lg:gap-3 lg:py-0">
        <div className="hidden items-end justify-between gap-3 lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-soft">Sizning yo&apos;lingiz</p>
            <h2 className="text-2xl font-bold leading-tight">{path[currentIdx]?.s.title ?? "Vaziyatlar"}</h2>
          </div>
          <Link href="/vaziyatlar" className="shrink-0 text-sm font-semibold text-accent">Barcha vaziyatlar</Link>
        </div>
        <PathMap items={nodes} backTo="/" />
      </section>

      {employer ? (
        <Link href="/ish-beruvchi" className="block lg:col-start-2">
          <GlassCard strong className="flex items-center gap-3 transition-transform active:scale-[0.99]">
            <Icon3D name={employer.icon as IconName} size={48} />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-soft">Ish beruvchi yo&apos;li</p>
              <p className="font-bold leading-tight">{employer.title}</p>
              <p className="text-sm text-soft">Talablarga tayyorlik: {readiness}%</p>
            </div>
            <ProgressRing value={readiness} size={52} label={`Tayyorlik ${readiness} foiz`} />
          </GlassCard>
        </Link>
      ) : (
        <Link href="/boshlash" className="glass flex min-h-[56px] items-center gap-3 rounded-3xl px-4 py-3 lg:col-start-2">
          <Icon3D name="briefcase" size={32} />
          <span className="flex-1 text-sm font-semibold">Qayerga ishga kirmoqchisiz? Ish beruvchini tanlang</span>
        </Link>
      )}

      <p className="px-2 text-center text-xs text-soft lg:hidden">Bu o&apos;quv mashqi, yuridik maslahat emas.</p>
    </div>
  );
}
