import { z } from "zod";

/** Qonuniy asos: davlat tomonidan chiqarilgan hujjat (odatda Lex.uz). */
export const sourceSchema = z.object({
  /** Hujjat nomi, masalan "Mehnat kodeksi". */
  act: z.string().min(1),
  /** Modda/band, masalan "xx-modda". Yurist to'ldiradi. */
  article: z.string().default(""),
  /** Rasmiy havola (https://lex.uz/...). */
  url: z.string().default(""),
  /** Lex.uz sahifasidagi modda elementining id'si: havola aynan shu moddaga olib boradi. scripts/add-anchors.py yozadi. */
  anchor: z.string().regex(/^-?\d+$/).optional(),
  /** Moddadan qisqa aniq iqtibos (tekshirish uchun). scripts/verify-quotes.py matn bilan solishtiradi. */
  quote: z.string().default(""),
  /** Modda sarlavhasi va kerakli qism matni (iqtibos ⟦ ⟧ bilan). scripts/fill-source-text.py yozadi. */
  heading: z.string().default(""),
  text: z.string().default(""),
});
export type Source = z.infer<typeof sourceSchema>;
const sources = z.array(sourceSchema).default([]);

const baseStep = {
  sources,
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  points: z.number().int().positive(),
};

const hiddenFact = z.object({ id: z.string(), fact: z.string(), revealOn: z.array(z.string()) });

/** Suhbatdosh: mijoz, qarshi tomon vakili, sudya va h.k. Berilmasa vaziyatdagi `client` ishlatiladi. */
const counterpart = z.object({
  persona: z.string(),
  openingLine: z.string(),
  hiddenFacts: z.array(hiddenFact),
});

const clientChatStep = z.object({
  ...baseStep,
  type: z.literal("client-chat"),
  /** Masalan muzokara: bosqichning o'z suhbatdoshi (qarshi tomon). */
  counterpart: counterpart.optional(),
  requiredFactIds: z.array(z.string()).default([]),
  /** Tez savollar: factId bo'lsa shu faktni ochadi, reply esa mijozning javobi. */
  questions: z
    .array(z.object({ id: z.string(), text: z.string(), factId: z.string().nullable(), reply: z.string() }))
    .default([]),
});

/** "Xatoni top": hujjat bandlari, talaba xato bandlarni belgilaydi. AI kerak emas. */
const docReviewStep = z.object({
  ...baseStep,
  type: z.literal("doc-review"),
  docTitle: z.string().default(""),
  clauses: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        flawed: z.boolean(),
        /** Nima uchun xato (yoki nima uchun to'g'ri). */
        why: z.string(),
        /** To'g'ri variant (faqat xato bandlar uchun). */
        fix: z.string().default(""),
        sources,
      }),
    )
    .min(2),
});

/** "Hujjat yozing": talaba erkin matn yozadi, AI mezonlar bo'yicha tekshiradi (mezon va asos JSON'dan). */
const draftStep = z.object({
  ...baseStep,
  type: z.literal("draft"),
  prompt: z.string().default(""),
  minChars: z.number().int().min(20).default(120),
  rubric: z
    .array(z.object({ id: z.string(), label: z.string(), weight: z.number().positive(), sources }))
    .min(1),
});

const documentPickStep = z.object({
  ...baseStep,
  type: z.literal("document-pick"),
  /** Savol matni va tugma yozuvi (hujjat tanlashdan boshqa maqsadda ham ishlatiladi). */
  prompt: z.string().default(""),
  submitLabel: z.string().default(""),
  options: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      required: z.boolean(),
      why: z.string(),
      sources,
    }),
  ),
});

const formStep = z.object({
  ...baseStep,
  type: z.literal("form"),
  fields: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        kind: z.enum(["choice", "number"]),
        options: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
        /** To'g'ri javob (choice: variant id, number: raqam). */
        correct: z.string(),
        why: z.string().default(""),
        sources,
      }),
    )
    .default([]),
  rubric: z.array(z.object({ id: z.string(), label: z.string(), weight: z.number() })).default([]),
});

