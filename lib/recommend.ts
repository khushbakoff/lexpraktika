import type { ScenarioSummary } from "./scenarios";
import type { Profile } from "./profile";

export const LEVEL_NUM: Record<string, number> = { boshlovchi: 1, orta: 2, ilgor: 3 };
export const LEVEL_NAME = ["", "Boshlovchi", "O'rta", "Qiyin"] as const;
/** Daraja tanlanganda kamida shuncha vaziyat ko'rsatiladi (yetmasa qo'shni darajalar bilan to'ldiriladi). */
export const MIN_SHOWN = 10;

export const userLevel = (p: Profile | null | undefined) => LEVEL_NUM[p?.level ?? ""] ?? 2;

/** Yo'nalishga mos = +2, qiziqish sohasiga mos = +1. */
export function matchScore(s: ScenarioSummary, p: Profile | null | undefined): number {
  if (!p) return 0;
  const trackOk = p.trackId === "umumiy" || s.tracks.includes(p.trackId);
  return (trackOk ? 2 : 0) + (p.interests.includes(s.areaId) ? 1 : 0);
}

/** Tartib: yo'nalishga mos, darajaga yaqin, qiziqishga mos. */
export function sortForProfile(
  list: ScenarioSummary[],
  p: Profile | null | undefined,
  level = userLevel(p),
  priority?: ReadonlySet<string>,
) {
  return [...list].sort(
    (a, b) =>
      Number(priority?.has(b.id) ?? false) - Number(priority?.has(a.id) ?? false) ||
      Number(matchScore(b, p) >= 2) - Number(matchScore(a, p) >= 2) ||
      Math.abs(a.level - level) - Math.abs(b.level - level) ||
      matchScore(b, p) - matchScore(a, p) ||
      a.title.localeCompare(b.title),
  );
}

export type LeveledItem = { s: ScenarioSummary; near: boolean };

/**
 * Tanlangan daraja bo'yicha ro'yxat: avval shu daraja, yetmasa eng yaqin darajalar bilan MIN_SHOWN gacha to'ldiriladi
 * (to'ldirilganlar near=true). level=null bo'lsa hammasi, daraja yaqinligi bo'yicha.
 */
export function listForLevel(
  list: ScenarioSummary[],
  p: Profile | null | undefined,
  level: number | null,
  priority?: ReadonlySet<string>,
): LeveledItem[] {
  const pool = sortForProfile(list, p, level ?? userLevel(p), priority);
  if (level === null) return pool.map((s) => ({ s, near: false }));
  const exact = pool.filter((s) => s.level === level);
  const rest = pool.filter((s) => s.level !== level).sort((a, b) => Math.abs(a.level - level) - Math.abs(b.level - level));
  const need = Math.max(0, MIN_SHOWN - exact.length);
  return [...exact.map((s) => ({ s, near: false })), ...rest.slice(0, need).map((s) => ({ s, near: true }))];
}
