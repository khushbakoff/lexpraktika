import "server-only";
import { isPlanId, type PlanId } from "@/lib/user/plans";
import { PLANS } from "@/lib/user/plans";
import { getSession } from "./guard";
import { rateLimit } from "./rate-limit";

/**
 * Joriy foydalanuvchi tarifi: hisobdagi `plan`, bo'lmasa `DEFAULT_PLAN` (demo uchun "pro"), bo'lmasa "free".
 * `key` limitlar uchun: kirgan foydalanuvchi id'si, aks holda null (chaqiruvchi IP ishlatadi).
 */
export async function resolvePlan(): Promise<{ plan: PlanId; userKey: string | null }> {
  const fallback: PlanId = isPlanId(process.env.DEFAULT_PLAN) ? process.env.DEFAULT_PLAN : "free";
  try {
    const s = await getSession();
    if (s.kind === "authed") {
      const own = (s.user as { plan?: unknown }).plan;
      return { plan: isPlanId(own) ? own : fallback, userKey: String(s.user._id) };
    }
  } catch {
    // baza yo'q yoki xato: demo tarifiga qaytadi
  }
  return { plan: fallback, userKey: null };
}

/**
 * AI chaqiruvlari uchun umumiy limit: IP bo'yicha 10 daqiqada 30 ta, bepul tarifda qo'shimcha kuniga N ta.
 * Xato bo'lsa {status, error, retryAfterSec?} qaytaradi, ruxsat bo'lsa null.
 */
export async function checkAiQuota(ip: string): Promise<null | { status: number; error: string; retryAfterSec?: number }> {
  const burst = rateLimit(`ai:${ip}`, 30, 10 * 60_000);
  if (!burst.ok) {
    return { status: 429, error: "Juda ko'p so'rov. Birozdan keyin urinib ko'ring.", retryAfterSec: burst.retryAfterSec };
  }
  const { plan, userKey } = await resolvePlan();
  const daily = PLANS[plan].aiDailyLimit;
  if (daily !== null) {
    const d = rateLimit(`ai-day:${userKey ?? ip}`, daily, 24 * 60 * 60_000);
    if (!d.ok) return { status: 429, error: `Bepul tarifda kuniga ${daily} ta AI so'rov. Cheksiz foydalanish uchun Pro tarifga o'ting.` };
  }
  return null;
}
