import { Suspense } from "react";
import { notFound } from "next/navigation";
import BackLink from "@/components/layout/BackLink";
import Roadmap from "@/components/scenarios/Roadmap";
import PageSkeleton from "@/components/layout/PageSkeleton";
import { getScenario, listScenarios } from "@/lib/content/scenarios";

export function generateStaticParams() {
  return listScenarios().map((s) => ({ id: s.id }));
}

async function Content({ params }: { params: PageProps<"/vaziyatlar/[id]">["params"] }) {
  const { id } = await params;
  const scenario = getScenario(id);
  if (!scenario) notFound();

  return (
    <div className="flex flex-col gap-3">
      <BackLink mode="scenario" fallbackHref="/vaziyatlar" fallbackLabel="Vaziyatlar" />
      <Roadmap scenario={scenario} />
    </div>
  );
}

export default function ScenarioPage(props: PageProps<"/vaziyatlar/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content params={props.params} />
    </Suspense>
  );
}
