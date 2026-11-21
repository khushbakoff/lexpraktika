"use server";

import { z } from "zod";
import { getScenario } from "@/lib/scenarios";
import { scoreStep, type StepResult } from "@/lib/scoring";
import { col } from "@/lib/server/db";
import { fail, requireRole } from "@/lib/server/guard";
import { verifyFacts } from "@/lib/server/chat-proof";

/**
 * Natijani serverda qayta hisoblab saqlaydi. Brauzer yuborgan ballga ishonilmaydi.
 * Faqat talaba va mustaqil foydalanuvchi natija yozadi.
 */
export async function submitResult(scenarioId: string, stepId: string, answer: unknown) {
  const g = await requireRole(["student", "individual"]);
  if (!g.ok) return fail(g.error);

  const scenario = getScenario(scenarioId);
  const step = scenario?.steps.find((s) => s.id === stepId);
  if (!scenario || !step) return fail("Vaziyat yoki bosqich topilmadi");

  // AI suhbatda ochilgan faktlar server imzosi bilan tasdiqlanmasa, ball berilmaydi.
  if (step.type === "client-chat" && answer && typeof answer === "object" && !Array.isArray(answer)) {
    const a = answer as { facts?: unknown; proof?: unknown };
    const facts = Array.isArray(a.facts) ? a.facts.filter((x): x is string => typeof x === "string") : [];
    if (!verifyFacts(scenarioId, stepId, facts, typeof a.proof === "string" ? a.proof : "")) {
      return fail("Suhbat holati tasdiqlanmadi, qayta urinib ko'ring");
    }
  }

  // AI tekshirgan hujjat mezonlari ham server imzosi bilan tasdiqlanadi.
  if (step.type === "draft" && answer && typeof answer === "object" && "met" in answer) {
    const a = answer as { met?: unknown; proof?: unknown };
    const met = Array.isArray(a.met) ? a.met.filter((x): x is string => typeof x === "string") : [];
    if (!verifyFacts(scenarioId, stepId, met, typeof a.proof === "string" ? a.proof : "", "draft")) {
      return fail("Tekshiruv natijasi tasdiqlanmadi, qayta tekshirtiring");
    }
  }

  const result = scoreStep(scenario, step, answer);
  if (!result) return fail("Javob shakli noto'g'ri");

  try {
    await col.results(g.db).updateOne(
      { userId: g.user._id, scenarioId, stepId },
      {
        $set: {
          score: result.score,
          max: result.max,
          graded: result.graded,
          answer: result.answer,
          feedback: result.feedback,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  } catch {
    return fail("Saqlab bo'lmadi, qayta urinib ko'ring");
  }
  return { ok: true as const, result: result as StepResult };
}

/** "Boshidan boshlash": shu vaziyat bo'yicha serverdagi natijalar ham o'chiriladi. */
export async function resetScenarioResults(scenarioId: string) {
  const g = await requireRole(["student", "individual"]);
  if (!g.ok) return fail(g.error);
  const id = z.string().min(1).max(100).safeParse(scenarioId);
  if (!id.success) return fail("Noto'g'ri vaziyat");
  await col.results(g.db).deleteMany({ userId: g.user._id, scenarioId: id.data });
  return { ok: true as const };
}

/** Onboarding natijasini profilga yozadi (ro'yxatdan o'tgan foydalanuvchi uchun). */
export async function saveMyProfile(input: { trackId: string; interests: string[]; level: string; employerId?: string }) {
  const g = await requireRole(["student", "individual"]);
  if (!g.ok) return fail(g.error);
  const parsed = z
    .object({
      trackId: z.string().max(50),
      interests: z.array(z.string().max(50)).max(20),
      level: z.string().max(50),
      employerId: z.string().max(60).optional(),
    })
    .safeParse(input);
  if (!parsed.success) return fail("Ma'lumot noto'g'ri");
  await col
    .users(g.db)
    .updateOne(
      { _id: g.user._id },
      {
        $set: {
          trackId: parsed.data.trackId,
          interests: parsed.data.interests,
          level: parsed.data.level,
          ...(parsed.data.employerId ? { employerId: parsed.data.employerId } : {}),
        },
        ...(parsed.data.employerId ? {} : { $unset: { employerId: "" } }),
      },
    );
  return { ok: true as const };
}
