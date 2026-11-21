import { NO_AI_ERROR, aiDisabledByUser } from "@/lib/server/ai-guard";
import { z } from "zod";
import { getScenario } from "@/lib/scenarios";
import { ChatError, isAiConfigured } from "@/lib/server/ai";
import { gradeDraft } from "@/lib/server/grade-document";
import { signFacts } from "@/lib/server/chat-proof";
import { checkAiQuota } from "@/lib/server/plan";

const body = z.object({
  scenarioId: z.string().min(1).max(100),
  stepId: z.string().min(1).max(100),
  text: z.string().trim().min(20).max(4000),
});

const json = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, { status, headers });

export async function POST(req: Request) {
  if (aiDisabledByUser(req)) return Response.json({ error: NO_AI_ERROR }, { status: 503 });
  if (!isAiConfigured()) return json({ error: "AI sozlanmagan" }, 503);

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Matn juda qisqa yoki noto'g'ri" }, 400);
  const { scenarioId, stepId, text } = parsed.data;

  const scenario = getScenario(scenarioId);
  const step = scenario?.steps.find((s) => s.id === stepId);
  if (!scenario || !step || step.type !== "draft") return json({ error: "Bosqich topilmadi" }, 404);
  if (text.length < step.minChars) return json({ error: `Kamida ${step.minChars} belgi yozing` }, 400);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const quota = await checkAiQuota(ip);
  if (quota) {
    return json({ error: quota.error }, quota.status, quota.retryAfterSec ? { "Retry-After": String(quota.retryAfterSec) } : undefined);
  }

  try {
    const items = await gradeDraft(scenario, step, text);
    const met = items.filter((i) => i.met).map((i) => i.id);
    return json({ items, proof: signFacts(scenarioId, stepId, met, "draft") });
  } catch (e) {
    if (e instanceof ChatError) return json({ error: e.message }, e.status);
    return json({ error: "Kutilmagan xato" }, 500);
  }
}
