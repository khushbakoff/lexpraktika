import EmployerView from "@/components/panels/EmployerView";
import { listEmployers } from "@/lib/content/employers";
import { listSummaries } from "@/lib/content/scenarios";

export default function IshBeruvchi() {
  return <EmployerView employers={listEmployers()} scenarios={listSummaries()} />;
}
