import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export type TelegramUser = { id: string; name: string | null };

/**
 * Telegram Mini App initData imzosini tekshiradi.
 * secret = HMAC_SHA256(kalit "WebAppData", bot_token); imzo = HMAC_SHA256(data_check_string, secret).
 * Hujjat: core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyInitData(initData: string, botToken: string): TelegramUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash") ?? "";
  if (!hash) return null;
  const data = [...params.entries()]
    .filter(([k]) => k !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = createHmac("sha256", secret).update(data).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate) || Date.now() / 1000 - authDate > 86400) return null;

  try {
    const u = JSON.parse(params.get("user") ?? "{}") as { id?: number; first_name?: string; last_name?: string; username?: string; is_bot?: boolean };
    if (typeof u.id !== "number" || u.is_bot) return null;
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || null;
    return { id: String(u.id), name };
  } catch {
    return null;
  }
}
