"use client";

import BackLink from "@/components/BackLink";
import type { Scenario } from "@/lib/scenario-schema";
import Link from "next/link";
import { Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useScenarioProgress } from "@/lib/progress";
import { useMe } from "@/lib/me";
import { submitResult } from "@/app/actions/progress";
import type { StepResult } from "@/lib/scoring";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import FactsInput from "./FactsInput";
import DocumentInput from "./DocumentInput";
import FormInput from "./FormInput";
import DocReviewInput from "./DocReviewInput";
import DraftInput from "./DraftInput";
import AuthorityInput from "./AuthorityInput";
import DeadlineInput from "./DeadlineInput";
import FeedbackView from "./FeedbackView";

/** Kompyuterda o'ng panel: vaziyat qisqacha va barcha bosqichlar (qayerdaligingiz ko'rinib turadi). */
function StepRail({ scenario, index, results }: { scenario: Scenario; index: number; results: Record<string, StepResult> }) {
  const firstOpen = scenario.steps.findIndex((s) => !results[s.id]);
  return (
    <aside aria-label="Vaziyat bosqichlari" className="hidden lg:sticky lg:top-10 lg:flex lg:flex-col lg:gap-3">
      <GlassCard strong className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-soft">{scenario.area}</p>
        <p className="font-bold leading-snug">{scenario.title}</p>
        {scenario.summary && <p className="mt-1 line-clamp-5 text-sm text-soft">{scenario.summary}</p>}
      </GlassCard>
      <GlassCard className="p-2">
        <ol className="flex flex-col gap-0.5">
          {scenario.steps.map((s, i) => {
            const done = Boolean(results[s.id]);
            const here = i === index;
            const reachable = done || i === firstOpen;
            const row = (
              <span
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm ${
                  here ? "bg-accent/15 font-semibold text-accent" : done || reachable ? "text-text" : "text-soft"
                } ${!here && reachable ? "hover:bg-black/5 dark:hover:bg-white/10" : ""}`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                    done ? "bg-success text-white" : here ? "bg-accent text-[var(--accent-contrast)]" : "border border-soft/40"
                  }`}
                >
                  {done ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : i + 1}
                </span>
                <span className="line-clamp-1">{s.title}</span>
              </span>
            );
            return (
              <li key={s.id} aria-current={here ? "step" : undefined}>
                {reachable && !here ? <Link href={`/vaziyatlar/${scenario.id}/${s.id}`}>{row}</Link> : row}
              </li>
            );
          })}
        </ol>
      </GlassCard>
    </aside>
  );
}

export default function StepScreen({ scenario, index }: { scenario: Scenario; index: number }) {
  const { results, submit } = useScenarioProgress(scenario.id);
  const me = useMe();
  const [syncError, setSyncError] = useState<string | null>(null);
  const signedIn = me.status === "authed" && (me.role === "student" || me.role === "individual");
  const step = scenario.steps[index];
  const result = results[step.id];
  const next = scenario.steps[index + 1];

  // Oldingi bosqichlar bajarilmagan bo'lsa qulf
  const firstOpen = scenario.steps.findIndex((s) => !results[s.id]);
  const locked = !result && firstOpen !== -1 && index > firstOpen;

  // Natija avval telefonda ko'rsatiladi, keyin server qayta hisoblab rasmiy natijani yozadi.
  const handle = async (r: StepResult) => {
    submit(step.id, r);
    if (!signedIn) return;
    const res = await submitResult(scenario.id, step.id, r.answer);
    if (res.ok) {
      submit(step.id, res.result);
      setSyncError(null);
    } else {
      setSyncError(res.error);
    }
  };

  const back = <BackLink mode="step" fallbackHref={`/vaziyatlar/${scenario.id}`} fallbackLabel="Yo'l xaritasi" />;

  const header = (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-soft">
        {index + 1}-bosqich / {scenario.steps.length} · {step.points} ball
      </p>
      <h1 className="text-2xl font-bold leading-tight">{step.title}</h1>
      {step.description && !result && <p className="mt-1 text-sm text-soft">{step.description}</p>}
    </div>
  );

  // Kompyuterda: chapda bosqich (o'qish uchun qulay kenglik), o'ngda vaziyat paneli
  const layout = (content: ReactNode) => (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8">
      {content}
      <StepRail scenario={scenario} index={index} results={results} />
    </div>
  );

  if (locked) {
    return layout(
      <div className="flex flex-col gap-3">
        {back}
        {header}
        <GlassCard>
          <p className="mb-3 text-sm">Bu bosqich hali qulflangan. Avval oldingi bosqichni bajaring.</p>
          <GlassButton href={`/vaziyatlar/${scenario.id}/${scenario.steps[firstOpen].id}`}>
            Joriy bosqichga o&apos;tish
          </GlassButton>
        </GlassCard>
      </div>,
    );
  }

  return layout(
    <div className="flex min-w-0 flex-col gap-4">
      {back}
      {header}

      {result ? (
        <>
          <FeedbackView result={result} />
          {syncError && (
            <p role="status" className="rounded-2xl bg-warn/15 px-4 py-2 text-xs text-warn">
              Natija serverga saqlanmadi: {syncError}. Telefonda saqlandi.
            </p>
          )}
          <GlassButton
            href={next ? `/vaziyatlar/${scenario.id}/${next.id}` : `/vaziyatlar/${scenario.id}/natija`}
          >
            {next ? "Keyingi bosqich" : "Natijani ko'rish"}
          </GlassButton>
          <p className="text-center text-xs text-soft">Bu o&apos;quv mashqi, yuridik maslahat emas.</p>
        </>
      ) : (
        <>
          {step.type === "client-chat" && (
            <FactsInput scenario={scenario} step={step} onSubmit={handle} />
          )}
          {step.type === "doc-review" && <DocReviewInput step={step} onSubmit={handle} />}
          {step.type === "draft" && <DraftInput scenario={scenario} step={step} onSubmit={handle} />}
          {step.type === "document-pick" && <DocumentInput step={step} onSubmit={handle} />}
          {step.type === "form" && <FormInput step={step} onSubmit={handle} />}
          {step.type === "authority-pick" && <AuthorityInput step={step} onSubmit={handle} />}
          {step.type === "deadline-pick" && <DeadlineInput step={step} onSubmit={handle} />}
        </>
      )}
    </div>,
  );
}
