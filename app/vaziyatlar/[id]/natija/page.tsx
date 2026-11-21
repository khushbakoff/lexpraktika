import { Suspense } from "react";
import { notFound } from "next/navigation";
import Result from "@/components/scenarios/Result";
import PageSkeleton from "@/components/layout/PageSkeleton";
import { getScenario, listScenarios } from "@/lib/content/scenarios";

export function generateStaticParams() {
  return listScenarios().map((s) => ({ id: s.id }));
}

async function Content({ params }: { params: PageProps<"/vaziyatlar/[id]/natija">["params"] }) {
  const { id } = await params;
  const scenario = getScenario(id);
  if (!scenario) notFound();
  return <Result scenario={scenario} />;
}

export default function NatijaPage(props: PageProps<"/vaziyatlar/[id]/natija">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content params={props.params} />
    </Suspense>
  );
}
