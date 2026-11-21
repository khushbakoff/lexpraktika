"use client";

import { useMemo, useState } from "react";
import type { Step } from "@/lib/scenario-schema";
import { scoreAuthority, type StepResult } from "@/lib/scoring";
import Icon3D from "@/components/ui/Icon3D";

type Props = { step: Extract<Step, { type: "authority-pick" }>; onSubmit: (r: StepResult) => void };

/** Organlarni murojaat tartibida bosib raqamlang. Raqamlangan elementni bossangiz bekor bo'ladi. */
export default function AuthorityInput({ step, onSubmit }: Props) {
  // Aralashtirilgan, lekin har renderda bir xil tartib (hydration xatosiz)
  const shown = useMemo(() => {
    const a = [...step.order];
    return [a[2], a[0], a[3], a[1]].filter(Boolean).concat(a.slice(4));
  }, [step.order]);
  const [picked, setPicked] = useState<string[]>([]);

  const tap = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-soft">
        Murojaat qilish tartibida bosing: birinchi bosganingiz 1-o&apos;rin. Bekor qilish uchun raqamli kartani qayta bosing.
      </p>
      <ul className="flex flex-col gap-2">
        {shown.map((o) => {
          const pos = picked.indexOf(o.id);
          const on = pos >= 0;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => tap(o.id)}
                aria-pressed={on}
                className="glass flex min-h-[60px] w-full items-center gap-3 rounded-2xl px-3 text-left transition-transform active:scale-[0.99]"
              >
                <Icon3D name="court" size={36} />
                <span className="flex-1 font-medium">{o.label}</span>
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                    on ? "bg-accent text-[var(--accent-contrast)]" : "border border-soft/40 text-soft"
                  }`}
                >
                  {on ? pos + 1 : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        disabled={picked.length !== step.order.length}
        onClick={() => onSubmit(scoreAuthority(step, picked))}
        className="mt-2 min-h-[52px] rounded-2xl bg-accent px-5 text-base font-semibold text-[var(--accent-contrast)] shadow-[0_6px_18px_color-mix(in_srgb,var(--accent)_30%,transparent)] disabled:opacity-40"
      >
        Tartibni tasdiqlash
      </button>
    </div>
  );
}
