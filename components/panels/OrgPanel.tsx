"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteCandidate, listCandidates, type CandidateRow } from "@/app/actions/org";
import { useMe } from "@/lib/user/me";
import { AREAS, trackById } from "@/lib/content/tracks";
import GlassCard from "@/components/ui/GlassCard";
import Icon3D from "@/components/ui/Icon3D";

const pct = (c: CandidateRow) => (c.total_max > 0 ? Math.round((c.total_score / c.total_max) * 100) : 0);

export default function OrgPanel() {
  const router = useRouter();
  const me = useMe();
  const [list, setList] = useState<CandidateRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const apply = useCallback((r: Awaited<ReturnType<typeof listCandidates>>) => {
    if (!r.ok) return setError(r.error);
    setError(null);
    setList(r.candidates);
  }, []);
  const load = useCallback(async () => apply(await listCandidates()), [apply]);

  useEffect(() => {
    if (me.status === "anon" || me.status === "unconfigured") router.replace("/kirish");
    if (me.status === "authed" && me.role !== "org_member") router.replace("/");
    if (me.status === "authed" && me.role === "org_member") void listCandidates().then(apply);
  }, [me, router, apply]);

  const invite = (id: string) =>
    start(async () => {
      const r = await inviteCandidate(id);
      if (!r.ok) return setError(r.error);
      await load();
    });

  if (me.status !== "authed") return <div className="glass h-32 animate-pulse rounded-3xl" aria-busy="true" />;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Icon3D name="briefcase" size={48} />
        <div>
          <h1 className="text-2xl font-bold leading-tight">Nomzodlar</h1>
          <p className="text-sm text-soft">{me.organizationName ?? "Tashkilot"}</p>
        </div>
      </header>

      {error && <p role="alert" className="rounded-2xl bg-warn/15 px-4 py-2 text-sm text-warn">{error}</p>}
      {list === null && !error && <div className="glass h-24 animate-pulse rounded-3xl" aria-busy="true" />}
      {list && list.length === 0 && (
        <GlassCard>
          <p className="text-sm text-soft">
            Hozircha nomzod yo&apos;q. Universitetlar talabalarni yuborib, talaba rozilik bergandan keyin shu yerda ko&apos;rinadi.
          </p>
        </GlassCard>
      )}

      <ul className="flex flex-col gap-3">
        {(list ?? []).map((c) => (
          <li key={c.nomination_id}>
            <GlassCard className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold leading-snug">{c.full_name ?? "Nomzod"}</p>
                  <p className="text-xs text-soft">
                    {[c.university_name, trackById(c.track_id ?? "")?.title].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-bold text-accent">{pct(c)}%</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {c.interests.map((i) => (
                  <span key={i} className="glass rounded-full px-2.5 py-0.5 text-xs">
                    {AREAS.find((a) => a.id === i)?.title ?? i}
                  </span>
                ))}
              </div>
              {c.note && <p className="text-sm text-soft">Universitet izohi: {c.note}</p>}

              {c.status === "consented" && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => invite(c.nomination_id)}
                  className="min-h-[48px] rounded-2xl bg-accent px-5 text-sm font-semibold text-[var(--accent-contrast)] disabled:opacity-50"
                >
                  Taklif yuborish
                </button>
              )}
              {c.status === "invited" && <p className="text-sm text-soft">Taklif yuborildi. Talaba javobini kutmoqda.</p>}
              {c.status === "accepted" && (
                <p className="rounded-xl bg-success/15 px-3 py-2 text-sm text-success">
                  Talaba taklifni qabul qildi. Aloqa: <b>{c.contact || "kiritilmagan"}</b>
                </p>
              )}
            </GlassCard>
          </li>
        ))}
      </ul>
      <p className="text-center text-xs text-soft">
        Siz faqat o&apos;z roziligini bergan talabalarni ko&apos;rasiz. Aloqa ma&apos;lumoti talaba taklifni qabul qilgandan keyin ochiladi.
      </p>
    </div>
  );
}
