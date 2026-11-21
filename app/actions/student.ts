"use server";

import { z } from "zod";
import { col, toObjectId, type NominationStatus } from "@/lib/server/db";
import { fail, requireRole } from "@/lib/server/guard";

export type MyNomination = {
  id: string;
  status: NominationStatus;
  note: string | null;
  organization: { name: string } | null;
};

export async function myNominations() {
  const g = await requireRole(["student"]);
  if (!g.ok) return fail(g.error);
  const noms = await col.nominations(g.db).find({ studentId: g.user._id }).sort({ createdAt: -1 }).toArray();
  const orgs = await col.organizations(g.db).find({ _id: { $in: noms.map((n) => n.organizationId) } }).toArray();
  const oName = new Map(orgs.map((o) => [o._id.toHexString(), o.name]));
  return {
    ok: true as const,
    nominations: noms.map(
      (n): MyNomination => ({
        id: n._id.toHexString(),
        status: n.status,
        note: n.note,
        organization: { name: oName.get(n.organizationId.toHexString()) ?? "Tashkilot" },
      }),
    ),
    contact: g.user.contact ?? "",
  };
}

/** Talaba qaysi holatdan qaysi holatga o'tishi mumkin (nomzod holat mashinasi). */
const FROM: Record<"consented" | "declined" | "accepted" | "rejected", NominationStatus[]> = {
  consented: ["pending"],
  declined: ["pending", "consented", "invited"],
  accepted: ["invited"],
  rejected: ["invited"],
};

export async function respondNomination(id: string, status: "consented" | "declined" | "accepted" | "rejected") {
  const g = await requireRole(["student"]);
  if (!g.ok) return fail(g.error);
  const p = z.enum(["consented", "declined", "accepted", "rejected"]).safeParse(status);
  const oid = toObjectId(id);
  if (!p.success || !oid) return fail("Ma'lumot noto'g'ri");
  const res = await col
    .nominations(g.db)
    .updateOne(
      { _id: oid, studentId: g.user._id, status: { $in: FROM[p.data] } },
      { $set: { status: p.data, updatedAt: new Date() } },
    );
  if (res.matchedCount === 0) return fail("Javobni saqlab bo'lmadi");
  return { ok: true as const };
}

/** Aloqa ma'lumoti: tashkilotga faqat taklifni qabul qilganingizdan keyin ko'rinadi. */
export async function saveContact(contact: string) {
  const g = await requireRole(["student"]);
  if (!g.ok) return fail(g.error);
  const c = z.string().trim().max(100).safeParse(contact);
  if (!c.success) return fail("Aloqa ma'lumoti juda uzun");
  await col.users(g.db).updateOne({ _id: g.user._id }, c.data ? { $set: { contact: c.data } } : { $unset: { contact: "" } });
  return { ok: true as const };
}
