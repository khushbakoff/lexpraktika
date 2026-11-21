"use server";

import { col, toObjectId } from "@/lib/server/db";
import { fail, requireRole } from "@/lib/server/guard";

export type CandidateRow = {
  nomination_id: string;
  status: "consented" | "invited" | "accepted";
  full_name: string | null;
  track_id: string | null;
  interests: string[];
  level: string | null;
  total_score: number;
  total_max: number;
  university_name: string;
  note: string | null;
  contact: string | null;
};

/** Tashkilot faqat talaba rozilik bergan nomzodlarni ko'radi. Aloqa faqat 'accepted' da ochiladi. */
export async function listCandidates() {
  const g = await requireRole(["org_member"]);
  if (!g.ok) return fail(g.error);
  const organizationId = g.user.organizationId;
  if (!organizationId) return { ok: true as const, candidates: [] as CandidateRow[] };

  const noms = await col
    .nominations(g.db)
    .find({ organizationId, status: { $in: ["consented", "invited", "accepted"] } })
    .sort({ updatedAt: -1 })
    .toArray();
  if (noms.length === 0) return { ok: true as const, candidates: [] as CandidateRow[] };

  const studentIds = noms.map((n) => n.studentId);
  const [students, unis, totals] = await Promise.all([
    col.users(g.db).find({ _id: { $in: studentIds } }).toArray(),
    col.universities(g.db).find({ _id: { $in: noms.map((n) => n.universityId) } }).toArray(),
    col
      .results(g.db)
      .aggregate<{ _id: unknown; score: number; max: number }>([
        { $match: { userId: { $in: studentIds } } },
        {
          $group: {
            _id: "$userId",
            score: { $sum: { $cond: ["$graded", "$score", 0] } },
            max: { $sum: { $cond: ["$graded", "$max", 0] } },
          },
        },
      ])
      .toArray(),
  ]);
  const sMap = new Map(students.map((s) => [s._id.toHexString(), s]));
  const uMap = new Map(unis.map((u) => [u._id.toHexString(), u.name]));
  const tMap = new Map(totals.map((t) => [String(t._id), t]));

  const candidates: CandidateRow[] = noms.map((n) => {
    const s = sMap.get(n.studentId.toHexString());
    const t = tMap.get(n.studentId.toHexString());
    return {
      nomination_id: n._id.toHexString(),
      status: n.status as CandidateRow["status"],
      full_name: s?.fullName ?? null,
      track_id: s?.trackId ?? null,
      interests: s?.interests ?? [],
      level: s?.level ?? null,
      total_score: t?.score ?? 0,
      total_max: t?.max ?? 0,
      university_name: uMap.get(n.universityId.toHexString()) ?? "",
      note: n.note,
      contact: n.status === "accepted" ? (s?.contact ?? null) : null,
    };
  });
  return { ok: true as const, candidates };
}

export async function inviteCandidate(nominationId: string) {
  const g = await requireRole(["org_member"]);
  if (!g.ok) return fail(g.error);
  const id = toObjectId(nominationId);
  if (!id || !g.user.organizationId) return fail("Noto'g'ri nomzod");
  const res = await col
    .nominations(g.db)
    .updateOne(
      { _id: id, organizationId: g.user.organizationId, status: "consented" },
      { $set: { status: "invited", updatedAt: new Date() } },
    );
  if (res.matchedCount === 0) return fail("Taklif yuborib bo'lmadi");
  return { ok: true as const };
}
