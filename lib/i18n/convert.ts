import type { Locale } from "./locale";
import { EN, RU, patternTranslate } from "./dict";
import { uzToCyrl, uzToNew } from "./translit";

/** Matn bo'lagini tanlangan til/yozuvga o'tkazadi. Asl matn o'zbek lotin. */
export function convertText(text: string, locale: Locale): string {
  if (locale === "uz" || !text.trim()) return text;
  if (locale === "uz-cyrl") return uzToCyrl(text);
  if (locale === "uz-new") return uzToNew(text);

  // ru/en: bo'shliqlarni saqlab, aniq moslik yoki andoza bo'yicha tarjima. Topilmasa o'zbekcha qoladi.
  const m = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!m) return text;
  const [, pre, core, post] = m;
  const dict = locale === "ru" ? RU : EN;
  let hit: string | null = dict[core] ?? patternTranslate(core, locale);
  // "A, B" ko'rinishidagi ro'yxat: har bir bo'lak lug'atda bo'lsa, hammasi tarjima qilinadi
  if (!hit && core.includes(", ")) {
    const parts = core.split(", ");
    const tr = parts.map((p) => dict[p]);
    if (tr.every(Boolean)) hit = tr.join(", ");
  }
  return hit ? pre + hit + post : text;
}
