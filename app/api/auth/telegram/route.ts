import { NextResponse } from "next/server";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { appUrl, signInWithProvider, telegramBot } from "@/lib/server/oauth";

/**
 * Telegram Login Widget qaytishi. Imzo: HMAC-SHA256(data_check_string, SHA256(bot_token)).
 * Hujjat: core.telegram.org/widgets/login#checking-authorization
 */
export async function GET(req: Request) {
  const base = appUrl(req);
  const fail = (code: string) => NextResponse.redirect(`${base}/kirish?error=${code}`);
  if (!telegramBot()) return fail("telegram-off");

  const params = new URL(req.url).searchParams;
  const hash = params.get("hash") ?? "";
  const data = [...params.entries()]
    .filter(([k]) => k !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secret = createHash("sha256").update(process.env.TELEGRAM_BOT_TOKEN as string).digest();
  const expected = createHmac("sha256", secret).update(data).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return fail("telegram");

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate) || Date.now() / 1000 - authDate > 86400) return fail("telegram");
  const id = params.get("id");
  if (!id || !/^\d+$/.test(id)) return fail("telegram");

  const name = [params.get("first_name"), params.get("last_name")].filter(Boolean).join(" ") || params.get("username");
  const r = await signInWithProvider({ provider: "telegram", providerId: id, fullName: name });
  if (!r.ok) return fail("consent");
  return NextResponse.redirect(`${base}/`);
}
