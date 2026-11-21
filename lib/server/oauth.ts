import "server-only";
import { cookies } from "next/headers";
import { col, getDb } from "./db";
import { startSession } from "./session";

export const CONSENT_COOKIE = "lexsim_consent";

export const appUrl = (req: Request) => (process.env.APP_URL || new URL(req.url).origin).replace(/\/$/, "");

export const telegramBot = () =>
  process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_USERNAME ? process.env.TELEGRAM_BOT_USERNAME : null;

/** Foydalanuvchi "Shartlar va maxfiylikka roziman" belgisini qo'ygan (kirish sahifasi cookie qo'yadi). */
export async function hasConsent(): Promise<boolean> {
  return (await cookies()).get(CONSENT_COOKIE)?.value === "1";
}

/**
 * Telegram hisobini topadi yoki yaratadi va sessiya boshlaydi.
 * Yangi hisob faqat rozilik bergan bo'lsa yaratiladi. Qaytaradi: true = kirildi.
 */
export async function signInWithProvider(p: {
  provider: "telegram";
  providerId: string;
  fullName: string | null;
}): Promise<{ ok: true } | { ok: false; reason: "consent" }> {
  const db = await getDb();
  const login = `tg:${p.providerId}`;
  const user = await col.users(db).findOne({ login });
  if (!user) {
    if (!(await hasConsent())) return { ok: false, reason: "consent" };
    const res = await col.users(db).insertOne({
      login,
      fullName: p.fullName?.trim().slice(0, 100) || null,
      role: "individual",
      passwordHash: "", // parol bilan kirib bo'lmaydi
      interests: [],
      mustChangePassword: false,
      provider: p.provider,
      consentAt: new Date(),
      createdAt: new Date(),
    } as never);
    await startSession(res.insertedId.toHexString());
    return { ok: true };
  }
  await startSession(user._id.toHexString());
  return { ok: true };
}
