import { createHmac, timingSafeEqual } from "node:crypto";

/** Webhook sirli tokeni: SESSION_SECRET dan hosil qilinadi (alohida env kerak emas). */
export const webhookSecret = () =>
  createHmac("sha256", process.env.SESSION_SECRET ?? "").update("telegram-webhook").digest("hex").slice(0, 48);

type Update = { message?: { chat?: { id?: number; type?: string }; text?: string } };

/** Bot xabarlariga javob: /start bosilganda Mini App tugmasini yuboradi. */
export async function POST(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const app = process.env.APP_URL;
  const got = Buffer.from(req.headers.get("x-telegram-bot-api-secret-token") ?? "");
  const want = Buffer.from(webhookSecret());
  if (!token || !app || got.length !== want.length || !timingSafeEqual(got, want)) return new Response("forbidden", { status: 403 });

  const update = (await req.json().catch(() => null)) as Update | null;
  const chatId = update?.message?.chat?.id;
  if (typeof chatId !== "number" || update?.message?.chat?.type !== "private") return Response.json({ ok: true });

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify({
      chat_id: chatId,
      text: "LexPraktika: yuridik amaliyot trenajyori.\nReal vaziyatlarni bosqichma-bosqich o'ting va qonun moddalarini Lex.uz dan toping.",
      reply_markup: { inline_keyboard: [[{ text: "Ilovani ochish", web_app: { url: app } }]] },
    }),
  }).catch(() => null);
  return Response.json({ ok: true });
}
