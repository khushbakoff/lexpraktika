"use server";

import { col, getDb, isBackendConfigured } from "@/lib/server/db";
import { fail, getSession, type Role } from "@/lib/server/guard";
import { endSession, startSession } from "@/lib/server/session";
import { hashPassword, normalizeLogin, verifyPassword } from "@/lib/password";

export type StoredResult = {
  score: number;
  max: number;
  graded: boolean;
  answer: unknown;
  feedback: { label: string; ok: boolean | null; note: string }[];
};

export type MeResponse =
  | { status: "unconfigured" }
  | { status: "anon" }
  | {
      status: "authed";
      role: Role;
      fullName: string | null;
      login: string | null;
      universityName: string | null;
      organizationName: string | null;
      mustChangePassword: boolean;
      profile: { trackId: string; interests: string[]; level: string; employerId?: string } | null;
      results: Record<string, Record<string, StoredResult>>;
    };

const MAX_FAILED = 5;
const NOT_CONFIGURED = "Server sozlanmagan (MONGODB_URI, SESSION_SECRET)";

export async function getMe(): Promise<MeResponse> {
  const s = await getSession();
  if (s.kind === "unconfigured") return { status: "unconfigured" };
  if (s.kind !== "authed") return { status: "anon" };
  const { db, user } = s;

  const [uni, org, rows] = await Promise.all([
    user.universityId ? col.universities(db).findOne({ _id: user.universityId }) : null,
    user.organizationId ? col.organizations(db).findOne({ _id: user.organizationId }) : null,
    user.role === "student" || user.role === "individual" ? col.results(db).find({ userId: user._id }).toArray() : [],
  ]);

  const results: Record<string, Record<string, StoredResult>> = {};
  for (const r of rows) {
    (results[r.scenarioId] ??= {})[r.stepId] = {
      score: r.score,
      max: r.max,
      graded: r.graded,
      answer: r.answer,
      feedback: (r.feedback as StoredResult["feedback"]) ?? [],
    };
  }

  return {
    status: "authed",
    role: user.role,
    fullName: user.fullName,
    login: user.login,
    universityName: uni?.name ?? null,
    organizationName: org?.name ?? null,
    mustChangePassword: user.mustChangePassword,
    profile: user.trackId
      ? { trackId: user.trackId, interests: user.interests ?? [], level: user.level ?? "boshlovchi", employerId: user.employerId }
      : null,
    results,
  };
}

export async function signIn(login: string, password: string) {
  if (!isBackendConfigured()) return fail(NOT_CONFIGURED);
  const key = normalizeLogin(login);
  if (!key || !password) return fail("Login va parolni kiriting");

  const db = await getDb();
  // Parolni taxmin qilishdan himoya: 15 daqiqada 5 ta xato urinishdan keyin to'xtatiladi
  if ((await col.attempts(db).countDocuments({ key })) >= MAX_FAILED) {
    return fail("Juda ko'p xato urinish. 15 daqiqadan keyin qayta urinib ko'ring");
  }
  const user = await col.users(db).findOne({ login: key });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    await col.attempts(db).insertOne({ key, at: new Date() });
    return fail("Login yoki parol noto'g'ri");
  }
  await col.attempts(db).deleteMany({ key });
  await startSession(user._id.toHexString());
  return { ok: true as const };
}

export async function signUp(email: string, password: string, fullName: string, accepted: boolean) {
  if (!isBackendConfigured()) return fail(NOT_CONFIGURED);
  if (accepted !== true) return fail("Foydalanish shartlari va maxfiylik siyosatiga rozilik bering");
  const login = normalizeLogin(email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(login)) return fail("To'g'ri email kiriting");
  if (password.length < 8) return fail("Parol kamida 8 belgi bo'lsin");

  const db = await getDb();
  try {
    const res = await col.users(db).insertOne({
      login,
      fullName: fullName.trim().slice(0, 100) || null,
      role: "individual",
      passwordHash: hashPassword(password),
      interests: [],
      mustChangePassword: false,
      provider: "password",
      email: login,
      consentAt: new Date(),
      createdAt: new Date(),
    } as never);
    await startSession(res.insertedId.toHexString());
    return { ok: true as const, needsConfirm: false as const };
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return fail("Bu email bilan hisob allaqachon mavjud");
    return fail("Ro'yxatdan o'tib bo'lmadi");
  }
}

export async function signOut() {
  await endSession();
}

export async function changePassword(newPassword: string) {
  const s = await getSession();
  if (s.kind !== "authed") return fail("Avval tizimga kiring");
  if (newPassword.length < 8) return fail("Parol kamida 8 belgi bo'lsin");
  await col
    .users(s.db)
    .updateOne({ _id: s.user._id }, { $set: { passwordHash: hashPassword(newPassword), mustChangePassword: false } });
  return { ok: true as const };
}

/** Profilni tahrirlash: ism (va talaba uchun aloqa). */
export async function updateAccount(fullName: string, contact?: string) {
  const s = await getSession();
  if (s.kind !== "authed") return fail("Avval tizimga kiring");
  const name = fullName.trim().slice(0, 100);
  if (name.length < 2) return fail("Ism kamida 2 belgi bo'lsin");
  const set: Record<string, string> = { fullName: name };
  const unset: Record<string, ""> = {};
  if (s.user.role === "student" && contact !== undefined) {
    const c = contact.trim().slice(0, 100);
    if (c) set.contact = c;
    else unset.contact = "";
  }
  await col.users(s.db).updateOne({ _id: s.user._id }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) });
  return { ok: true as const };
}

/** Hisobni va unga tegishli barcha ma'lumotni o'chiradi (qaytarib bo'lmaydi). */
export async function deleteAccount() {
  const s = await getSession();
  if (s.kind !== "authed") return fail("Avval tizimga kiring");
  if (s.user.role !== "individual" && s.user.role !== "student") {
    return fail("Universitet va tashkilot hisobini administrator o'chiradi");
  }
  const id = s.user._id;
  await Promise.all([
    col.results(s.db).deleteMany({ userId: id }),
    col.nominations(s.db).deleteMany({ studentId: id }),
  ]);
  await col.users(s.db).deleteOne({ _id: id });
  await endSession();
  return { ok: true as const };
}
