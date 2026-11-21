/** Tariflar. Narx va limitlar faraz (so'rovnomada tekshiriladi), yurist/biznes qarori bilan o'zgaradi. */
export type PlanId = "free" | "pro";

export type Plan = {
  id: PlanId;
  title: string;
  price: string;
  note: string;
  features: string[];
  /** Kuniga AI mijozga yuboriladigan xabarlar soni (null = cheklanmagan). */
  aiDailyLimit: number | null;
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    title: "Bepul",
    price: "0 so'm",
    note: "Sinab ko'rish uchun",
    features: [
      "Barcha vaziyatlarning bosqichlari (tez savollar bilan)",
      "AI mijoz: kuniga 5 ta xabar",
      "Ball, XP va daraja",
    ],
    aiDailyLimit: 5,
  },
  pro: {
    id: "pro",
    title: "Pro",
    price: "249 000 so'm",
    note: "Bir martalik, kurs uchun",
    features: [
      "AI mijoz bilan cheksiz erkin suhbat",
      "Ariza AI bahosi (tez orada)",
      "Kurs sertifikati va batafsil ko'nikma profili",
      "Ish beruvchilarga ochiq profil",
    ],
    aiDailyLimit: null,
  },
};

export const isPlanId = (v: unknown): v is PlanId => v === "free" || v === "pro";
