import { employerSchema, type Employer } from "@/lib/content/employer-schema";
import { RAW_EMPLOYERS } from "@/lib/content/employer-registry";
import { listScenarios } from "@/lib/content/scenarios";

/** Build vaqtida tekshiriladi: sxema yoki mavjud bo'lmagan vaziyatga havola bo'lsa build yiqiladi. */
const ALL: Employer[] = RAW_EMPLOYERS.map((raw) => employerSchema.parse(raw));
{
  const ids = new Set(listScenarios().map((s) => s.id));
  for (const e of ALL) {
    for (const r of e.requirements)
      for (const id of r.scenarioIds) if (!ids.has(id)) throw new Error(`${e.id}/${r.id}: vaziyat topilmadi: ${id}`);
    for (const w of e.workflow) if (!ids.has(w.scenarioId)) throw new Error(`${e.id}: workflow vaziyati topilmadi: ${w.scenarioId}`);
  }
}

export const listEmployers = (): Employer[] => ALL;
export const getEmployer = (id: string): Employer | undefined => ALL.find((e) => e.id === id);

/** Ish beruvchi bilan bog'liq barcha vaziyat id'lari (talablar + ish kuni), takrorsiz. */
export function employerScenarioIds(e: Employer): string[] {
  return [...new Set([...e.requirements.flatMap((r) => r.scenarioIds), ...e.workflow.map((w) => w.scenarioId)])];
}

/** Client'ga yengil ko'rinish (butun manba matnlarini yubormaslik uchun). */
export type EmployerSummary = {
  id: string;
  title: string;
  trackId: string;
  icon: string;
  tagline: string;
  scenarioIds: string[];
};
export const listEmployerSummaries = (): EmployerSummary[] =>
  ALL.map((e) => ({ id: e.id, title: e.title, trackId: e.trackId, icon: e.icon, tagline: e.tagline, scenarioIds: employerScenarioIds(e) }));