const authorityPickStep = z.object({
  ...baseStep,
  type: z.literal("authority-pick"),
  /** To'g'ri tartib (avval ichki, keyin tashqi). Yurist belgilaydi. */
  order: z.array(z.object({ id: z.string(), label: z.string(), sources })),
});

const deadlinePickStep = z.object({
  ...baseStep,
  type: z.literal("deadline-pick"),
  options: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
  /** To'g'ri variant id. Yurist tasdiqlamaguncha bo'sh: shunda bosqich ballanmaydi. */
  correct: z.string().default(""),
});

export const stepSchema = z.discriminatedUnion("type", [
  clientChatStep,
  docReviewStep,
  draftStep,
  documentPickStep,
  formStep,
  authorityPickStep,
  deadlinePickStep,
]);

export const scenarioSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    area: z.string().min(1),
    /** Qiziqish toifasi id (lib/tracks.ts AREAS). */
    areaId: z.string().min(1),
    /** Qaysi kasbiy yo'nalishlarga mos (lib/tracks.ts TRACKS). */
    tracks: z.array(z.string()).default([]),
    level: z.number().int().min(1),
    status: z.enum(["sample", "verified"]),
    reviewedBy: z.string().nullable(),
    summary: z.string().default(""),
    client: counterpart,
    steps: z.array(stepSchema).min(1),
  })
  .superRefine((s, ctx) => {
    const total = s.steps.reduce((sum, st) => sum + st.points, 0);
    if (total !== 100) {
      ctx.addIssue({ code: "custom", message: `Ballar yig'indisi 100 bo'lishi kerak, hozir ${total}` });
    }
    const ids = new Set<string>();
    for (const st of s.steps) {
      if (ids.has(st.id)) ctx.addIssue({ code: "custom", message: `Takroriy bosqich id: ${st.id}` });
      ids.add(st.id);
    }
    if (s.status === "verified" && !s.reviewedBy) {
      ctx.addIssue({ code: "custom", message: "verified uchun reviewedBy kerak" });
    }
    if (s.status === "verified") {
      const missing = missingSources(s as Scenario);
      if (missing.length > 0) {
        ctx.addIssue({ code: "custom", message: `verified uchun qonuniy asos yetishmaydi: ${missing.join("; ")}` });
      }
    }
  });

export type Step = z.infer<typeof stepSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;

const hasOfficial = (list: Source[]) => list.some((x) => x.url.startsWith("https://lex.uz/") && x.article.trim() !== "");

/**
 * Qonuniy asosi yo'q (yoki to'liq emas) joylar. Asos = hujjat nomi + modda + lex.uz havolasi.
 * Faqat "huquqiy da'vo" tashiydigan joylar tekshiriladi: hujjat variantlari, organlar tartibi, forma maydonlari, muddat.
 */
export function missingSources(s: Scenario): string[] {
  const out: string[] = [];
  for (const st of s.steps) {
    if (st.type === "document-pick") {
      for (const o of st.options) if (!hasOfficial(o.sources)) out.push(`${st.id}/${o.id}`);
    } else if (st.type === "authority-pick") {
      for (const o of st.order) if (!hasOfficial(o.sources)) out.push(`${st.id}/${o.id}`);
    } else if (st.type === "form") {
      for (const f of st.fields) if (!hasOfficial(f.sources)) out.push(`${st.id}/${f.id}`);
    } else if (st.type === "doc-review") {
      for (const c of st.clauses) if (c.flawed && !hasOfficial(c.sources)) out.push(`${st.id}/${c.id}`);
    } else if (st.type === "draft") {
      for (const r of st.rubric) if (!hasOfficial(r.sources)) out.push(`${st.id}/${r.id}`);
    } else if (st.type === "deadline-pick") {
      if (!hasOfficial(st.sources)) out.push(`${st.id}`);
    }
  }
  return out;
}
