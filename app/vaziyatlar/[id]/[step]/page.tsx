import { Suspense } from "react";
import { notFound } from "next/navigation";
import StepScreen from "@/components/steps/StepScreen";
import PageSkeleton from "@/components/PageSkeleton";
import { getScenario, listScenarios } from "@/lib/scenarios";

export function generateStaticParams() {
  return listScenarios().flatMap((s) => s.steps.map((st) => ({ id: s.id, step: st.id })));
}

async function Content({ params }: { params: PageProps<"/vaziyatlar/[id]/[step]">["params"] }) {
  const { id, step } = await params;
  const scenario = getScenario(id);
  const index = scenario?.steps.findIndex((s) => s.id === step) ?? -1;
  if (!scenario || index < 0) notFound();
  return <StepScreen scenario={scenario} index={index} />;
}

export default function StepPage(props: PageProps<"/vaziyatlar/[id]/[step]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content params={props.params} />
    </Suspense>
  );
}
