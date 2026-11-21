/**
 * O'zbek lotin yozuvidan boshqa yozuvlarga o'tkazish (tarjima emas, faqat alifbo).
 * - Kirill: hozirgi o'zbek kirill alifbosi (o' -> ў, g' -> ғ, sh -> ш, ch -> ч, ng -> нг, h -> ҳ, q -> қ, tutuq -> ъ).
 * - Yangi alifbo: o' -> ö, g' -> ğ, sh -> ş, ch -> ç (mentor taqdimoti yozuviga mos), tutuq belgisi ʼ.
 * URL, email va brend nomlari o'zgarmaydi.
 */

const APOS = "'ʻʼ’‘`´";
const isApos = (c: string) => c !== "" && APOS.includes(c);
const isLatin = (c: string) => /[A-Za-z]/.test(c);
const isLetter = (c: string) => /[A-Za-zЀ-ӿ]/.test(c);

// O'zgartirilmaydigan bo'laklar
const PROTECT = /(https?:\/\/\S+|\b[\w.+-]+@[\w-]+\.[\w.-]+\b|\b[\w-]+\.(?:uz|com|org|ru|gov)\b|\b(?:LexPraktika|LexHackathon|Telegram|Google|Android|iOS|PDF|APK|XP|AI|OTM|ID)\b|\bPro\b)/g;

function mapSegment(s: string, convert: (s: string) => string): string {
  let out = "";
  let last = 0;
  for (const m of s.matchAll(PROTECT)) {
    out += convert(s.slice(last, m.index));
    out += m[0];
    last = (m.index ?? 0) + m[0].length;
  }
  return out + convert(s.slice(last));
}

/** Katta/kichik harfni saqlab, qiymatni qo'yadi. `pair`: ikki harfli birikma (SH, Sh, sh). */
function caseLike(src: string, lower: string, upper: string, title = upper): string {
  if (src === src.toLowerCase()) return lower;
  if (src.length === 1) return upper;
  return src === src.toUpperCase() ? upper : title;
}

const SINGLE: Record<string, [string, string]> = {
  a: ["а", "А"], b: ["б", "Б"], d: ["д", "Д"], f: ["ф", "Ф"], g: ["г", "Г"], h: ["ҳ", "Ҳ"], i: ["и", "И"],
  j: ["ж", "Ж"], k: ["к", "К"], l: ["л", "Л"], m: ["м", "М"], n: ["н", "Н"], o: ["о", "О"], p: ["п", "П"],
  q: ["қ", "Қ"], r: ["р", "Р"], s: ["с", "С"], t: ["т", "Т"], u: ["у", "У"], v: ["в", "В"], x: ["х", "Х"],
  z: ["з", "З"], c: ["ц", "Ц"], w: ["в", "В"],
};

function cyrlRaw(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const l = c.toLowerCase();
    const n = s[i + 1] ?? "";
    const nl = n.toLowerCase();
    const initial = i === 0 || !isLetter(s[i - 1]);
    const pair = c + n;

    if (!isLatin(c) && !isApos(c)) { out += c; continue; }

    // tutuq belgisi
    if (isApos(c)) { out += "ъ"; continue; }

    // o' g'
    if ((l === "o" || l === "g") && isApos(n)) {
      out += l === "o" ? caseLike(c, "ў", "Ў") : caseLike(c, "ғ", "Ғ");
      i += 1;
      continue;
    }
    // sh ch ng
    if (l === "s" && nl === "h") { out += caseLike(pair, "ш", "Ш", "Ш"); i += 1; continue; }
    if (l === "c" && nl === "h") { out += caseLike(pair, "ч", "Ч", "Ч"); i += 1; continue; }
    if (l === "n" && nl === "g") { out += caseLike(pair, "нг", "НГ", "Нг"); i += 1; continue; }
    // ya yo yu ye
    if (l === "y" && "aou".includes(nl) && nl !== "") {
      const map: Record<string, [string, string, string]> = { a: ["я", "Я", "Я"], o: ["ё", "Ё", "Ё"], u: ["ю", "Ю", "Ю"] };
      const [lo, up, ti] = map[nl];
      out += caseLike(pair, lo, up, ti);
      i += 1;
      continue;
    }
    if (l === "y" && nl === "e") {
      out += initial ? caseLike(pair, "е", "Е", "Е") : caseLike(pair, "йе", "ЙЕ", "Йе");
      i += 1;
      continue;
    }
    if (l === "y") { out += caseLike(c, "й", "Й"); continue; }
    if (l === "e") { out += initial ? caseLike(c, "э", "Э") : caseLike(c, "е", "Е"); continue; }
    const m = SINGLE[l];
    out += m ? (c === l ? m[0] : m[1]) : c;
  }
  return out;
}

const NEW_PAIRS: [RegExp, (m: string) => string][] = [
  [/([oO])['ʻʼ’‘`´]/g, (m) => (m[0] === "o" ? "ö" : "Ö")],
  [/([gG])['ʻʼ’‘`´]/g, (m) => (m[0] === "g" ? "ğ" : "Ğ")],
  [/sh/g, () => "ş"], [/Sh/g, () => "Ş"], [/SH/g, () => "Ş"], [/sH/g, () => "ş"],
  [/ch/g, () => "ç"], [/Ch/g, () => "Ç"], [/CH/g, () => "Ç"], [/cH/g, () => "ç"],
];

function newRaw(s: string): string {
  let out = s;
  for (const [re, f] of NEW_PAIRS) out = out.replace(re, f);
  // qolgan tutuq belgilari (ta'lim -> taʼlim)
  return out.replace(/(?<=[A-Za-zÖöĞğŞşÇç])['ʻ’‘`´](?=[A-Za-zÖöĞğŞşÇç])/g, "ʼ");
}

export const uzToCyrl = (text: string) => mapSegment(text, cyrlRaw);
export const uzToNew = (text: string) => mapSegment(text, newRaw);
