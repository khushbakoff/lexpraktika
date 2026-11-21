import tasksJson from "@/content/ariza/tasks.json";

export type ArizaSource = { act: string; article: string; url: string; quote: string; heading: string; text: string; anchor: string };
export type Align = "left" | "center" | "right" | "justify";
/** Hujjat abzatsi: matn va Word'dagidek shakllash (tekislash, chekinish, qalin). `hint`: karkas rejimida bo'sh abzatsdagi ko'rsatma (serverga yuborilmaydi). */
export type Para = { text: string; align: Align; indent: boolean; bold: boolean; italic?: boolean; underline?: boolean; hint?: string };
export type Part = "kimga" | "kimdan" | "sarlavha" | "matn" | "asos" | "ilova" | "sana" | "imzo";
export type ArizaTask = {
  id: string;
  level: number;
  title: string;
  minutes: number;
  intro: string;
  given: string[];
  /** Talaba yozishi kerak bo'lgan qismlar (joyini o'zi topadi) */
  requires: Part[];
  ai: boolean;
  minChars: number;
  passAt: number;
  expect: { organ: string[]; name: string[]; address: string[]; phone: boolean; date: string[] };
  example: Para[];
  /** "template": namuna [qavs] ichida bo'sh joylari bor tuzilma (to'liq namuna yurist yozmaguncha). */
  exampleKind?: "full" | "template";
  /** Karkas: varaq shu ko'rsatmali bo'sh abzatslar bilan ochiladi (yordamli bosqich). */
  scaffold?: string[] | null;
  /** To'liq ariza: "Yuborish" tugmasi shu organga yuboradi va javob xati keladi (o'quv simulyatsiyasi). */
  organ?: string;
  lesson: { title: string; points: { part: string; what: string; where: string; how: string; example: string }[] } | null;
  rubric: { id: string; label: string; weight: number; sources: ArizaSource[] }[];
};
export const ARIZA_TASKS = tasksJson as unknown as ArizaTask[];
export const getArizaTask = (id: string) => ARIZA_TASKS.find((t) => t.id === id);
export const LEVEL_TITLE: Record<number, string> = {
  1: "1-daraja: hujjat qismlari",
  2: "2-daraja: to'liq ariza, yordam bilan",
  3: "3-daraja: vaziyatdan ariza",
  4: "4-daraja: mustaqil ariza",
};
export const PART_LABEL: Record<Part, string> = {
  kimga: "Kimga (organ)",
  kimdan: "Kimdan (murojaatchi)",
  sarlavha: "Sarlavha",
  matn: "Matn va talab",
  asos: "Qonuniy asos",
  ilova: "Ilovalar",
  sana: "Sana",
  imzo: "Imzo",
};

/** Mashqda birinchi marta uchraydigan qismlar ("yangi" belgisi uchun). */
export function newParts(task: ArizaTask): Part[] {
  const idx = ARIZA_TASKS.findIndex((t) => t.id === task.id);
  const seen = new Set(ARIZA_TASKS.slice(0, Math.max(0, idx)).flatMap((t) => t.requires));
  return task.requires.filter((p) => !seen.has(p));
}

export type LayoutCheck = { id: string; part: Part; para?: number; ok: boolean; title: string; detail: string };

