import { z } from "zod";
import { checkLayout, composeText, getArizaTask, scoreResult, totalChars, type Para } from "@/lib/ariza";
import { ChatError, isAiConfigured } from "@/lib/server/ai";
import { gradeAriza } from "@/lib/server/ariza-grade";
import { checkAiQuota } from "@/lib/server/plan";
import { rateLimit } from "@/lib/server/rate-limit";

const body = z.object({ taskId: z.string().min(1).max(60), paras: z.array(z.object({ text: z.string().max(1500), align: z.enum(["left", "center", "right", "justify"]), indent: z.boolean(), bold: z.boolean() })).min(1).max(60) });
const json = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, { status, headers });

/** Ariza tekshiruvi: tuzilishni qoida bo'yicha (AI'siz), mazmunni AI mezonlar bo'yicha tekshiradi. */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Matn juda qisqa yoki noto'g'ri" }, 400);
  const { taskId } = parsed.data;
  const task = getArizaTask(taskId);
  if (!task) return json({ error: "Mashq topilmadi" }, 404);
  const paras: Para[] = parsed.data.paras;
  if (totalChars(paras) < task.minChars) return json({ error: `Kamida ${task.minChars} belgi yozing` }, 400);
  const text = composeText(paras);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`ariza:${ip}`, 20, 60_000);
  if (!rl.ok) return json({ error: "Juda tez-tez urinyapsiz, bir daqiqa kuting" }, 429, { "Retry-After": String(rl.retryAfterSec) });

  const layout = checkLayout(task, paras);
  let items: Awaited<ReturnType<typeof gradeAriza>> | null = null;
  let aiNote: string | null = null;
  if (!task.ai || task.rubric.length === 0) {
    // Kichik mashq: faqat tuzilish
  } else if (!isAiConfigured()) {
    aiNote = "AI ulanmagan: faqat tuzilish tekshirildi.";
  } else {
    const quota = await checkAiQuota(ip);
    if (quota) aiNote = `${quota.error} Faqat tuzilish tekshirildi.`;
    else {
      try {
        items = await gradeAriza(task, text);
      } catch (e) {
        aiNote = e instanceof ChatError ? `${e.message}. Faqat tuzilish tekshirildi.` : "AI javob bermadi. Faqat tuzilish tekshirildi.";
      }
    }
  }
  return json({ layout, items, aiNote, score: scoreResult(task, layout, items) });
}
