import "server-only";
import type { Db } from "mongodb";
import { col, getDb, isBackendConfigured, toObjectId, type Role, type UserDoc } from "./db";
import { readSessionUserId } from "./session";

export type { Role, UserDoc };

export type Fail = { ok: false; error: string };
export const fail = (error: string): Fail => ({ ok: false, error });

/** Joriy foydalanuvchi (token serverda tekshiriladi). */
export async function getSession() {
  if (!isBackendConfigured()) return { kind: "unconfigured" as const };
  const id = await readSessionUserId();
  const oid = id ? toObjectId(id) : null;
  if (!oid) return { kind: "anon" as const };
  const db = await getDb();
  const user = await col.users(db).findOne({ _id: oid });
  if (!user) return { kind: "anon" as const };
  return { kind: "authed" as const, db, user };
}

/** Berilgan rollardan biri bo'lishini talab qiladi. */
export async function requireRole(roles: Role[]) {
  const s = await getSession();
  if (s.kind === "unconfigured") return { ok: false as const, error: "Server sozlanmagan (MONGODB_URI, SESSION_SECRET)" };
  if (s.kind !== "authed") return { ok: false as const, error: "Avval tizimga kiring" };
  if (!roles.includes(s.user.role)) return { ok: false as const, error: "Bu amal uchun ruxsat yo'q" };
  return { ok: true as const, db: s.db as Db, user: s.user };
}
