"use server";

import { z } from "zod";
import type { ObjectId } from "mongodb";
import { col, toObjectId } from "@/lib/server/db";
import { loginBase, randomPassword, randomSuffix } from "@/lib/server/credentials";
import { fail, requireRole } from "@/lib/server/guard";
import { hashPassword } from "@/lib/server/password";

export type StudentRow = {
  id: string;
  login: string | null;
  full_name: string | null;
  group_name: string | null;
  track_id: string | null;
  total_score: number;
  total_max: number;
  steps_done: number;
  last_active: string | null;
};

export async function listStudents() {
  const g = await requireRole(["university_admin"]);
  if (!g.ok) return fail(g.error);
  const universityId = g.user.universityId;
  if (!universityId) return { ok: true as const, students: [] as StudentRow[] };

  const students = await col.users(g.db).find({ role: "student", universityId }).sort({ fullName: 1 }).toArray();
  const ids = students.map((s) => s._id);
  const groupIds = [...new Set(students.map((s) => s.groupId?.toHexString()).filter(Boolean))].map((x) => toObjectId(x as string)!);

  const [groups, totals] = await Promise.all([
    groupIds.length ? col.groups(g.db).find({ _id: { $in: groupIds } }).toArray() : [],
    ids.length
      ? col
          .results(g.db)
          .aggregate<{ _id: ObjectId; score: number; max: number; steps: number; last: Date }>([
            { $match: { userId: { $in: ids } } },
            {
              $group: {
                _id: "$userId",
                score: { $sum: { $cond: ["$graded", "$score", 0] } },
                max: { $sum: { $cond: ["$graded", "$max", 0] } },
                steps: { $sum: 1 },
                last: { $max: "$updatedAt" },
              },
            },
          ])
          .toArray()
      : [],
  ]);
  const groupName = new Map(groups.map((x) => [x._id.toHexString(), x.name]));
  const total = new Map(totals.map((x) => [x._id.toHexString(), x]));

  const rows: StudentRow[] = students.map((s) => {
    const t = total.get(s._id.toHexString());
    return {
      id: s._id.toHexString(),
      login: s.login,
      full_name: s.fullName,
      group_name: s.groupId ? (groupName.get(s.groupId.toHexString()) ?? null) : null,
      track_id: s.trackId ?? null,
      total_score: t?.score ?? 0,
      total_max: t?.max ?? 0,
      steps_done: t?.steps ?? 0,
      last_active: t?.last ? t.last.toISOString() : null,
    };
  });
  return { ok: true as const, students: rows };
}

export async function listOrganizations() {
  const g = await requireRole(["university_admin"]);
  if (!g.ok) return fail(g.error);
  const orgs = await col.organizations(g.db).find({}).sort({ name: 1 }).toArray();
  return {
    ok: true as const,
    organizations: orgs.map((o) => ({ id: o._id.toHexString(), name: o.name, kind: o.kind ?? null })),
  };
}

export type NominationRow = {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
  student: { full_name: string | null } | null;
  organization: { name: string } | null;
};

export async function listNominations() {
  const g = await requireRole(["university_admin"]);
  if (!g.ok) return fail(g.error);
  const universityId = g.user.universityId;
  if (!universityId) return { ok: true as const, nominations: [] as NominationRow[] };

  const noms = await col.nominations(g.db).find({ universityId }).sort({ createdAt: -1 }).toArray();
  const [users, orgs] = await Promise.all([
    col.users(g.db).find({ _id: { $in: noms.map((n) => n.studentId) } }).toArray(),
    col.organizations(g.db).find({ _id: { $in: noms.map((n) => n.organizationId) } }).toArray(),
  ]);
  const uName = new Map(users.map((u) => [u._id.toHexString(), u.fullName]));
  const oName = new Map(orgs.map((o) => [o._id.toHexString(), o.name]));

  const rows: NominationRow[] = noms.map((n) => ({
    id: n._id.toHexString(),
    status: n.status,
    note: n.note,
    created_at: n.createdAt.toISOString(),
    student: { full_name: uName.get(n.studentId.toHexString()) ?? null },
    organization: { name: oName.get(n.organizationId.toHexString()) ?? "Tashkilot" },
  }));
  return { ok: true as const, nominations: rows };
}

