"use client";

import { useState } from "react";
import Link from "next/link";
import { rememberBack } from "@/lib/back";
import { Check, ChevronRight } from "lucide-react";
import type { Employer } from "@/lib/employer-schema";
import type { Source } from "@/lib/scenario-schema";
import type { ScenarioSummary } from "@/lib/scenarios";
import { useAllResults } from "@/lib/progress";
import { useProfile } from "@/lib/profile";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import Icon3D, { type IconName } from "@/components/ui/Icon3D";
import ProgressRing from "@/components/ui/ProgressRing";
import SourceSheet from "@/components/ui/SourceSheet";
import { LEVEL_NAME } from "@/lib/recommend";

type Prog = { done: number; total: number };

export default function EmployerView({
  employers,
  scenarios,
}: {
  employers: Employer[];
  scenarios: ScenarioSummary[];
}) {
  const { profile } = useProfile();
  const results = useAllResults();
  const [open, setOpen] = useState<Source | null>(null);
  const employer = employers.find((e) => e.id === profile?.employerId);
  const byId = new Map(scenarios.map((s) => [s.id, s]));

  if (profile === undefined) return <div className="glass h-32 animate-pulse rounded-3xl" aria-busy="true" />;

  if (!employer) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Ish beruvchi yo&apos;li</h1>
        <GlassCard className="flex flex-col gap-3">
          <p className="text-sm">
            Qayerga ishga kirmoqchi ekaningizni tanlang: nomzodga talablar va real ish jarayoni shunga moslab o&apos;rgatiladi.
          </p>
          <GlassButton href="/boshlash">Ish beruvchini tanlash</GlassButton>
        </GlassCard>
      </div>
    );
  }

  const stepsDone = (id: string) => Object.keys(results[id] ?? {}).length;
  const prog = (ids: string[]): Prog => ({
    done: ids.reduce((n, id) => n + Math.min(stepsDone(id), byId.get(id)?.stepCount ?? 0), 0),
    total: ids.reduce((n, id) => n + (byId.get(id)?.stepCount ?? 0), 0),
  });
  const pct = (p: Prog) => (p.total === 0 ? 0 : Math.round((p.done / p.total) * 100));
  const scenarioDone = (id: string) => (byId.get(id) ? stepsDone(id) >= byId.get(id)!.stepCount : false);

  const allIds = [...new Set(employer.requirements.flatMap((r) => r.scenarioIds))];
  const overall = pct(prog(allIds));
  const entry = employer.requirements.filter((r) => r.kind === "kirish");
  const work = employer.requirements.filter((r) => r.kind === "ish");

  const Req = ({ r }: { r: Employer["requirements"][number] }) => {
    const p = prog(r.scenarioIds);
    const percent = pct(p);
    return (
      <GlassCard className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold leading-snug">{r.title}</p>
            {r.detail && <p className="text-sm text-soft">{r.detail}</p>}
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
              percent === 100 ? "bg-success/20 text-success" : "bg-accent/20 text-accent"
            }`}
          >
            {percent}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
        </div>
        <ul className="flex flex-col gap-1">
          {r.scenarioIds.map((id) => {
            const s = byId.get(id);
            if (!s) return null;
            return (
              <li key={id}>
                <Link
                  href={`/vaziyatlar/${id}`}
                  onClick={() => rememberBack("/ish-beruvchi")}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl bg-black/5 px-3 py-1.5 text-sm dark:bg-white/5"
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                      scenarioDone(id) ? "border-success bg-success text-white" : "border-soft/40"
                    }`}
                  >
                    {scenarioDone(id) && <Check size={12} strokeWidth={3} aria-hidden="true" />}
                  </span>
                  <span className="flex-1 leading-snug">{s.title}</span>
                  <span className="text-xs text-soft">{LEVEL_NAME[s.level]}</span>
                  <ChevronRight size={16} className="text-soft" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
        {r.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {r.sources.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOpen(src)}
                className="min-h-[36px] rounded-full bg-accent/10 px-3 text-xs font-semibold text-accent"
              >
                Asos: {src.article}
              </button>
            ))}
          </div>
        )}
      </GlassCard>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Icon3D name={employer.icon as IconName} size={52} />
        <div className="flex-1">
          <p className="text-sm text-soft">Ish beruvchi yo&apos;li</p>
          <h1 className="text-2xl font-bold leading-tight">{employer.title}</h1>
        </div>
        <Link href="/boshlash" className="glass rounded-full px-3 py-2 text-xs font-semibold">
          O&apos;zgartirish
        </Link>
      </header>

      <GlassCard strong className="flex items-center gap-4">
        <ProgressRing value={overall} size={72} label={`Tayyorlik ${overall} foiz`} />
        <div className="flex-1">
          <p className="text-lg font-bold leading-tight">Tayyorlik: {overall}%</p>
          <p className="text-sm text-soft">{employer.about}</p>
        </div>
      </GlassCard>

      {entry.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Nomzodga talablar">
          <h2 className="text-lg font-bold">Nomzodga talablar</h2>
          {entry.map((r) => (
            <Req key={r.id} r={r} />
          ))}
        </section>
      )}

      {employer.workflow.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Ish kuni">
          <h2 className="text-lg font-bold">Ish kuni: real jarayon</h2>
          <GlassCard className="!p-3">
            <ol className="flex flex-col gap-1">
              {employer.workflow.map((w, i) => (
                <li key={w.scenarioId}>
                  <Link href={`/vaziyatlar/${w.scenarioId}`} onClick={() => rememberBack("/ish-beruvchi")} className="flex min-h-[48px] items-center gap-3 rounded-xl px-2">
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        scenarioDone(w.scenarioId) ? "bg-success text-white" : "bg-accent/20 text-accent"
                      }`}
                    >
                      {scenarioDone(w.scenarioId) ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium leading-snug">{w.title}</span>
                    <ChevronRight size={16} className="text-soft" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ol>
          </GlassCard>
        </section>
      )}

      {work.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Ish jarayonidagi bilim va ko'nikmalar">
          <h2 className="text-lg font-bold">Ish jarayonidagi bilim va ko&apos;nikmalar</h2>
          {work.map((r) => (
            <Req key={r.id} r={r} />
          ))}
        </section>
      )}

      <p className="px-2 text-center text-xs text-soft">
        Talablar rasmiy qonun va yo&apos;riqnomalardan olingan, yurist tasdig&apos;i hali yo&apos;q. Bu o&apos;quv mashqi, yuridik maslahat emas.
      </p>
      {open && <SourceSheet source={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
