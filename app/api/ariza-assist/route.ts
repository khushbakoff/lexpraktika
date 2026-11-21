import { z } from "zod";
import { getArizaTask } from "@/lib/ariza";
import { NO_AI_ERROR, aiDisabledByUser } from "@/lib/server/ai-guard";
import { ChatError, isAiConfigured } from "@/lib/server/ai";
import { assistAriza } from "@/lib/server/ariza-assist";
import { checkAiQuota } from "@/lib/server/plan";
import { rateLimit } from "@/lib/server/rate-limit";

const body = z.object({
  taskId: z.string().min(1).max(60),
  question: z.string().trim().min(2).max(800),
  paras: z
    .array(z.object({ text: z.string().max(1500), align: z.enum(["left", "center", "right", "justify"]), indent: z.boolean(), bold: z.boolean() }))
    .max(60),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(2600) })).max(8).default([]),
});
const json = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, { status, headers });

/** Ariza ustaxonasidagi AI yordamchi (Word'dagi Copilot kabi): savol + hujjat -> maslahat va qo'yiladigan qisqa matn. */
export async function POST(req: Request) {
  if (aiDisabledByUser(req)) return json({ error: NO_AI_ERROR }, 503);
  if (!isAiConfigured()) return json({ error: "AI hali ulanmagan" }, 503);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Savolni yozing" }, 400);
  const { taskId, question, paras, history } = parsed.data;
  const task = getArizaTask(taskId);
  if (!task) return json({ error: "Mashq topilmadi" }, 404);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`assist:${ip}`, 20, 60_000);
  if (!rl.ok) return json({ error: "Juda tez-tez so'rayapsiz, bir daqiqa kuting" }, 429, { "Retry-After": String(rl.retryAfterSec) });
  const quota = await checkAiQuota(ip);
  if (quota) return json({ error: quota.error }, quota.status, quota.retryAfterSec ? { "Retry-After": String(quota.retryAfterSec) } : undefined);

  try {
    return json(await assistAriza(task, paras, question, history));
  } catch (e) {
    if (e instanceof ChatError) return json({ error: e.message }, e.status);
    return json({ error: "Kutilmagan xato" }, 500);
  }
}
