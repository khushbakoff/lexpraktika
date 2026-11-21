"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createStudents, listNominations, listOrganizations, listStudents, nominate,
  type CreatedStudent, type NominationRow, type StudentRow,
} from "@/app/actions/university";
import { useMe } from "@/lib/me";
import { trackById } from "@/lib/tracks";
import GlassCard from "@/components/ui/GlassCard";
import Icon3D from "@/components/ui/Icon3D";

const STATUS_LABEL: Record<string, string> = {
  pending: "Talaba javobini kutmoqda",
  consented: "Talaba rozi, tashkilot ko'rmoqda",
  declined: "Talaba rad etdi",
  invited: "Tashkilot taklif yubordi",
  accepted: "Talaba taklifni qabul qildi",
  rejected: "Talaba taklifni rad etdi",
};

const pct = (s: StudentRow) => (s.total_max > 0 ? Math.round((s.total_score / s.total_max) * 100) : 0);

const primary =
  "min-h-[48px] rounded-2xl bg-accent px-5 text-sm font-semibold text-[var(--accent-contrast)] disabled:opacity-50";
const field =
  "w-full rounded-2xl border border-soft/30 bg-white/40 px-3 py-2 text-base text-text placeholder:text-soft dark:bg-white/10";

export default function UniversityPanel() {
  const router = useRouter();
  const me = useMe();
  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [noms, setNoms] = useState<NominationRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [orgId, setOrgId] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const [bulk, setBulk] = useState("");
  const [created, setCreated] = useState<CreatedStudent[] | null>(null);
  const [failedLines, setFailedLines] = useState<string[]>([]);

  const fetchAll = useCallback(
    async () => Promise.all([listStudents(), listOrganizations(), listNominations()]),
    [],
  );
  const apply = useCallback(([s, o, n]: Awaited<ReturnType<typeof fetchAll>>) => {
    if (!s.ok) return setError(s.error);
    setError(null);
    setStudents(s.students);
    if (o.ok) setOrgs(o.organizations);
    if (n.ok) setNoms(n.nominations);
  }, []);
  const load = useCallback(async () => apply(await fetchAll()), [apply, fetchAll]);

  useEffect(() => {
    if (me.status === "anon" || me.status === "unconfigured") router.replace("/kirish");
    if (me.status === "authed" && me.role !== "university_admin") router.replace("/");
    if (me.status === "authed" && me.role === "university_admin") void fetchAll().then(apply);
  }, [me, router, fetchAll, apply]);

  const sorted = useMemo(
    () => [...(students ?? [])].sort((a, b) => pct(b) - pct(a)).filter((s) => pct(s) >= filter),
    [students, filter],
  );
  const stats = useMemo(() => {
    const list = students ?? [];
    const active = list.filter((s) => s.steps_done > 0);
    const avg = active.length ? Math.round(active.reduce((n, s) => n + pct(s), 0) / active.length) : 0;
    return { total: list.length, active: active.length, avg };
  }, [students]);

  const send = (studentId: string) =>
    start(async () => {
      const r = await nominate(studentId, orgId, note);
      if (!r.ok) return setMsg(r.error);
      setMsg("Yuborildi. Talaba rozilik berishi kerak.");
      setOpen(null);
      setNote("");
      await load();
    });

  const create = () =>
    start(async () => {
      const r = await createStudents(bulk);
      if (!r.ok) return setMsg(r.error);
      setCreated(r.created);
      setFailedLines(r.failed);
      setBulk("");
      await load();
    });

  const csv = () => {
    if (!created) return;
    const body = ["Ism familiya,Guruh,Login,Parol", ...created.map((c) => [c.fullName, c.group, c.login, c.password].join(","))];
    const url = URL.createObjectURL(new Blob([body.join("\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "talabalar-login-parol.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (me.status !== "authed") return <div className="glass h-32 animate-pulse rounded-3xl" aria-busy="true" />;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Icon3D name="court" size={48} />
        <div>
          <h1 className="text-2xl font-bold leading-tight">Talabalar</h1>
          <p className="text-sm text-soft">{me.universityName ?? "Universitet"}</p>
        </div>
      </header>

      {error && <p role="alert" className="rounded-2xl bg-warn/15 px-4 py-2 text-sm text-warn">{error}</p>}
      {msg && <p role="status" className="glass rounded-2xl px-4 py-2 text-sm">{msg}</p>}

      <div className="grid grid-cols-3 gap-2">
        {[
          { v: stats.total, l: "Talaba" },
          { v: stats.active, l: "Faol" },
          { v: `${stats.avg}%`, l: "O'rtacha" },
        ].map((x) => (
          <GlassCard key={x.l} strong className="text-center !p-3">
            <p className="text-xl font-bold">{x.v}</p>
            <p className="text-xs text-soft">{x.l}</p>
          </GlassCard>
        ))}
      </div>

      <div className="flex gap-2" role="group" aria-label="Natija bo'yicha filtr">
        {[0, 70, 85].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`min-h-[44px] rounded-full px-4 text-sm font-semibold ${filter === f ? "bg-accent text-[var(--accent-contrast)]" : "glass"}`}
          >
            {f === 0 ? "Hammasi" : `${f}%+`}
          </button>
        ))}
      </div>

      {students === null && !error && <div className="glass h-24 animate-pulse rounded-3xl" aria-busy="true" />}
      {students && sorted.length === 0 && (
        <p className="text-sm text-soft">
          {students.length === 0 ? "Hali talaba yo'q. Pastdan hisob yarating." : "Bu filtrda talaba yo'q."}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {sorted.map((s) => (
          <li key={s.id}>
            <GlassCard className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold leading-snug">{s.full_name ?? s.login}</p>
                  <p className="text-xs text-soft">
                    {[s.group_name, trackById(s.track_id ?? "")?.title, `${s.steps_done} bosqich`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-bold text-accent">{pct(s)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct(s)}%` }} />
              </div>
              {open === s.id ? (
                <div className="flex flex-col gap-2 pt-1">
                  <select className={field} value={orgId} onChange={(e) => setOrgId(e.target.value)} aria-label="Tashkilot">
                    <option value="">Tashkilotni tanlang</option>
                    {orgs.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  <input className={field} placeholder="Izoh (ixtiyoriy)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
                  <div className="flex gap-2">
                    <button type="button" disabled={!orgId || pending} onClick={() => send(s.id)} className={primary}>
                      Yuborish
                    </button>
                    <button type="button" onClick={() => setOpen(null)} className="glass min-h-[48px] rounded-2xl px-4 text-sm">
                      Bekor
                    </button>
                  </div>
                  <p className="text-xs text-soft">Tashkilot talaba rozilik bermaguncha hech narsa ko&apos;rmaydi.</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { setOpen(s.id); setMsg(null); }}
                  className="min-h-[44px] self-start text-sm font-semibold text-accent"
                >
                  Tashkilotga yuborish
                </button>
              )}
            </GlassCard>
          </li>
        ))}
      </ul>

      {noms.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Yuborilgan nomzodlar">
          <h2 className="text-lg font-bold">Yuborilgan nomzodlar</h2>
          {noms.map((n) => (
            <GlassCard key={n.id} className="!p-3">
              <p className="font-semibold">{n.student?.full_name ?? "Talaba"} → {n.organization?.name ?? "Tashkilot"}</p>
              <p className="text-xs text-soft">{STATUS_LABEL[n.status] ?? n.status}</p>
            </GlassCard>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2" aria-label="Talaba hisoblarini yaratish">
        <h2 className="text-lg font-bold">Talaba hisoblarini yaratish</h2>
        <GlassCard className="flex flex-col gap-3">
          <p className="text-sm text-soft">
            Har qatorga bitta talaba: <b>Ism Familiya; Guruh</b>. Tizim login va parol beradi.
          </p>
          <textarea className={field} rows={5} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"Aziz Karimov; 301-guruh\nMadina Yusupova; 301-guruh"} />
          <button type="button" disabled={!bulk.trim() || pending} onClick={create} className={primary}>
            {pending ? "Yaratilmoqda..." : "Hisoblarni yaratish"}
          </button>
        </GlassCard>

        {created && (
          <GlassCard strong className="flex flex-col gap-2">
            <p className="font-bold">{created.length} ta hisob yaratildi</p>
            <p className="rounded-xl bg-warn/15 px-3 py-2 text-xs text-warn">
              Parollar faqat hozir ko&apos;rinadi. CSV&apos;ni yuklab oling va talabalarga bering. Ular birinchi kirishda parolni almashtiradi.
            </p>
            <ul className="text-sm">
              {created.map((c) => (
                <li key={c.login} className="flex justify-between gap-2 border-b border-soft/15 py-1">
                  <span>{c.fullName}</span>
                  <span className="font-mono">{c.login} / {c.password}</span>
                </li>
              ))}
            </ul>
            {failedLines.length > 0 && <p className="text-xs text-warn">Yaratilmadi: {failedLines.join("; ")}</p>}
            <button type="button" onClick={csv} className={primary}>CSV yuklab olish</button>
          </GlassCard>
        )}
      </section>
    </div>
  );
}
