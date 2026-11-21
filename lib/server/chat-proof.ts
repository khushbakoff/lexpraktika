import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * AI suhbatda ochilgan faktlar ro'yxati imzolanadi. Talaba brauzerda ro'yxatni
 * o'zgartirib, o'ziga to'liq ball qo'ya olmasligi uchun server natijani yozishda imzoni tekshiradi.
 */
const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET o'rnatilmagan");
  return s;
};

/** kind: "chat" (ochilgan faktlar) yoki "draft" (hujjat mezonlari bajarilgan). Turlar bir-birining imzosini ishlata olmaydi. */
type Kind = "chat" | "draft";

const canon = (kind: Kind, scenarioId: string, stepId: string, facts: string[]) =>
  `${kind}-proof|${scenarioId}|${stepId}|${[...new Set(facts)].sort().join(",")}`;

export function signFacts(scenarioId: string, stepId: string, facts: string[], kind: Kind = "chat"): string {
  return createHmac("sha256", secret()).update(canon(kind, scenarioId, stepId, facts)).digest("base64url");
}

export function verifyFacts(scenarioId: string, stepId: string, facts: string[], proof: string, kind: Kind = "chat"): boolean {
  if (facts.length === 0) return true;
  const a = Buffer.from(signFacts(scenarioId, stepId, facts, kind));
  const b = Buffer.from(proof);
  return a.length === b.length && timingSafeEqual(a, b);
}
