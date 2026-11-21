import { NO_AI_ERROR, aiDisabledByUser } from "@/lib/server/ai-guard";
import { z } from "zod";
import { getScenario } from "@/lib/content/scenarios";
import { askClient, ChatError, isAiConfigured } from "@/lib/server/client-chat";
import { signFacts, verifyFacts } from "@/lib/server/chat-proof";
import { checkAiQuota, resolvePlan } from "@/lib/server/plan";

const body = z.object({
  scenarioId: z.string().min(1).max(100),
  stepId: z.string().min(1).max(100),
  message: z.string().trim().min(1).max(400),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(900) }))
    .max(16)
    .default([]),
  /** Oldin ochilgan faktlar va ularning imzosi (server o'zi bergan). */
  facts: z.array(z.string().max(60)).max(50).default([]),
  proof: z.string().max(200).default(""),
});

const json = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, { status, headers });

export async function POST(req: Request) {
  if (aiDisabledByUser(req)) return Response.json({ error: NO_AI_ERROR }, { status: 503 });
  if (!isAiConfigured()) return json({ error: "AI sozlanmagan" }, 503);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const quota = await checkAiQuota(ip);
  if (quota) {
    return json({ error: quota.error }, quota.status, quota.retryAfterSec ? { "Retry-After": String(quota.retryAfterSec) } : undefined);
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "So'rov noto'g'ri" }, 400);
  const { scenarioId, stepId, message, history, facts, proof } = parsed.data;

  const { plan } = await resolvePlan();
  const scenario = getScenario(scenarioId);
  const step = scenario?.steps.find((s) => s.id === stepId);
  if (!scenario || !step || step.type !== "client-chat") return json({ error: "Bosqich topilmadi" }, 404);

  if (!verifyFacts(scenarioId, stepId, facts, proof)) return json({ error: "Suhbat holati noto'g'ri" }, 400);

  try {
    const { reply, newFactIds } = await askClient(scenario, step, history, message, facts);
    const all = [...new Set([...facts, ...newFactIds])];
    return json({ reply, facts: all, proof: signFacts(scenarioId, stepId, all), plan });
  } catch (e) {
    if (e instanceof ChatError) return json({ error: e.message }, e.status);
    return json({ error: "Kutilmagan xato" }, 500);
  }
}
