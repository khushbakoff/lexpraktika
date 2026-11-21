import Onboarding from "@/components/Onboarding";
import { listEmployerSummaries } from "@/lib/employers";

export default function Boshlash() {
  return <Onboarding employers={listEmployerSummaries()} />;
}
