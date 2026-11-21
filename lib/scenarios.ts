import { scenarioSchema, type Scenario } from "./scenario-schema";
import { RAW_SCENARIOS } from "./scenario-registry";

/** Build vaqtida tekshiriladi: sxemaga mos kelmasa build yiqiladi. */
const ALL: Scenario[] = RAW_SCENARIOS.map((raw) => scenarioSchema.parse(raw));

export function listScenarios(): Scenario[] {
  return ALL;
}

export function getScenario(id: string): Scenario | undefined {
  return ALL.find((s) => s.id === id);
}

export type ScenarioSummary = {
  id: string;
  title: string;
  area: string;
  areaId: string;
  tracks: string[];
  level: number;
  stepCount: number;
  steps: { id: string; title: string; type: string }[];
};

/** Ro'yxat ekranlari uchun yengil ko'rinish (client'ga butun vaziyatni yubormaslik uchun). */
export function listSummaries(): ScenarioSummary[] {
  return ALL.map((s) => ({
    id: s.id,
    title: s.title,
    area: s.area,
    areaId: s.areaId,
    tracks: s.tracks,
    level: s.level,
    stepCount: s.steps.length,
    steps: s.steps.map((st) => ({ id: st.id, title: st.title, type: st.type })),
  }));
}
