"use client";

import Link from "next/link";
import { rememberBack } from "@/lib/back";
import type { ScenarioSummary } from "@/lib/scenarios";
import { AREAS } from "@/lib/tracks";
import { LEVEL_NAME } from "@/lib/recommend";
import GlassCard from "@/components/ui/GlassCard";
import Icon3D from "@/components/ui/Icon3D";

export default function ScenarioCard({
  s,
  recommended,
  done,
  near,
}: {
  s: ScenarioSummary;
  recommended?: boolean;
  done?: number;
  /** Tanlangan darajaga yetmagani uchun qo'shni darajadan qo'shilgan */
  near?: boolean;
}) {
  const icon = AREAS.find((a) => a.id === s.areaId)?.icon ?? "briefcase";
  return (
    <Link href={`/vaziyatlar/${s.id}`} onClick={() => rememberBack("/vaziyatlar")} className="block">
      <GlassCard className="flex items-center gap-3 transition-transform active:scale-[0.99]">
        <Icon3D name={icon} size={44} />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-soft">{s.area}</p>
          <p className="font-semibold leading-snug">{s.title}</p>
          <p className="text-xs text-soft">
            {LEVEL_NAME[s.level] ?? ""} · {done ?? 0}/{s.stepCount} bosqich{near ? " · yaqin daraja" : ""}
          </p>
        </div>
        {recommended && (
          <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">Sizga mos</span>
        )}
      </GlassCard>
    </Link>
  );
}
