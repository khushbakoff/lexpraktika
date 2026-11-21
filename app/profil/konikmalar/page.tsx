import { SkillsView } from "@/components/profile/ProfileClient";
import { listScenarios } from "@/lib/content/scenarios";

export default function Page() {
  // Bosqich turlari: natijalar qaysi ko'nikmaga tegishli ekanini aniqlash uchun
  const stepTypes: Record<string, string> = {};
  for (const s of listScenarios()) for (const st of s.steps) stepTypes[`${s.id}/${st.id}`] = st.type;
  return <SkillsView stepTypes={stepTypes} />;
}
