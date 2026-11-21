import { aiDisabledByUser } from "@/lib/server/ai-guard";
import { z } from "zod";
import { ChatError, isAiConfigured } from "@/lib/server/ai";
import { askLex, expandQuery } from "@/lib/server/lex-ask";
import { indexDate, itemsByAnchor, searchArticles } from "@/lib/server/lex-search";
import { checkAiQuota } from "@/lib/server/plan";
import { rateLimit } from "@/lib/server/rate-limit";




const body = z.object({
  question: z.string().trim().min(3).max(800),
  prior: z.array(z.object({ u: z.string().max(100), id: z.string().max(20) })).max(8).default([]),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(1200), kind: z.enum(["ask", "answer"]).optional() })).max(8).default([]),
});
const json = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, { status, headers });

/**
 * Huquqiy yordamchi: savol -> Lex.uz moddalari indeksidan qidiruv -> AI shu moddalar ichidan mosini tanlab tushuntiradi.
 * AI sozlanmagan yoki limit tugagan bo'lsa ham qidiruv natijalari qaytadi.
 */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Savolni kamida 3 belgi bilan yozing" }, 400);
  const { question, history, prior } = parsed.data;
  // Davom savolida ("va muddati qancha?") qidiruv oldingi savollarni ham hisobga oladi
  const context = history.filter((t) => t.role === "user").slice(-4).map((t) => t.text).join(" ");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`ask:${ip}`, 30, 60_000);
  if (!rl.ok) return json({ error: "Juda ko'p so'rov, birozdan keyin urinib ko'ring" }, 429);

  const noAi = aiDisabledByUser(req);
  const aiOn = isAiConfigured() && !noAi;
  const quota = aiOn ? await checkAiQuota(ip) : null;
  // AI ulangan bo'lsa, savol avval qonun tiliga o'giriladi ("oylik" -> "ish haqi"), keyin qidiriladi
  const keywords = aiOn && !quota ? await expandQuery(`${context} ${question}`.trim()) : [];
  const found = searchArticles((context ? [context, context, question, ...keywords, ...keywords] : [question, question, ...keywords, ...keywords]).join(" "), 8);
  // Davom savolda (aniqlashtirishdan keyin) avvalgi javobdagi nomzod moddalar saqlanadi, yangi qidiruv ularni to'ldiradi
  const before = prior.length > 0 ? itemsByAnchor(prior) : [];
  const seen = new Set(before.map((h) => `${h.u}#${h.id}`));
  const hits = [...before, ...found.filter((h) => !seen.has(`${h.u}#${h.id}`))].slice(0, 8);
  const candidates = hits.map((h, ref) => ({
    ref,
    act: h.a,
    article: h.n,
    heading: h.h,
    url: h.u,
    anchor: h.id,
    snippet: h.t.slice(0, 900),
  }));
  const base = { candidates, indexedAt: indexDate() };
  if (hits.length === 0) return json({ ...base, ai: null, aiError: null });
  if (!aiOn) return json({ ...base, ai: null, aiError: noAi ? "Maxfiy rejim: savolingiz tashqi AI xizmatiga yuborilmadi. Faqat qidiruv natijalari ko'rsatilmoqda." : "AI hali ulanmagan: faqat qidiruv natijalari ko'rsatilmoqda" });

  if (quota) return json({ ...base, ai: null, aiError: quota.error });

  try {
    return json({ ...base, ai: await askLex(question, hits, history), aiError: null });
  } catch (e) {
    return json({ ...base, ai: null, aiError: e instanceof ChatError ? e.message : "AI javob bermadi" });
  }
}
