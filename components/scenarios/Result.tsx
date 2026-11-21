"use client";

import Link from "next/link";
import BackLink from "@/components/layout/BackLink";
import type { Scenario } from "@/lib/content/scenario-schema";
import { useScenarioProgress } from "@/lib/learning/progress";
import { totals } from "@/lib/learning/scoring";
import { missingSources } from "@/lib/content/scenario-schema";
import { useMe } from "@/lib/user/me";
import { resetScenarioResults } from "@/app/actions/progress";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import Icon3D from "@/components/ui/Icon3D";
import ProgressRing from "@/components/ui/ProgressRing";

export default function Result({ scenario }: { scenario: Scenario }) {
  const { results, reset } = useScenarioProgress(scenario.id);
  const me = useMe();
  const resetAll = () => {
    reset();
    if (me.status === "authed") void resetScenarioResults(scenario.id);
  };
  const done = scenario.steps.filter((s) => results[s.id]);
  const finished = done.length === scenario.steps.length;

  const back = <BackLink mode="step" fallbackHref={`/vaziyatlar/${scenario.id}`} fallbackLabel="Yo'l xaritasi" />;

  if (!finished) {
    return (
      <div className="flex flex-col gap-3">
        {back}
        <GlassCard>
          <p className="mb-3 text-sm">Natija barcha bosqichlar tugagach chiqadi.</p>
          <GlassButton href={`/vaziyatlar/${scenario.id}`}>Yo&apos;l xaritasiga qaytish</GlassButton>
        </GlassCard>
      </div>
    );
  }

  const t = totals(done.map((s) => results[s.id]));
  const graded = done.filter((s) => results[s.id].graded);
  const weakest = [...graded].sort(
    (a, b) => results[a.id].score / results[a.id].max - results[b.id].score / results[b.id].max,
  )[0];
  const weakestPerfect = weakest && results[weakest.id].score === results[weakest.id].max;

  return (
    <div className="flex flex-col gap-4">
      {back}
      <GlassCard strong className="flex flex-col items-center gap-2 text-center">
        <Icon3D name="scale" size={56} />
        <h1 className="text-xl font-bold">{scenario.title}</h1>
        <ProgressRing value={t.percent} size={96} label={`Natija ${t.percent} foiz`} />
        <p className="text-lg font-semibold">
          {t.score} / {t.max} ball
        </p>
      </GlassCard>

      <GlassCard className="flex flex-col gap-3">
        <h2 className="font-bold">Bosqichlar bo&apos;yicha</h2>
        {scenario.steps.map((s, i) => {
          const r = results[s.id];
          const pct = r.graded ? Math.round((r.score / r.max) * 100) : 0;
          return (
            <Link key={s.id} href={`/vaziyatlar/${scenario.id}/${s.id}`} className="block">
              <div className="mb-1 flex justify-between gap-2 text-sm">
                <span>
                  {i + 1}. {s.title}
                </span>
                <span className="shrink-0 text-soft">{r.graded ? `${r.score}/${r.max}` : "ballanmadi"}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
            </Link>
          );
        })}
      </GlassCard>

      {weakest && !weakestPerfect && (
        <GlassCard className="flex gap-3">
          <Icon3D name="shield" size={40} />
          <div>
            <p className="font-bold">Mashq qilish kerak</p>
            <p className="text-sm text-soft">
              Eng past natija: &quot;{weakest.title}&quot;. Bosqichni ochib, xatolar izohini qayta o&apos;qing.
            </p>
          </div>
        </GlassCard>
      )}

      {scenario.status === "sample" && (
        <p className="rounded-2xl bg-warn/15 px-4 py-2 text-xs text-warn">
          {missingSources(scenario).length === 0
            ? "Asoslar Lex.uz dagi qonun matnidan olingan. Yurist tasdig'i hali yo'q."
            : "Namunaviy ma'lumot: qonuniy asoslar to'liq emas va yurist tasdiqlamagan."}
          {scenario.steps.some((st) => results[st.id] && !results[st.id].graded) && " Ba'zi bosqichlar ballanmadi."}
        </p>
      )}

      <GlassButton href="/vaziyatlar">Boshqa vaziyatlar</GlassButton>
      <button type="button" onClick={resetAll} className="min-h-[44px] self-center px-4 text-sm text-soft underline">
        Qayta urinish
      </button>
      <p className="text-center text-xs text-soft">Bu o&apos;quv mashqi, yuridik maslahat emas.</p>
    </div>
  );
}
