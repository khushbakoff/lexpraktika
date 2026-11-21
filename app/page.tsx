import HomeClient from "@/components/home/HomeClient";
import { listEmployerSummaries } from "@/lib/content/employers";
import { listSummaries } from "@/lib/content/scenarios";

export default function Home() {
  return <HomeClient scenarios={listSummaries()} employers={listEmployerSummaries()} />;
}
