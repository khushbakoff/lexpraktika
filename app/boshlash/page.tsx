import Onboarding from "@/components/profile/Onboarding";
import { listEmployerSummaries } from "@/lib/content/employers";

export default function Boshlash() {
  return <Onboarding employers={listEmployerSummaries()} />;
}
