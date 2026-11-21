import { NO_AI_ERROR, aiDisabledByUser } from "@/lib/server/ai-guard";
import { z } from "zod";
import { ChatError, isAiConfigured } from "@/lib/server/ai";
import { explainArticle } from "@/lib/server/lex-explain";
import { fetchArticle, isLexTarget } from "@/lib/server/lex-live";
import { checkAiQuota } from "@/lib/server/plan";

const body = z.object({
  url: z.string().max(100),
  anchor: z.string().max(20),
  act: z.string().max(200),
  situation: z.string().max(200),
});

const json = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, { status, headers });

/** Moddaning matni Lex.uz dan serverda olinadi (mijoz yuborgan matnga ishonilmaydi), keyin AI tushuntiradi. */
export async function POST(req: Request) {
  if (aiDisabledByUser(req)) return Response.json({ error: NO_AI_ERROR }, { status: 503 });
  if (!isAiConfigured()) return json({ error: "AI sozlanmagan" }, 503);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isLexTarget(parsed.data.url, parsed.data.anchor)) return json({ error: "Noto'g'ri manba" }, 400);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const quota = await checkAiQuota(ip);
  if (quota) return json({ error: quota.error }, quota.status, quota.retryAfterSec ? { "Retry-After": String(quota.retryAfterSec) } : undefined);

  try {
    const live = await fetchArticle(parsed.data.url, parsed.data.anchor);
    if (!live) return json({ error: "Lex.uz da modda topilmadi" }, 404);
    return json({ explanation: await explainArticle(live, parsed.data.situation, parsed.data.act), fetchedAt: live.fetchedAt });
  } catch (e) {
    if (e instanceof ChatError) return json({ error: e.message }, e.status);
    return json({ error: "Lex.uz bilan aloqa o'rnatib bo'lmadi" }, 502);
  }
}
