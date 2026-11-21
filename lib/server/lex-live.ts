import "server-only";

/**
 * Lex.uz dan moddaning joriy matnini olish. Faqat https://lex.uz/docs/<id> hujjatlari (SSRF yo'q).
 * Hujjat sahifasi katta (Mehnat kodeksi ~3 MB), shuning uchun xotirada 6 soat saqlanadi.
 */
const DOC_URL = /^https:\/\/lex\.uz\/docs\/-?\d+$/;
const ANCHOR = /^-?\d+$/;
const TTL_MS = 6 * 60 * 60 * 1000;
const MAX_DOCS = 2;
const docs = new Map<string, { html: string; at: number }>();

export type LiveArticle = {
  heading: string;
  text: string;
  /** Tahrir izohlari (qaysi qonun bilan o'zgartirilgani). Lex.uz matnidan olinadi. */
  amendments: string[];
  fetchedAt: string;
};

export const isLexTarget = (url: string, anchor: string) => DOC_URL.test(url) && ANCHOR.test(anchor);

async function loadDoc(url: string): Promise<string> {
  const hit = docs.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.html;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 LexPraktika" }, signal: AbortSignal.timeout(25_000), redirect: "follow" });
  if (!res.ok) throw new Error(`Lex.uz ${res.status}`);
  if (new URL(res.url).hostname !== "lex.uz") throw new Error("Lex.uz boshqa manzilga yo'naltirdi");
  const html = await res.text();
  if (docs.size >= MAX_DOCS) docs.delete(docs.keys().next().value as string);
  docs.set(url, { html, at: Date.now() });
  return html;
}

const HEADING = /<div name="-?\d+" id="-?\d+">\d+(?:<sup>\d<\/sup>|[¹²³])?-(?:модда|modda)\./g;
const AMEND = /(таҳририда|tahririda|Қонунига|Qonuniga|Қонуни|Qonuni|қарорига|qaroriga|ўзгартириш|o[ʻ'’]zgartirish|кучини йўқотган|kuchini yo[ʻ'’]qotgan)/i;
const NOISE = /(^\[(?:ОКОЗ|OKOZ)|Hujjatga taklif yuborish|Audioni tinglash|Hujjat elementidan havola olish|Ҳужжатга таклиф юбориш|Аудиони тинглаш|Ҳужжат элементидан ҳавола олиш|LexUZ sharhi|LexUZ шарҳи|^Oldingi tahrirga qarang|^Олдинги таҳрирга қаранг)/;

function toLines(fragment: string): string[] {
  const t = fragment
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, "")
    .replace(/<\/(div|p|li|tr|h\d)>|<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  return t.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
}

export async function fetchArticle(url: string, anchor: string): Promise<LiveArticle | null> {
  if (!isLexTarget(url, anchor)) return null;
  const html = await loadDoc(url);
  const start = html.indexOf(`<div name="${anchor}" id="${anchor}">`);
  if (start < 0) return null;
  HEADING.lastIndex = start + 20;
  const next = HEADING.exec(html);
  const lines = toLines(html.slice(start, next ? next.index : start + 60_000));
  const amendments = lines.filter((l) => AMEND.test(l) && l.length < 400);
  const body = lines.filter((l) => !NOISE.test(l) && !amendments.includes(l));
  const [heading = "", ...rest] = body;
  return {
    heading,
    text: rest.join("\n").slice(0, 6000),
    amendments: amendments.slice(0, 12),
    fetchedAt: new Date().toISOString(),
  };
}

const norm = (s: string) => s.toLowerCase().replace(/[ʻʼ’‘`´']/g, "'").replace(/\s+/g, " ");
/** Saqlangan iqtibos Lex.uz dagi joriy matnda hanuz bormi. */
export const quoteStillThere = (live: string, quote: string) => !quote || norm(live).includes(norm(quote));
