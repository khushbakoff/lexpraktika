import HomeClient from "@/components/HomeClient";
import { listEmployerSummaries } from "@/lib/employers";
import { listSummaries } from "@/lib/scenarios";

export default function Home() {
  return <HomeClient scenarios={listSummaries()} employers={listEmployerSummaries()} />;
}
