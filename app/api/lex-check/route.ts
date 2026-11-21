import { z } from "zod";
import { fetchArticle, isLexTarget, quoteStillThere } from "@/lib/server/lex-live";
import { rateLimit } from "@/lib/server/rate-limit";

const body = z.object({
  url: z.string().max(100),
  anchor: z.string().max(20),
  quote: z.string().max(400).default(""),
});

const json = (data: unknown, status = 200) => Response.json(data, { status });

/** Lex.uz dagi moddaning hozirgi matnini olib, saqlangan iqtibos bilan solishtiradi. AI kerak emas. */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isLexTarget(parsed.data.url, parsed.data.anchor)) return json({ error: "Noto'g'ri manba" }, 400);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(`lex:${ip}`, 20, 60_000);
  if (!limit.ok) return json({ error: "Juda ko'p so'rov, birozdan keyin urinib ko'ring" }, 429);

  try {
    const live = await fetchArticle(parsed.data.url, parsed.data.anchor);
    if (!live) return json({ status: "notfound" });
    return json({
      status: quoteStillThere(live.text + "\n" + live.heading, parsed.data.quote) ? "same" : "changed",
      live,
    });
  } catch {
    return json({ error: "Lex.uz bilan aloqa o'rnatib bo'lmadi" }, 502);
  }
}