const norm = (s: string) => s.toLowerCase().replace(/[‘’ʻʼ`´]/g, "'").replace(/\s+/g, " ").trim();
const ORGAN = /(sud|hokim|komissiya|inspeksiya|vazirlik|prokuratura|direktor|rahbar|boshliq|markaz|byuro|agentlik|qo'mita|palata|mchj|idora|notarius|sotuvchi|ijarachi|do'kon|rektor|dekan|mudir|organ|boshqarma|ma'muriyat|kengash|bank|rais|korxona|universitet|institut|maktab)/;
const STREET = /(ko'?cha|ko'?chasi|mavze|massiv|\d+-uy|xonadon|kvartira)/;
const PHONE = /(\+?998[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}|\b\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b|\[telefon\])/i;
const DATE = /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}-yil|\d{1,2}-(yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentabr|oktabr|noyabr|dekabr)|\d{4}\s*y\.)/;
const REQUEST = /(so'rayman|iltimos|talab qilaman|undirishni|qaytarishni|bekor qilishni|berishingizni|ko'rib chiqishingizni|so'raymiz|ta'mirlashni)/;
const LAW = /(\d+-modda|\d+-moddasi|moddasiga|moddasi|kodeksi|qonun)/;
const TITLE = /^((da'vo|qarshi da'vo|apellyatsiya|kassatsiya|xususiy)\s+)?(ariza(si)?|talabnoma(si)?|shikoyat(i)?|iltimosnoma(si)?|pretenziya)$/;
/** "Ishga tiklash to'g'risida ariza", "ARIZA (ish haqi haqida)" kabi uzunroq sarlavhalar. */
const TITLE_LONG = /((to'g'risida|haqida|yuzasidan)\s+(ariza|talabnoma|shikoyat|iltimosnoma)|^(ariza|talabnoma|shikoyat|iltimosnoma)\s*\(.+\))$/;
/** Shapkadagi murojaatchi: "...dan", "yashovchi ...", "Da'vogar: ...". */
const PERSON = /((dan|tomonidan|yashovchi)\b|^(da'vogar|ariza beruvchi|murojaatchi)\b)/;

const rightSide = (p: Para) => p.align === "right" || p.indent;
const has = (s: string, words: string[]) => words.every((w) => s.includes(w));

type Item = { i: number; t: string; n: string; p: Para };

/**
 * Hujjatni abzatslar bo'yicha tekshiradi: har qism yozilganmi va to'g'ri joydami (tepada/pastda),
 * to'g'ri shakllanganmi (o'ngga tekislash, markazda sarlavha, ...). Talaba joyni o'zi tanlaydi.
 */
export function checkLayout(task: ArizaTask, paras: Para[]): LayoutCheck[] {
  const items: Item[] = paras.map((p, i) => ({ i, t: p.text.trim(), n: norm(p.text), p })).filter((x) => x.t);
  const out: LayoutCheck[] = [];
  const need = (k: Part) => task.requires.includes(k);
  const e = task.expect;
  const add = (id: string, part: Part, ok: boolean, title: string, good: string, bad: string, para?: number) => out.push({ id, part, para, ok, title, detail: ok ? good : bad });
  const where = (x?: Item) => (x ? `${x.i + 1}-abzats` : "");

  const title = items.find((x) => {
    const s = x.n.replace(/[:.]/g, "").trim();
    return TITLE.test(s) || (s.length <= 70 && TITLE_LONG.test(s));
  });
  // Shapka = sarlavhadan oldingi abzatslar. Sarlavha bo'lsa organ va murojaatchi faqat shu yerdan qidiriladi:
  // aks holda asosiy matndagi "sotuvchi", "MChJ", "1-martdan" kabi so'zlar shapka deb olinib, to'g'ri hujjatga soxta xato chiqadi.
  const head = title ? items.filter((x) => x.i < title.i) : items;
  const letters = (x: Item) => x.n.replace(/[^a-z']/g, "");
  const isPerson = (x: Item) => (e.name.length ? has(x.n, e.name) : PERSON.test(x.n));
  // Organ: shapkadagi birinchi "kimga?" qatori (organ so'zi yoki 'ga' kelishigi), murojaatchi qatori emas.
  const organ = head.find((x) => !/dan$/.test(letters(x)) && !/^(da'vogar|javobgar)\b/.test(x.n) && (ORGAN.test(x.n) || /(ga|ka|qa)$/.test(letters(x))));
  const person = head.find((x) => x !== organ && isPerson(x));
  const addr = head.find((x) => STREET.test(x.n) && x !== organ) ?? items.find((x) => STREET.test(x.n) && x !== organ) ?? items.find((x) => STREET.test(x.n));
  const phoneItem = items.find((x) => PHONE.test(x.t) || x.t.includes("[TELEFON]"));
  const ilova = items.find((x) => /^ilova/.test(x.n));
  const short = (x: Item) => x.t.length <= 80 && !REQUEST.test(x.n);
  const lastIdx = items.length ? items[items.length - 1].i : -1;
  const tail = items.filter((x) => x.i >= lastIdx - 3 && short(x));
  const dateItem = [...tail].reverse().find((x) => DATE.test(x.n)) ?? items.find((x) => short(x) && DATE.test(x.n));
  const signItem = [...tail].reverse().find((x) => (/(_{3,}|\.{4,}|imzo)/.test(x.n) || /[a-z]\.\s?[a-z]\.\s?[a-z']+/i.test(x.t) || (e.name.length > 0 && e.name.some((w) => x.n.includes(w)))) && x !== dateItem) ?? (dateItem && DATE.test(dateItem.n) && /(_{3,}|imzo)/.test(dateItem.n) ? dateItem : undefined);
  const bodyItems = items.filter((x) => x !== organ && x !== person && x !== addr && x !== phoneItem && x !== title && x !== ilova && x !== dateItem && x !== signItem);
  const body = bodyItems.filter((x) => REQUEST.test(x.n) || x.t.length > 60);

  if (need("kimga")) {
    add("kimga-bor", "kimga", Boolean(organ) && (e.organ.length === 0 || e.organ.some((w) => organ!.n.includes(w))), "Ariza kimga yozilgani", `Organ ${where(organ)}da ko'rsatilgan.`,
      organ ? "Organ nomi vaziyatdagi organga mos emas. Vaziyat shartini qayta o'qing." : "Ariza qaysi organ yoki mansabdor shaxsga yozilayotgani ko'rsatilmagan.", organ?.i);
    if (organ) {
      const group = items.filter((x) => x.i >= organ.i && (!person || x.i < person.i) && (!title || x.i < title.i));
      add("kimga-kelishik", "kimga", group.some((x) => /(ga|ka|qa)$/.test(x.n.replace(/[^a-z']/g, ""))), "'ga' kelishigi", "Organ nomi 'ga' kelishigida.", "'Kimga?' savoliga javob: organ nomi 'ga' bilan tugaydi (hokimiga, direktoriga).", organ.i);
      add("kimga-joy", "kimga", rightSide(organ.p) && (!title || organ.i < title.i), "Shapka sahifaning yuqori o'ng qismida", "Shapka yuqorida va o'ng tomonda.",
        !rightSide(organ.p) ? `Shapka ${organ.p.align === "center" ? "markazda" : "chap tomonda"} turibdi. Rasmiy arizada u yuqori o'ng burchakda: o'ngga tekislang yoki chekinish bering.` : "Shapka sarlavhadan keyin turibdi, u eng yuqorida bo'lishi kerak.", organ.i);
    }
  }
  if (need("kimdan")) {
    add("kimdan-bor", "kimdan", Boolean(person), "Murojaatchi F.I.Sh. 'dan' kelishigida", `Murojaatchi ${where(person)}da ko'rsatilgan.`, "Murojaatchi (F.I.Sh.) ko'rsatilmagan yoki 'dan' kelishigida emas (Karimov Azizdan).", person?.i);
    if (person) {
      add("kimdan-joy", "kimdan", rightSide(person.p) && (!organ || person.i > organ.i) && (!title || person.i < title.i), "Murojaatchi organdan keyin, o'ng tomonda", "Murojaatchi o'z joyida.",
        !rightSide(person.p) ? "Murojaatchi ma'lumoti ham shapka bilan birga o'ng tomonda bo'ladi." : organ && person.i < organ.i ? "Avval kimga (organ), keyin kimdan yoziladi." : "Murojaatchi sarlavhadan oldin turishi kerak.", person.i);
    }
    if (e.address.length || e.phone) {
      const addrOk = Boolean(addr) && (e.address.length === 0 || has(norm(items.map((x) => x.t).join(" ")), e.address));
      add("manzil-bor", "kimdan", addrOk, "Manzil to'liq", "Manzil yozilgan.", addr ? "Manzil to'liq emas: ko'cha, uy va xonadon raqamini vaziyatdagidek yozing." : "Murojaatchi manzili yo'q. Uni shapkada, ism yonida yozing.", addr?.i);
      if (addr && title) add("manzil-joy", "kimdan", addr.i < title.i && rightSide(addr.p), "Manzil shapkada", "Manzil shapkada.", addr.i > title.i ? "Manzil matn ichida yozilgan. U shapkada, murojaatchi ma'lumoti bilan birga bo'ladi." : "Manzil ham o'ng tomonda, shapkada bo'ladi.", addr.i);
    }
    if (e.phone) add("tel-bor", "kimdan", Boolean(phoneItem), "Telefon raqami", "Telefon ko'rsatilgan.", "Aloqa uchun telefon raqamini yozing.", phoneItem?.i);
  }
  if (need("sarlavha")) {
    add("sarlavha-bor", "sarlavha", Boolean(title), "Hujjat nomi (ARIZA)", `Sarlavha ${where(title)}da.`, "Hujjat nomi yozilmagan. Rasmiy hujjat nomi alohida abzatsda yoziladi: ARIZA.", title?.i);
    if (title) {
      add("sarlavha-joy", "sarlavha", title.p.align === "center" && (!organ || title.i > organ.i), "Sarlavha markazda, shapkadan keyin", "Sarlavha markazda.", title.p.align !== "center" ? "Sarlavha sahifa o'rtasida (markazda) turadi. Markazga tekislang." : "Sarlavha shapkadan keyin turishi kerak.", title.i);
      const up = title.t === title.t.toUpperCase();
      add("sarlavha-harf", "sarlavha", up, "Katta harflar bilan", "Sarlavha katta harflar bilan.", "Sarlavha katta harflar bilan yoziladi: ARIZA.", title.i);
    }
  }
  if (need("matn")) {
    const req = items.find((x) => REQUEST.test(x.n) && !(x === organ || x === title));
    add("talab-bor", "matn", Boolean(req), "Aniq talab", `Talab ${where(req)}da yozilgan.`, "Aniq talab yo'q. 'so'rayman', 'undirishni so'rayman' kabi ibora bilan nima talab qilinayotganini yozing.", req?.i);
    if (req) {
      add("matn-joy", "matn", (!title || req.i > title.i) && req.p.align !== "center" && req.p.align !== "right", "Matn sarlavhadan keyin, chapdan/ikki tomonga tekis", "Matn o'z joyida.",
        title && req.i < title.i ? "Matn sarlavhadan keyin yoziladi." : "Asosiy matn markazga yoki o'ngga emas, chapdan (yoki ikki tomonga) tekislanadi.", req.i);
    }
    if (organ && body.some((x) => PHONE.test(x.t))) add("matn-aralash", "matn", false, "Shapka ma'lumoti matnga aralashmagan", "", "Telefon matn ichida yozilgan. U shapkada bo'ladi.");
  }
  // Qonuniy asos: alohida mashqda ("asos") yoki to'liq arizada (matn + ilova) tekshiriladi.
  if (need("asos") || (need("matn") && need("ilova"))) {
    const lawItem = items.find((x) => LAW.test(x.n) && x !== title);
    add("asos-bor", "asos", Boolean(lawItem), "Qonuniy asos", "Qonun yoki modda ko'rsatilgan.", "Qonun nomi va modda raqami yo'q. Talabingiz qaysi moddaga asoslanishini yozing: '... kodeksining ...-moddasiga asosan'.", lawItem?.i);
  }
  if (need("ilova")) {
    // Sana tepada (sarlavhadan oldin) yozilgan bo'lsa, bu sana-joy xatosi; ilovaning joyi oxirgi sanaga nisbatan baholanmaydi.
    const endDate = dateItem && (!title || dateItem.i > title.i) ? dateItem : undefined;
    const after = endDate ? Boolean(ilova) && ilova!.i < endDate.i : Boolean(ilova);
    add("ilova-bor", "ilova", Boolean(ilova) && Boolean(after), "Ilovalar matndan keyin, sanadan oldin", `Ilovalar ${where(ilova)}da.`, ilova ? "Ilovalar sana va imzodan oldin turishi kerak." : "'Ilova:' deb boshlab, qo'shiladigan hujjatlarni sanang.", ilova?.i);
  }
  if (need("sana")) {
    const afterBody = dateItem && (!title || dateItem.i > title.i);
    add("sana-bor", "sana", Boolean(dateItem) && (e.date.length === 0 || has(dateItem!.n, e.date)), "Sana", `Sana ${where(dateItem)}da.`, dateItem ? "Sana to'liq emas (yil, oy, kun). Masalan: 2026-yil 20-noyabr." : "Arizani yozgan sana ko'rsatilmagan.", dateItem?.i);
    if (dateItem) {
      add("sana-joy", "sana", Boolean(afterBody) && (!ilova || dateItem.i > ilova.i) && !rightSide(dateItem.p) || (Boolean(afterBody) && Boolean(signItem) && signItem === dateItem), "Sana arizaning pastida, chapda", "Sana pastda, chap tomonda.",
        !afterBody ? "Sana tepada yozilgan. Sana matndan keyin, arizaning pastida turadi." : rightSide(dateItem.p) ? "Sana chap tomonda, imzo esa o'ng tomonda turadi." : "Sana ilovalardan keyin turishi kerak.", dateItem.i);
    }
  }
  if (need("imzo")) {
    add("imzo-bor", "imzo", Boolean(signItem) && (e.name.length === 0 || e.name.some((w) => signItem!.n.includes(w))), "Imzo va F.I.Sh.", `Imzo ${where(signItem)}da.`, signItem ? "Imzo joyi (____) va qisqartirilgan F.I.Sh. (A.B.Karimov) kerak." : "Imzo yo'q. Pastda imzo joyi (____) va qisqartirilgan F.I.Sh. yozing.", signItem?.i);
    if (signItem) {
      const sameLine = dateItem === signItem;
      add("imzo-joy", "imzo", (!dateItem || signItem.i >= dateItem.i) && (sameLine || signItem.p.align === "right"), "Imzo pastda, o'ng tomonda", "Imzo pastda, o'ng tomonda.",
        dateItem && signItem.i < dateItem.i ? "Imzo sanadan keyin turadi (oxirgi qatorda)." : "Imzo o'ng tomonda turadi: o'ngga tekislang.", signItem.i);
    }
  }
  return out;
}

export type ArizaResult = {
  taskId: string;
  score: number;
  layout: LayoutCheck[];
  items: { id: string; label: string; met: boolean; comment: string; quote: string }[];
  aiOk: boolean;
  at: number;
  /** Tekshirilgan hujjat imzosi: keyin o'zgargan bo'lsa natija eskirgan hisoblanadi */
  sig?: string;
};

/** AI uchun hujjat matni (abzatslar tartibida). */
export function composeText(paras: Para[]): string {
  return paras.map((p) => p.text.trim()).filter(Boolean).join("\n");
}
export function totalChars(paras: Para[]): number {
  return paras.reduce((n, p) => n + p.text.trim().length, 0);
}

/** Umumiy ball: joylashuv va mazmun teng. AI kerak bo'lmasa yoki ishlamasa faqat joylashuv bo'yicha. */
export function scoreResult(task: ArizaTask, layout: LayoutCheck[], items: { id: string; met: boolean }[] | null): number {
  const lay = layout.length ? layout.filter((c) => c.ok).length / layout.length : 0;
  let score: number;
  if (!items || !task.rubric.length) score = Math.round(lay * 100);
  else {
    const tot = task.rubric.reduce((n, r) => n + r.weight, 0) || 1;
    const got = task.rubric.reduce((n, r) => n + (items.find((i) => i.id === r.id)?.met ? r.weight : 0), 0);
    score = Math.round(((lay + got / tot) / 2) * 100);
  }
  // Haqiqiy hayotdagidek: majburiy qism (kimga, imzo, sana, ilova...) umuman yo'q bo'lsa ariza qabul qilinmaydi.
  // Joy va shakldagi kichik xatolar esa faqat ballni kamaytiradi.
  const missingPart = layout.some((c) => !c.ok && c.id.endsWith("-bor"));
  return missingPart ? Math.min(score, task.passAt - 1) : score;
}
