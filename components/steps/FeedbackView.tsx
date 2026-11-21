"use client";

import { useState } from "react";
import { Check, ChevronRight, Info, X } from "lucide-react";
import type { Source } from "@/lib/scenario-schema";
import type { StepResult } from "@/lib/scoring";
import GlassCard from "@/components/ui/GlassCard";
import SourceSheet from "@/components/ui/SourceSheet";

/** Qonuniy asos: har manba tugma, bosilganda modda matni pastdan chiqadi. */
function LegalBasis({ sources, onOpen }: { sources?: Source[]; onOpen: (s: Source) => void }) {
  const list = (sources ?? []).filter((x) => x.act);
  if (list.length === 0) {
    return <p className="mt-1 text-xs text-warn">Qonuniy asos: manba hali tasdiqlanmagan</p>;
  }
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {list.map((x, i) => (
        <li key={i}>
          <button
            type="button"
            onClick={() => onOpen(x)}
            className="flex min-h-[40px] w-full items-center gap-1 rounded-xl bg-accent/10 px-3 py-1.5 text-left text-xs font-semibold text-accent"
          >
            <span className="flex-1">
              Asos: {x.article}
              <span className="font-normal text-soft"> · {x.act.replace(/\s*\(.*\)\s*$/, "")}</span>
            </span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function FeedbackView({ result }: { result: StepResult }) {
  const [open, setOpen] = useState<Source | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <GlassCard strong className="text-center">
        {result.graded ? (
          <>
            <p className="text-3xl font-bold">
              {result.score}
              <span className="text-lg text-soft"> / {result.max}</span>
            </p>
            <p className="text-sm text-soft">ball</p>
          </>
        ) : (
          <p className="font-semibold">Bu bosqich ballanmadi</p>
        )}
      </GlassCard>

      <ul className="flex flex-col gap-2">
        {result.feedback.map((f, i) => (
          <li key={i}>
            <GlassCard className="flex gap-3 !p-3">
              <span
                className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                  f.ok === true
                    ? "bg-success/20 text-success"
                    : f.ok === false
                      ? "bg-warn/20 text-warn"
                      : "bg-soft/20 text-soft"
                }`}
              >
                {f.ok === true ? (
                  <Check size={16} strokeWidth={2.5} aria-label="To'g'ri" />
                ) : f.ok === false ? (
                  <X size={16} strokeWidth={2.5} aria-label="Xato" />
                ) : (
                  <Info size={16} strokeWidth={2.5} aria-label="Ma'lumot" />
                )}
              </span>
              <div className="flex-1">
                <p className="font-semibold leading-snug">{f.label}</p>
                <p className="text-sm text-soft">{f.note}</p>
                {f.ok !== null && f.sources !== undefined && <LegalBasis sources={f.sources} onOpen={setOpen} />}
              </div>
            </GlassCard>
          </li>
        ))}
      </ul>
      {open && <SourceSheet source={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
