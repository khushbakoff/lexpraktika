import { z } from "zod";
import type { Scenario, Source, Step } from "./scenario-schema";

type Of<T extends Step["type"]> = Extract<Step, { type: T }>;

export type FeedbackItem = { label: string; ok: boolean | null; note: string; sources?: Source[] };
export type StepResult = {
  score: number;
  /** Ballanmaydigan bosqichda 0 (masalan, yurist tasdiqlamagan muddat). */
  max: number;
  graded: boolean;
  answer: unknown;
  feedback: FeedbackItem[];
};

const ratio = (num: number, den: number) => (den <= 0 ? 0 : Math.max(0, Math.min(1, num / den)));

/** `asked`: tez savol id'lari. `aiFacts`: AI suhbatda ochilgan fakt id'lari (server imzosi bilan tekshirilgan). */
export function scoreFacts(step: Of<"client-chat">, scenario: Scenario, asked: string[], aiFacts: string[] = []): StepResult {
  const revealed = new Set([
    ...step.questions.filter((q) => asked.includes(q.id) && q.factId).map((q) => q.factId as string),
    ...aiFacts,
  ]);
  const hits = step.requiredFactIds.filter((id) => revealed.has(id)).length;
  const feedback: FeedbackItem[] = step.requiredFactIds.map((id) => {
    const fact = (step.counterpart ?? scenario.client).hiddenFacts.find((f) => f.id === id)?.fact ?? id;
    return revealed.has(id)
      ? { label: fact, ok: true, note: "Aniqladingiz." }
      : { label: fact, ok: false, note: "Buni so'ramadingiz, lekin bu muhim fakt edi." };
  });
  // Ishga aloqasi yo'q savollar (factId yo'q) har biri bitta topilgan faktni kamaytiradi: hammasini bosib 100% olib bo'lmaydi
  const irrelevant = step.questions.filter((q) => asked.includes(q.id) && !q.factId);
  for (const q of irrelevant) {
    feedback.push({ label: q.text, ok: false, note: "Keraksiz savol: bu ish uchun muhim emas, ball kamaydi." });
  }
  return {
    score: Math.round(step.points * ratio(hits - irrelevant.length, step.requiredFactIds.length)),
    max: step.points,
    graded: true,
    answer: aiFacts.length > 0 ? { asked, facts: aiFacts } : asked,
    feedback,
  };
}

/** "Xatoni top": xato bandni topish ball beradi, to'g'ri bandni xato deb belgilash ball kamaytiradi. */
export function scoreDocReview(step: Of<"doc-review">, flagged: string[]): StepResult {
  const flawed = step.clauses.filter((c) => c.flawed);
  const hits = flawed.filter((c) => flagged.includes(c.id)).length;
  const falseAlarms = step.clauses.filter((c) => !c.flawed && flagged.includes(c.id)).length;
  const feedback: FeedbackItem[] = step.clauses.map((c) => {
    const picked = flagged.includes(c.id);
    if (c.flawed) {
      return picked
        ? { label: c.text, ok: true, note: `Xatoni topdingiz. ${c.why}${c.fix ? ` To'g'risi: ${c.fix}` : ""}`, sources: c.sources }
        : { label: c.text, ok: false, note: `Xatoni topmadingiz. ${c.why}${c.fix ? ` To'g'risi: ${c.fix}` : ""}`, sources: c.sources };
    }
    return picked
      ? { label: c.text, ok: false, note: `Bu band to'g'ri edi, xato deb belgiladingiz. ${c.why}`, sources: c.sources }
      : { label: c.text, ok: true, note: `To'g'ri, bu band xato emas. ${c.why}`, sources: c.sources };
  });
  return {
    score: Math.round(step.points * ratio(hits - falseAlarms, flawed.length)),
    max: step.points,
    graded: true,
    answer: flagged,
    feedback,
  };
}

/**
 * "Hujjat yozing": `met` AI tekshirgan va server imzolagan bajarilgan mezonlar. Ball mezon og'irliklaridan hisoblanadi.
 * `notes` AI izohlari (faqat ko'rsatish uchun, ballga ta'sir qilmaydi).
 */
