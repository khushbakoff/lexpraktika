import { telegramBot } from "@/lib/server/oauth";

/** Qaysi kirish usullari sozlanganini bildiradi (kalitlar chiqmaydi). */
export async function GET() {
  return Response.json({ telegram: telegramBot() }, { headers: { "Cache-Control": "no-store" } });
}
