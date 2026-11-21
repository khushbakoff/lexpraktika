import "server-only";
import fs from "node:fs";
import path from "node:path";

export type IndexItem = { u: string; a: string; n: string; id: string; h: string; t: string };
export type Hit = IndexItem & { score: number };

const CYR: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ь: "", ы: "i", э: "e", ю: "yu", я: "ya", ў: "o", қ: "q", ғ: "g", ҳ: "h",
};
/** Kirill va lotin yozuvini bitta ko'rinishga keltiradi (apostroflar olib tashlanadi), shunda lotin savol kirill matndan ham topadi. */
export function normalize(s: string): string {
  let out = "";
  for (const ch of s.toLowerCase()) out += CYR[ch] ?? ch;
  return out.replace(/[ʻʼ’‘`´']/g, "");
}

const CYR_LAT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "'", ь: "", ы: "i", э: "e", ю: "yu", я: "ya", ў: "o'", қ: "q", ғ: "g'", ҳ: "h",
};
/** Javob matnida kirill qolib ketsa, o'zbek lotiniga o'giradi (katta harf saqlanadi). */
export function cyrToLatin(s: string): string {
  if (!/[Ѐ-ӿ]/.test(s)) return s;
  let out = "";
  for (const ch of s) {
    const low = ch.toLowerCase();
    const m = CYR_LAT[low];
    if (m === undefined) out += ch;
    else out += ch !== low ? m.charAt(0).toUpperCase() + m.slice(1) : m;
  }
  return out;
}

const STOP = new Set(["assalomu", "alaykum", "salom", "boshqa", "tafsilot", "holat", "qilsam", "qilish", "qilmoqchi", "bolsa", "qilgandim", "bildim", "aytsam", "mijoz", "mijozim", "mijozimiz", "mijozimga", "tushuntirishmadi", "va", "bilan", "uchun", "lekin", "bor", "men", "mening", "menga", "ham", "bu", "shu", "u", "nima", "qanday", "qachon", "kerak", "mumkin", "boladi", "bolishi", "yoki", "dan", "ga", "ni", "ning", "bir", "edi", "emas", "hamda", "ular", "biz", "siz"]);
const stem = (w: string) => w.slice(0, 4);
function tokens(s: string): string[] {
  return normalize(s)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOP.has(w))
    .map(stem);
}

type Index = { items: IndexItem[]; tf: Map<string, number>[]; len: number[]; df: Map<string, number>; avg: number; builtAt: string };
const g = globalThis as unknown as { _lexIndex?: Index };

function load(): Index {
  if (g._lexIndex) return g._lexIndex;
  const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "lex-index.json"), "utf-8")) as { builtAt: string; items: IndexItem[] };
  const tf: Map<string, number>[] = [];
  const len: number[] = [];
  const df = new Map<string, number>();
  for (const it of raw.items) {
    const m = new Map<string, number>();
    // Sarlavhadagi so'zlar matndagidan muhimroq (3x)
    for (const t of [...tokens(it.h), ...tokens(it.h), ...tokens(it.h), ...tokens(it.t)]) m.set(t, (m.get(t) ?? 0) + 1);
    tf.push(m);
    len.push([...m.values()].reduce((a, b) => a + b, 0));
    for (const t of m.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  }
  g._lexIndex = { items: raw.items, tf, len, df, avg: len.reduce((a, b) => a + b, 0) / Math.max(1, len.length), builtAt: raw.builtAt };
  return g._lexIndex;
}

export const indexDate = () => load().builtAt;

/** BM25 qidiruv: savoldagi so'zlar bo'yicha eng mos moddalar. */
export function searchArticles(question: string, limit = 8): Hit[] {
  const ix = load();
  const q = [...new Set(tokens(question))];
  if (q.length === 0) return [];
  const N = ix.items.length;
  const hits: Hit[] = [];
  for (let i = 0; i < N; i++) {
    let score = 0;
    for (const t of q) {
      const f = ix.tf[i].get(t);
      if (!f) continue;
      const n = ix.df.get(t) ?? 1;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += (idf * f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (ix.len[i] / ix.avg)));
    }
    if (score > 0) hits.push({ ...ix.items[i], score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Oldingi javobdagi nomzod moddalarni (url + element id) indeksdan qayta oladi: davom savolda xuddi shu moddalar ustida ishlash uchun. */
export function itemsByAnchor(pairs: { u: string; id: string }[]): Hit[] {
  const ix = load();
  const want = new Set(pairs.map((p) => `${p.u}#${p.id}`));
  const out: Hit[] = [];
  for (const it of ix.items) if (want.has(`${it.u}#${it.id}`)) out.push({ ...it, score: 1000 });
  // oldingi tartibni saqlaymiz
  const order = new Map(pairs.map((p, i) => [`${p.u}#${p.id}`, i]));
  return out.sort((a, b) => (order.get(`${a.u}#${a.id}`) ?? 0) - (order.get(`${b.u}#${b.id}`) ?? 0));
}
