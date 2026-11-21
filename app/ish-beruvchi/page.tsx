import EmployerView from "@/components/EmployerView";
import { listEmployers } from "@/lib/employers";
import { listSummaries } from "@/lib/scenarios";

export default function IshBeruvchi() {
  return <EmployerView employers={listEmployers()} scenarios={listSummaries()} />;
}