export async function nominate(studentId: string, organizationId: string, note: string) {
  const g = await requireRole(["university_admin"]);
  if (!g.ok) return fail(g.error);
  const p = z.object({ n: z.string().max(300) }).safeParse({ n: note });
  const sid = toObjectId(studentId);
  const oid = toObjectId(organizationId);
  if (!p.success || !sid || !oid || !g.user.universityId) return fail("Ma'lumot noto'g'ri");

  // Talaba shu universitetniki bo'lishi shart
  const student = await col.users(g.db).findOne({ _id: sid, role: "student", universityId: g.user.universityId });
  if (!student) return fail("Bu talaba sizning universitetingizniki emas");
  if (!(await col.organizations(g.db).findOne({ _id: oid }))) return fail("Tashkilot topilmadi");

  const now = new Date();
  try {
    await col.nominations(g.db).insertOne({
      studentId: sid,
      universityId: g.user.universityId,
      organizationId: oid,
      nominatedBy: g.user._id,
      status: "pending",
      note: p.data.n.trim() || null,
      createdAt: now,
      updatedAt: now,
    } as never);
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return fail("Bu talaba bu tashkilotga allaqachon yuborilgan");
    return fail("Yuborib bo'lmadi");
  }
  return { ok: true as const };
}

export type CreatedStudent = { fullName: string; group: string; login: string; password: string };

/**
 * Matn: har qatorda "Ism Familiya" yoki "Ism Familiya; Guruh" (vergul ham bo'ladi).
 * Har talabaga login va tasodifiy parol beriladi. Parol faqat shu javobda qaytadi.
 */
export async function createStudents(text: string) {
  const g = await requireRole(["university_admin"]);
  if (!g.ok) return fail(g.error);
  const universityId = g.user.universityId;
  if (!universityId) return fail("Hisobingiz universitetga biriktirilmagan");

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return fail("Ro'yxat bo'sh");
  if (lines.length > 200) return fail("Bir martada ko'pi bilan 200 ta talaba");

  const groupIds = new Map<string, ObjectId>();
  const groupId = async (name: string): Promise<ObjectId | undefined> => {
    if (!name) return undefined;
    const cached = groupIds.get(name);
    if (cached) return cached;
    const doc = await col
      .groups(g.db)
      .findOneAndUpdate(
        { universityId, name },
        { $setOnInsert: { universityId, name } },
        { upsert: true, returnDocument: "after" },
      );
    if (doc) groupIds.set(name, doc._id);
    return doc?._id;
  };

  const created: CreatedStudent[] = [];
  const failed: string[] = [];

  for (const line of lines) {
    const [rawName, rawGroup = ""] = line.split(/[;,]/).map((x) => x.trim());
    const fullName = rawName.slice(0, 100);
    const group = rawGroup.slice(0, 50);
    if (fullName.length < 3) {
      failed.push(line);
      continue;
    }
    let made = false;
    for (let attempt = 0; attempt < 5 && !made; attempt++) {
      const login = `${loginBase(fullName)}${randomSuffix()}`;
      const password = randomPassword();
      try {
        await col.users(g.db).insertOne({
          login,
          fullName,
          role: "student",
          passwordHash: hashPassword(password),
          universityId,
          groupId: await groupId(group),
          interests: [],
          mustChangePassword: true,
          createdAt: new Date(),
        } as never);
        created.push({ fullName, group, login, password });
        made = true;
      } catch (e) {
        if ((e as { code?: number }).code !== 11000) break; // login band bo'lsa qayta urinadi
      }
    }
    if (!made) failed.push(line);
  }
  return { ok: true as const, created, failed };
}