export function scoreDraft(step: Of<"draft">, met: string[], notes: Record<string, string> = {}, proof?: string): StepResult {
  const total = step.rubric.reduce((n, r) => n + r.weight, 0);
  const got = step.rubric.filter((r) => met.includes(r.id)).reduce((n, r) => n + r.weight, 0);
  const feedback: FeedbackItem[] = step.rubric.map((r) => {
    const ok = met.includes(r.id);
    return { label: r.label, ok, note: notes[r.id] || (ok ? "Mezon bajarilgan." : "Mezon bajarilmagan."), sources: r.sources };
  });
  return {
    score: Math.round(step.points * ratio(got, total)),
    max: step.points,
    graded: true,
    answer: { met, notes, ...(proof ? { proof } : {}) },
    feedback,
  };
}

/** AI ishlamaganda: ball berilmaydi, mezonlar o'zini tekshirish ro'yxati sifatida ko'rsatiladi. */
export function scoreDraftSkipped(step: Of<"draft">): StepResult {
  return {
    score: 0,
    max: 0,
    graded: false,
    answer: { skip: true },
    feedback: step.rubric.map((r) => ({
      label: r.label,
      ok: null,
      note: "AI tekshiruvi mavjud bo'lmadi. Matningizni shu mezon bo'yicha o'zingiz tekshiring.",
      sources: r.sources,
    })),
  };
}

export function scoreDocuments(step: Of<"document-pick">, selected: string[]): StepResult {
  const required = step.options.filter((o) => o.required);
  const hits = required.filter((o) => selected.includes(o.id)).length;
  const wrong = step.options.filter((o) => !o.required && selected.includes(o.id)).length;
  const feedback: FeedbackItem[] = step.options.map((o) => {
    const picked = selected.includes(o.id);
    const ok = o.required === picked;
    const note = o.required
      ? picked
        ? `To'g'ri: ${o.why}.`
        : `Tanlamadingiz, lekin kerak edi: ${o.why}.`
      : picked
        ? `Keraksiz hujjat: ${o.why}.`
        : `To'g'ri, tanlamadingiz: ${o.why}.`;
    return { label: o.label, ok, note, sources: o.sources };
  });
  return {
    score: Math.round(step.points * ratio(hits - wrong, required.length)),
    max: step.points,
    graded: true,
    answer: selected,
    feedback,
  };
}

export function scoreAuthority(step: Of<"authority-pick">, ordered: string[]): StepResult {
  const hits = step.order.filter((o, i) => ordered[i] === o.id).length;
  const label = (id: string) => step.order.find((o) => o.id === id)?.label ?? id;
  const feedback: FeedbackItem[] = step.order.map((o, i) => ({
    label: `${i + 1}. ${label(ordered[i] ?? "")}`,
    ok: ordered[i] === o.id,
    note: ordered[i] === o.id ? "To'g'ri o'rin." : `Bu o'rinda "${o.label}" bo'lishi kerak.`,
    sources: o.sources,
  }));
  return {
    score: Math.round(step.points * ratio(hits, step.order.length)),
    max: step.points,
    graded: true,
    answer: ordered,
    feedback,
  };
}

const digits = (v: string) => v.replace(/\D/g, "");

export function scoreForm(step: Of<"form">, values: Record<string, string>): StepResult {
  const feedback: FeedbackItem[] = step.fields.map((f) => {
    const given = values[f.id] ?? "";
    const ok = f.kind === "number" ? digits(given) === digits(f.correct) : given === f.correct;
    const shown =
      f.kind === "choice" ? (f.options.find((o) => o.id === given)?.label ?? "-") : given || "-";
    return { label: `${f.label}: ${shown}`, ok, note: ok ? f.why : `To'g'ri emas. ${f.why}`, sources: f.sources };
  });
  const hits = feedback.filter((f) => f.ok).length;
  return {
    score: Math.round(step.points * ratio(hits, step.fields.length)),
    max: step.points,
    graded: true,
    answer: values,
    feedback,
  };
}

