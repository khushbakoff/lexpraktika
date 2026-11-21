import ScenarioList from "@/components/ScenarioList";
import { listEmployerSummaries } from "@/lib/employers";
import { listSummaries } from "@/lib/scenarios";

export default function Vaziyatlar() {
  return <ScenarioList scenarios={listSummaries()} employers={listEmployerSummaries()} />;
}
