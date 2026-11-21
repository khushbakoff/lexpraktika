import ScenarioList from "@/components/scenarios/ScenarioList";
import { listEmployerSummaries } from "@/lib/content/employers";
import { listSummaries } from "@/lib/content/scenarios";

export default function Vaziyatlar() {
  return <ScenarioList scenarios={listSummaries()} employers={listEmployerSummaries()} />;
}
