"use client";

import { useMemo, useState } from "react";
import type { ScenarioSummary } from "@/lib/scenarios";
import type { EmployerSummary } from "@/lib/employers";
import { useProfile } from "@/lib/profile";
import { LEVEL_NAME, MIN_SHOWN, listForLevel, matchScore } from "@/lib/recommend";
import { type IconName } from "@/components/ui/Icon3D";
import PathMap, { type PathItem } from "@/components/PathMap";
import { useAllResults } from "@/lib/progress";
import { AREAS } from "@/lib/tracks";

const SOON: { title: string; area: string; icon: IconName }[] = [
  { title: "YaTT ochish", area: "Tadbirkorlik", icon: "money" },
];

export default function ScenarioList({ scenarios, employers }: { scenarios: ScenarioSummary[]; employers: EmployerSummary[] }) {
  const { profile } = useProfile();
  // null = hammasi; aks holda 1..3. Boshlang'ich qiymat: foydalanuvchi darajasi.
  const [picked, setPicked] = useState<number | null | undefined>(undefined);
  const level = picked === undefined ? null : picked;

  // Yo'nalishga mos vaziyatlar; kam bo'lsa (10 dan) hammasi ko'rsatiladi
  const pool = useMemo(() => {
    const emp = employers.find((e) => e.id === profile?.employerId);
    const empIds = new Set(emp?.scenarioIds ?? []);
    const mine = profile ? scenarios.filter((s) => matchScore(s, profile) >= 2 || empIds.has(s.id)) : scenarios;
    return mine.length >= MIN_SHOWN ? mine : scenarios;
  }, [scenarios, employers, profile]);

  // Tanlangan ish beruvchiga bog'liq vaziyatlar birinchi chiqadi
  const priority = useMemo(
    () => new Set(employers.find((e) => e.id === profile?.employerId)?.scenarioIds ?? []),
    [employers, profile],
  );
  const items = useMemo(() => listForLevel(pool, profile, level, priority), [pool, profile, level, priority]);
  const count = (l: number) => pool.filter((s) => s.level === l).length;
  const results = useAllResults();
  // Xarita: hammasi ochiq, daraja bo'yicha sarlavhalar bilan
  const mapItems: PathItem[] = [];
  let lastLevel = -1;
  const ordered = level === null ? [...items].sort((a, b) => a.s.level - b.s.level) : items;
  for (const { s } of ordered) {
    if (s.level !== lastLevel) {
      lastLevel = s.level;
      mapItems.push({ key: `h${s.level}`, header: `${LEVEL_NAME[s.level]} daraja` });
    }
    const done = Math.min(Object.keys(results[s.id] ?? {}).length, s.stepCount);
    mapItems.push({
      key: s.id,
      title: s.title,
      sub: `${s.area} · ${done}/${s.stepCount} bosqich`,
      href: `/vaziyatlar/${s.id}`,
      icon: (AREAS.find((a) => a.id === s.areaId)?.icon ?? "briefcase") as IconName,
      state: done >= s.stepCount ? "done" : "open",
    });
  }
  for (const it of SOON) mapItems.push({ key: it.title, title: it.title, sub: `${it.area} · tez orada`, href: "/vaziyatlar", icon: it.icon, state: "locked" });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Vaziyatlar</h1>

      <div className="glass grid grid-cols-4 gap-1 rounded-2xl p-1" role="group" aria-label="Daraja bo'yicha filtr">
        {[null, 1, 2, 3].map((l) => {
          const on = level === l;
          return (
            <button
              key={String(l)}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(l)}
              className={`flex min-h-[52px] min-w-0 flex-col items-center justify-center rounded-xl px-1 leading-tight transition-colors ${
                on ? "bg-accent text-[var(--accent-contrast)] shadow-sm" : "text-text"
              }`}
            >
              <span className="max-w-full truncate text-[13px] font-semibold">{l === null ? "Hammasi" : LEVEL_NAME[l]}</span>
              <span className={`text-xs font-medium ${on ? "opacity-85" : "text-soft"}`}>{l === null ? pool.length : count(l)}</span>
            </button>
          );
        })}
      </div>
      {level !== null && items.some((i) => i.near) && (
        <p className="text-xs text-soft">
          Bu darajada {count(level)} ta vaziyat bor. Kamida {MIN_SHOWN} ta ko&apos;rsatish uchun qo&apos;shni darajalardan qo&apos;shildi.
        </p>
      )}

      <PathMap items={mapItems} backTo="/vaziyatlar" />
    </div>
  );
}
