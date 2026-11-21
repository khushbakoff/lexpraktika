import "server-only";

/**
 * Tashqi AI xizmatiga ketadigan matndan shaxsiy ma'lumotni yashiradi (ma'lumotni minimallashtirish).
 * Telefon, email, pasport, JSHSHIR (14 raqam), karta/hisob raqami, Telegram nomi. Ism-familiya va manzilni regex bilan aniqlab bo'lmaydi:
 * buning uchun foydalanuvchiga ogohlantirish ko'rsatiladi va "Maxfiy rejim" (AI o'chirilgan) bor.
 */
const RULES: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[EMAIL]"],
  [/(?<![\w])@[A-Za-z][\w]{3,31}\b/g, "[TELEGRAM]"],
  [/(?<!\d)(?:\d[ -]?){12,19}(?!\d)/g, "[RAQAM]"], // karta, hisob raqami, JSHSHIR (14), STIR
  [/\b[A-Z]{2}\s?\d{7}\b/g, "[PASPORT]"],
  [/(?<!\d)(?:\+?998[\s-]?)\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}(?!\d)/g, "[TELEFON]"],
  [/(?<![\d,.])\(?(?:9[0-9]|7[0-9]|8[0-9]|3[0-9]|5[0-9]|6[0-9])\)?[\s-]\d{3}[\s-]\d{2}[\s-]\d{2}(?!\d)/g, "[TELEFON]"],
];

export function redactPii(text: string): string {
  let out = text;
  for (const [re, label] of RULES) out = out.replace(re, label);
  return out;
}
