"use client";

import { useState } from "react";
import Link from "next/link";
import type { Scenario, Step } from "@/lib/content/scenario-schema";
import { useScenarioProgress } from "@/lib/learning/progress";
import { totals } from "@/lib/learning/scoring";
import { missingSources } from "@/lib/content/scenario-schema";
import { useMe } from "@/lib/user/me";
import { resetScenarioResults } from "@/app/actions/progress";
import Icon3D, { type IconName } from "@/components/ui/Icon3D";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import ProgressRing from "@/components/ui/ProgressRing";

const STEP_ICON: Record<Step["type"], IconName> = {
  "client-chat": "chat",
  "document-pick": "folder",
  form: "document",
  "doc-review": "document",
  draft: "document",
  "authority-pick": "court",
  "deadline-pick": "clock",
};

type State = "done" | "current" | "locked";

export default function Roadmap({ scenario }: { scenario: Scenario }) {
  const { results, completed, reset } = useScenarioProgress(scenario.id);
  const [hint, setHint] = useState<string | null>(null);
  const me = useMe();
  const resetAll = () => {
    reset();
    if (me.status === "authed") void resetScenarioResults(scenario.id);
  };

  const firstOpen = scenario.steps.findIndex((s) => !results[s.id]);
  const stateOf = (i: number, s: Step): State => (results[s.id] ? "done" : i === firstOpen ? "current" : "locked");
  const finished = firstOpen === -1;
  const t = totals(Object.values(results));
  const percent = Math.round((completed.length / scenario.steps.length) * 100);

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-8">
      {/* Kompyuterda chap ustun: vaziyat haqida, scroll qilganda joyida turadi */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-10">
        <GlassCard strong className="flex items-center gap-4 lg:flex-col lg:items-start">
          <ProgressRing value={percent} size={72} label={`Vaziyat progressi ${percent} foiz`} />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-soft">{scenario.area}</p>
            <h1 className="text-lg font-bold leading-snug lg:text-2xl">{scenario.title}</h1>
            <p className="text-sm text-soft">
              {completed.length}/{scenario.steps.length} bosqich
              {completed.length > 0 && ` · ${t.score} ball`}
            </p>
          </div>
          {scenario.summary && <p className="hidden text-sm leading-relaxed lg:block">{scenario.summary}</p>}
        </GlassCard>

        {scenario.status === "sample" && (
          <p className="rounded-2xl bg-warn/15 px-4 py-2 text-xs text-warn">
            {missingSources(scenario).length === 0
              ? "Asoslar Lex.uz dagi qonun matnidan olingan. Yurist tasdig'i hali yo'q."
              : "Namunaviy ma'lumot: qonuniy asoslar to'liq emas va yurist tasdiqlamagan."}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
      <ol className="relative flex flex-col gap-3" aria-label="Bosqichlar">
        {scenario.steps.map((step, i) => {
          const st = stateOf(i, step);
          const last = i === scenario.steps.length - 1;
          const href = `/vaziyatlar/${scenario.id}/${step.id}`;
          const card = (
            <GlassCard className={`flex flex-col gap-1 ${st === "locked" ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-soft">{i + 1}-bosqich</span>
                <span className="text-xs text-soft">
                  {st === "done" && results[step.id].graded
                    ? `${results[step.id].score}/${results[step.id].max} ball`
                    : `${step.points} ball`}
                </span>
              </div>
              <p className="font-semibold leading-snug">{step.title}</p>
              {st === "current" && <p className="text-sm text-soft">{step.description}</p>}
              {st === "current" && (
                <span className="mt-2 flex min-h-[48px] items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-[var(--accent-contrast)]">
                  Boshlash
                </span>
              )}
              {st === "done" && <span className="text-sm text-accent">Natijani ko&apos;rish</span>}
            </GlassCard>
          );

          return (
            <li key={step.id} className="relative flex gap-3">
              {!last && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[27px] top-14 h-[calc(100%-32px)] w-0.5 ${
                    st === "done" ? "bg-success/70" : "bg-black/10 dark:bg-white/15"
                  }`}
                />
              )}
              <div
                data-current={st === "current" ? "true" : undefined}
                className={`glass relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
                  st === "current" ? "pulse-ring" : ""
                } ${st === "locked" ? "opacity-60" : ""}`}
              >
                <Icon3D name={st === "locked" ? "lock" : st === "done" ? "check" : STEP_ICON[step.type]} size={32} />
              </div>

              {st === "locked" ? (
                <button
                  type="button"
                  className="flex-1 text-left"
                  aria-disabled="true"
                  onClick={() =>
                    setHint(`Avval "${scenario.steps[firstOpen]?.title ?? ""}" bosqichini bajaring.`)
                  }
                >
                  {card}
                </button>
              ) : (
                <Link href={href} className="flex-1" onClick={() => setHint(null)}>
                  {card}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {hint && (
        <p role="status" className="glass rounded-2xl px-4 py-3 text-sm">
          {hint}
        </p>
      )}

      {finished && <GlassButton href={`/vaziyatlar/${scenario.id}/natija`}>Natijani ko&apos;rish</GlassButton>}

      {completed.length > 0 && (
        <button type="button" onClick={resetAll} className="min-h-[44px] self-center px-4 text-sm text-soft underline">
          Boshidan boshlash
        </button>
      )}
      </div>
    </div>
  );
}
