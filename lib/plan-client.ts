"use client";

import { useEffect, useState } from "react";
import { isPlanId, type PlanId } from "./plans";

/** Serverdan joriy tarifni oladi (null = hali yuklanmagan). */
export function usePlan(): PlanId | null {
  const [plan, setPlan] = useState<PlanId | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/plan", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { plan?: unknown }) => alive && setPlan(isPlanId(d.plan) ? d.plan : "free"))
      .catch(() => alive && setPlan("free"));
    return () => {
      alive = false;
    };
  }, []);
  return plan;
}