export function scoreDeadline(step: Of<"deadline-pick">, choice: string, note: string): StepResult {
  const graded = step.options.length > 0 && step.correct !== "";
  if (!graded) {
    return {
      score: 0,
      max: 0,
      graded: false,
      answer: { choice, note },
      feedback: [
        {
          label: "Sizning javobingiz",
          ok: null,
          note: note || "Javob yozilmadi.",
        },
        {
          label: "Ballanmadi",
          ok: null,
          note: "To'g'ri muddat yurist tasdiqlagandan keyin qo'shiladi. Shu sababli bu bosqich umumiy ballga kirmaydi.",
        },
      ],
    };
  }
  const ok = choice === step.correct;
  return {
    score: ok ? step.points : 0,
    max: step.points,
    graded: true,
    answer: { choice, note },
    feedback: [{ label: step.options.find((o) => o.id === choice)?.label ?? "-", ok, note: ok ? "To'g'ri." : "To'g'ri emas." }],
  };
}

export function totals(results: StepResult[]) {
  const max = results.reduce((n, r) => n + r.max, 0);
  const score = results.reduce((n, r) => n + r.score, 0);
  return { score, max, percent: max === 0 ? 0 : Math.round((score / max) * 100) };
}

const answerSchemas = {
  "doc-review": z.array(z.string().max(60)).max(50),
  draft: z.union([
    z.object({ skip: z.literal(true) }),
    z.object({
      met: z.array(z.string().max(60)).max(50),
      notes: z.record(z.string().max(60), z.string().max(400)).default({}),
      proof: z.string().max(200).optional(),
    }),
  ]),
  "client-chat": z.union([
    z.array(z.string()).max(50),
    z.object({ asked: z.array(z.string()).max(50), facts: z.array(z.string().max(60)).max(50), proof: z.string().max(200).optional() }),
  ]),
  "document-pick": z.array(z.string()).max(50),
  "authority-pick": z.array(z.string()).max(50),
  form: z.record(z.string(), z.string().max(200)),
  "deadline-pick": z.object({ choice: z.string().max(100), note: z.string().max(500) }),
} as const;

/**
 * Serverda javobni qayta hisoblash: mijoz yuborgan ballga ishonilmaydi, faqat xom javob olinadi.
 * Javob noto'g'ri shaklda bo'lsa null qaytaradi.
 */
export function scoreStep(scenario: Scenario, step: Step, answer: unknown): StepResult | null {
  switch (step.type) {
    case "client-chat": {
      const a = answerSchemas["client-chat"].safeParse(answer);
      if (!a.success) return null;
      // Obyekt shaklidagi javobdagi `facts` imzosi submitResult (server action) ichida tekshiriladi.
      return Array.isArray(a.data) ? scoreFacts(step, scenario, a.data) : scoreFacts(step, scenario, a.data.asked, a.data.facts);
    }
    case "doc-review": {
      const a = answerSchemas["doc-review"].safeParse(answer);
      return a.success ? scoreDocReview(step, a.data) : null;
    }
    case "draft": {
      const a = answerSchemas.draft.safeParse(answer);
      if (!a.success) return null;
      // `met` imzosi submitResult (server action) ichida tekshiriladi.
      return "skip" in a.data ? scoreDraftSkipped(step) : scoreDraft(step, a.data.met, a.data.notes, a.data.proof);
    }
    case "document-pick": {
      const a = answerSchemas["document-pick"].safeParse(answer);
      return a.success ? scoreDocuments(step, a.data) : null;
    }
    case "authority-pick": {
      const a = answerSchemas["authority-pick"].safeParse(answer);
      return a.success ? scoreAuthority(step, a.data) : null;
    }
    case "form": {
      const a = answerSchemas.form.safeParse(answer);
      return a.success ? scoreForm(step, a.data) : null;
    }
    case "deadline-pick": {
      const a = answerSchemas["deadline-pick"].safeParse(answer);
      return a.success ? scoreDeadline(step, a.data.choice, a.data.note) : null;
    }
  }
}
