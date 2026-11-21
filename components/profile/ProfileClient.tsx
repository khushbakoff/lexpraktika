"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { ARIZA_TASKS } from "@/lib/ariza";
import { useStreak } from "@/lib/learning/activity";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CreditCard, FileText, ListChecks, Pencil, Settings, ShieldCheck, Target, Trash2, type LucideIcon } from "lucide-react";
import { changePassword, deleteAccount, signOut, updateAccount } from "@/app/actions/auth";
import { myNominations, respondNomination, saveContact, type MyNomination } from "@/app/actions/student";
import { clearLocalAfterSignOut, refreshMe, useMe } from "@/lib/user/me";
import { useProfile } from "@/lib/user/profile";
import { useAllResults, useTotalXp } from "@/lib/learning/progress";
import { AREAS, LEVELS, trackById } from "@/lib/content/tracks";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import Icon3D from "@/components/ui/Icon3D";
import SelectMark from "@/components/ui/SelectMark";
import { saveMyProfile } from "@/app/actions/progress";
import ThemeToggle from "@/components/layout/ThemeToggle";
import LanguageSelect from "@/components/layout/LanguageSelect";
import { usePlan } from "@/lib/user/plan-client";
import { PLANS } from "@/lib/user/plans";

const ROLE_LABEL: Record<string, string> = {
  individual: "Mustaqil foydalanuvchi",
  student: "Talaba",
  university_admin: "Universitet",
  org_member: "Tashkilot",
  platform_admin: "Admin",
};

const field =
  "min-h-[48px] w-full rounded-2xl border border-soft/30 bg-white/40 px-3 text-base text-text placeholder:text-soft dark:bg-white/10";
const primary =
  "min-h-[48px] rounded-2xl bg-accent px-5 text-sm font-semibold text-[var(--accent-contrast)] disabled:opacity-50";

function Offers() {
  const [items, setItems] = useState<MyNomination[] | null>(null);
  const [contact, setContact] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const apply = useCallback((r: Awaited<ReturnType<typeof myNominations>>) => {
    if (r.ok) {
      setItems(r.nominations);
      setContact(r.contact);
    }
  }, []);
  const load = useCallback(async () => apply(await myNominations()), [apply]);
  useEffect(() => {
    void myNominations().then(apply);
  }, [apply]);

  const answer = (id: string, status: "consented" | "declined" | "accepted" | "rejected") =>
    start(async () => {
      const r = await respondNomination(id, status);
      setMsg(r.ok ? null : r.error);
      await load();
    });

  if (!items || items.length === 0) return null;
  const active = items.filter((n) => n.status !== "declined" && n.status !== "rejected");

  return (
    <GlassCard strong className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 font-bold">
        <Icon3D name="briefcase" size={24} /> Takliflar
      </h2>
      {msg && <p role="alert" className="text-sm text-warn">{msg}</p>}

      {active.map((n) => (
        <div key={n.id} className="flex flex-col gap-2 rounded-2xl border border-soft/20 p-3">
          <p className="font-semibold">{n.organization?.name ?? "Tashkilot"}</p>
          {n.note && <p className="text-sm text-soft">Universitet izohi: {n.note}</p>}

          {n.status === "pending" && (
            <>
              <p className="text-sm">
                Universitetingiz sizni shu tashkilotga tavsiya qildi. Rozilik bersangiz, tashkilot ismingiz, ballingiz, yo&apos;nalishingiz va qiziqishlaringizni ko&apos;radi. Aloqa ma&apos;lumotingiz ko&apos;rinmaydi.
              </p>
              <div className="flex gap-2">
                <button type="button" disabled={pending} onClick={() => answer(n.id, "consented")} className={primary}>Roziman</button>
                <button type="button" disabled={pending} onClick={() => answer(n.id, "declined")} className="glass min-h-[48px] rounded-2xl px-4 text-sm">Rad etaman</button>
              </div>
            </>
          )}
          {n.status === "consented" && (
            <>
              <p className="text-sm text-soft">Rozilik berdingiz. Tashkilot taklif yuborishini kutyapmiz.</p>
              <button type="button" disabled={pending} onClick={() => answer(n.id, "declined")} className="min-h-[44px] self-start text-sm text-soft underline">
                Rozilikni qaytarib olish
              </button>
            </>
          )}
          {n.status === "invited" && (
            <>
              <p className="text-sm">Tashkilot sizga taklif yubordi. Qabul qilsangiz aloqa ma&apos;lumotingiz ularga ochiladi.</p>
              <div className="flex gap-2">
                <button type="button" disabled={pending || !contact.trim()} onClick={() => answer(n.id, "accepted")} className={primary}>Qabul qilaman</button>
                <button type="button" disabled={pending} onClick={() => answer(n.id, "rejected")} className="glass min-h-[48px] rounded-2xl px-4 text-sm">Rad etaman</button>
              </div>
              {!contact.trim() && <p className="text-xs text-warn">Qabul qilish uchun pastda aloqa ma&apos;lumotingizni kiriting.</p>}
            </>
          )}
          {n.status === "accepted" && <p className="text-sm text-success">Siz taklifni qabul qildingiz. Tashkilot siz bilan bog&apos;lanadi.</p>}
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <label htmlFor="contact" className="text-sm font-semibold">Aloqa ma&apos;lumotingiz (telefon yoki Telegram)</label>
        <div className="flex gap-2">
          <input id="contact" className={field} value={contact} maxLength={100} onChange={(e) => setContact(e.target.value)} placeholder="+998 ..." />
          <button type="button" disabled={pending} onClick={() => start(async () => { const r = await saveContact(contact); setMsg(r.ok ? null : r.error); })} className={primary}>
            Saqlash
          </button>
        </div>
        <p className="text-xs text-soft">Faqat taklifni qabul qilganingizdan keyin tashkilotga ko&apos;rinadi.</p>
      </div>
    </GlassCard>
  );
}

function ChangePassword() {
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <GlassCard strong className="flex flex-col gap-2">
      <h2 className="font-bold">Parolni almashtiring</h2>
      <p className="text-sm text-soft">Universitet bergan parol vaqtinchalik. O&apos;zingiz yangisini o&apos;rnating (kamida 8 belgi).</p>
      <input className={field} type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Yangi parol" />
      {msg && <p role="alert" className="text-sm text-warn">{msg}</p>}
      <button
        type="button"
        disabled={pending || pw.length < 8}
        className={primary}
        onClick={() =>
          start(async () => {
            const r = await changePassword(pw);
            if (!r.ok) return setMsg(r.error);
            setPw("");
            await refreshMe();
          })
        }
      >
        Parolni saqlash
      </button>
    </GlassCard>
  );
}

/** Ariza ustaxonasida bajarilgan mashqlar (brauzerda saqlanadi; serverda render paytida null). */
const readArizaDone = () => {
  try {
    const r = JSON.parse(localStorage.getItem("lexsim-ariza-v3") || "{}") as Record<string, { score?: number }>;
    return ARIZA_TASKS.filter((t) => (r[t.id]?.score ?? 0) >= t.passAt).length;
  } catch {
    return 0;
  }
};
const noSubscribe = () => () => {};

/** Kompyuterda profil chap ustuni: asosiy natijalar bir qarashda. */
function StatsCard() {
  const { xp, level } = useTotalXp();
  const { streak } = useStreak();
  const all = useAllResults();
  const steps = Object.values(all).reduce((n, r) => n + Object.keys(r ?? {}).length, 0);
  const ariza = useSyncExternalStore(noSubscribe, readArizaDone, () => null);
  const items: [string, string][] = [
    ["XP", `${xp}`],
    ["Seriya", `${streak} kun`],
    ["Bajarilgan bosqichlar", `${steps}`],
    ["Ariza mashqlari", `${ariza ?? 0} / ${ARIZA_TASKS.length}`],
  ];
  return (
    <GlassCard className="hidden flex-col gap-4 lg:flex">
      <div className="flex items-center justify-between">
        <p className="font-bold">Natijalarim</p>
        <span className="text-sm font-semibold text-accent">{level}-daraja</span>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {items.map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-black/[0.04] px-4 py-3 dark:bg-white/[0.04]">
            <dt className="text-xs text-soft">{k}</dt>
            <dd className="text-2xl font-bold tracking-tight">{v}</dd>
          </div>
        ))}
      </dl>
      <Link href="/profil/konikmalar" className="text-sm font-semibold text-accent">Ko&apos;nikmalar bo&apos;yicha batafsil</Link>
    </GlassCard>
  );
}

function NavRow({ href, Icon, label, hint }: { href: string; Icon: LucideIcon; label: string; hint?: string }) {
  return (
    <Link href={href} className="glass flex min-h-[56px] items-center gap-3 rounded-2xl px-4">
      <Icon size={20} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-accent" />
      <span className="flex-1 font-medium">{label}</span>
      {hint && <span className="text-xs text-soft">{hint}</span>}
      <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-soft" />
    </Link>
  );
}

export function SettingsView() {
  const me = useMe();
  const { clear } = useProfile();
  return (
    <div className="flex flex-col gap-3">
      <BackTitle title="Sozlamalar" />
      <GlassCard className="flex flex-col gap-3">
        <h3 className="font-semibold">Til va yozuv</h3>
        <LanguageSelect />
      </GlassCard>
      <GlassCard className="flex flex-col gap-3">
        <h3 className="font-semibold">Mavzu</h3>
        <ThemeToggle />
      </GlassCard>
      {me.status === "authed" && (me.role === "student" || me.role === "individual") && <DeleteAccount />}
      {me.status !== "authed" && (
        <button type="button" onClick={clear} className="min-h-[44px] self-center px-4 text-sm text-soft underline">
          Qurilmadagi profilni tozalash
        </button>
      )}
    </div>
  );
}

function BackTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Link href="/profil" aria-label="Profilga qaytish" className="glass grid h-11 w-11 place-items-center rounded-full">
        <ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" />
      </Link>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}

function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const run = () =>
    start(async () => {
      const r = await deleteAccount();
      if (!r.ok) return setMsg(r.error);
      clearLocalAfterSignOut();
      router.replace("/kirish");
    });
  return (
    <GlassCard className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 font-semibold text-warn">
        <Trash2 size={18} strokeWidth={1.75} aria-hidden="true" /> Hisobni o&apos;chirish
      </h3>
      <p className="text-sm text-soft">Hisob, ballar va rozilik yozuvlari butunlay o&apos;chadi. Buni qaytarib bo&apos;lmaydi.</p>
      {msg && <p role="alert" className="text-sm text-warn">{msg}</p>}
      {open ? (
        <div className="flex gap-2">
          <button type="button" disabled={pending} onClick={run} className="min-h-[48px] rounded-2xl bg-warn px-5 text-sm font-semibold text-white disabled:opacity-50">
            Ha, o&apos;chirish
          </button>
          <button type="button" onClick={() => setOpen(false)} className="glass min-h-[48px] rounded-2xl px-4 text-sm">Bekor qilish</button>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="glass min-h-[48px] self-start rounded-2xl px-5 text-sm font-semibold">
          Hisobni o&apos;chirish
        </button>
      )}
    </GlassCard>
  );
}

export function EditProfileView() {
  const me = useMe();
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [contact, setContact] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const authed = me.status === "authed";
  const isStudent = authed && me.role === "student";

  useEffect(() => {
    if (!isStudent) return;
    void myNominations().then((r) => r.ok && setContact((c) => c ?? r.contact));
  }, [isStudent]);

  if (me.status === "loading") return <BackTitle title="Profilni tahrirlash" />;
  if (!authed) {
    return (
      <div className="flex flex-col gap-4">
        <BackTitle title="Profilni tahrirlash" />
        <GlassCard className="flex flex-col gap-3">
          <p className="text-sm">Profilni tahrirlash uchun avval tizimga kiring.</p>
          <GlassButton href="/kirish">Kirish</GlassButton>
        </GlassCard>
      </div>
    );
  }
  const nameVal = name ?? me.fullName ?? "";
  const save = () =>
    start(async () => {
      const r = await updateAccount(nameVal, isStudent ? (contact ?? "") : undefined);
      if (!r.ok) return setMsg({ ok: false, text: r.error });
      await refreshMe();
      setMsg({ ok: true, text: "Saqlandi" });
    });

  return (
    <div className="flex flex-col gap-4">
      <BackTitle title="Profilni tahrirlash" />
      <GlassCard strong className="flex flex-col gap-3">
        <label htmlFor="fullName" className="text-sm font-semibold">Ism va familiya</label>
        <input id="fullName" className={field} value={nameVal} maxLength={100} onChange={(e) => setName(e.target.value)} />
        <p className="text-sm text-soft">Kirish: {me.login}</p>
        {isStudent && (
          <>
            <label htmlFor="contact2" className="text-sm font-semibold">Aloqa (telefon yoki Telegram)</label>
            <input id="contact2" className={field} value={contact ?? ""} maxLength={100} onChange={(e) => setContact(e.target.value)} placeholder="+998 ..." />
            <p className="text-xs text-soft">Faqat taklifni qabul qilganingizdan keyin tashkilotga ko&apos;rinadi.</p>
          </>
        )}
        {msg && <p role="status" className={`text-sm ${msg.ok ? "text-success" : "text-warn"}`}>{msg.text}</p>}
        <button type="button" disabled={pending || nameVal.trim().length < 2} onClick={save} className={primary}>Saqlash</button>
      </GlassCard>
      {(me.role === "student" || me.role === "individual") && (
        <>
          <NavRow href="/boshlash" Icon={Pencil} label="Yo'nalish va qiziqishlar" />
          <ChangePassword />
        </>
      )}
      <button type="button" onClick={() => router.push("/profil")} className="min-h-[44px] self-center px-4 text-sm text-soft underline">Orqaga</button>
    </div>
  );
}

export function InterestsView() {
  const { profile, save } = useProfile();
  const me = useMe();
  if (!profile) {
    return (
      <div className="flex flex-col gap-4">
        <BackTitle title="Qiziqishlar" />
        <GlassCard className="flex flex-col gap-3">
          <p className="text-sm">Avval yo&apos;nalishingizni tanlang, keyin qiziqishlarni belgilaysiz.</p>
          <GlassButton href="/boshlash">Yo&apos;nalish tanlash</GlassButton>
        </GlassCard>
      </div>
    );
  }
  const toggle = (id: string) => {
    const has = profile.interests.includes(id);
    if (has && profile.interests.length === 1) return; // kamida bitta soha qoladi
    const next = { ...profile, interests: has ? profile.interests.filter((x) => x !== id) : [...profile.interests, id] };
    save(next);
    if (me.status === "authed" && (me.role === "student" || me.role === "individual")) void saveMyProfile(next);
  };
  return (
    <div className="flex flex-col gap-4">
      <BackTitle title="Qiziqishlar" />
      <p className="text-sm text-soft">Bosib tanlang yoki olib tashlang. Vaziyatlar shu sohalardan tavsiya qilinadi. Kamida bitta soha qoladi.</p>
      <ul className="flex flex-col gap-2">
        {AREAS.map((a) => {
          const on = profile.interests.includes(a.id);
          return (
            <li key={a.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(a.id)}
                className="glass flex min-h-[60px] w-full items-center gap-3 rounded-2xl px-3 text-left active:scale-[0.99]"
              >
                <Icon3D name={a.icon} size={36} />
                <span className="flex-1 font-medium">{a.title}</span>
                <SelectMark on={on} shape="square" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const SKILL_BY_TYPE: Record<string, string> = {
  "client-chat": "Faktlarni aniqlash",
  "document-pick": "Hujjat yig'ish",
  form: "Ariza yozish",
  draft: "Ariza yozish",
  "authority-pick": "Organni tanlash",
  "deadline-pick": "Muddatlar",
  "doc-review": "Xatoni topish",
};
const SKILL_ORDER = ["Faktlarni aniqlash", "Hujjat yig'ish", "Ariza yozish", "Organni tanlash", "Muddatlar", "Xatoni topish"];

export function SkillsView({ stepTypes }: { stepTypes: Record<string, string> }) {
  const results = useAllResults();
  // Ko'nikma darajasi = shu turdagi bajarilgan bosqichlarda olingan ball / maksimal ball
  const sums: Record<string, { got: number; max: number; n: number }> = {};
  for (const [sid, steps] of Object.entries(results)) {
    for (const [stepId, r] of Object.entries(steps)) {
      const skill = SKILL_BY_TYPE[stepTypes[`${sid}/${stepId}`]];
      if (!skill || !r.graded || r.max <= 0) continue;
      const cur = (sums[skill] ??= { got: 0, max: 0, n: 0 });
      cur.got += r.score;
      cur.max += r.max;
      cur.n += 1;
    }
  }
  const total = Object.values(sums).reduce((n, v) => n + v.n, 0);
  return (
    <div className="flex flex-col gap-4">
      <BackTitle title="Ko'nikmalar" />
      <GlassCard className="flex flex-col gap-3">
        {SKILL_ORDER.map((s) => {
          const v = sums[s];
          const pct = v ? Math.round((v.got / v.max) * 100) : 0;
          return (
            <div key={s}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{s}</span>
                <span className="text-soft">{v ? `${pct}% · ${v.n} ta bosqich` : "hali mashq yo'q"}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10" role="progressbar" aria-label={s} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        <p className="text-xs text-soft">
          {total === 0
            ? "Vaziyatlarda bosqichlarni bajaring, shunda ko'nikma darajalari shu yerda ko'rinadi."
            : "Daraja shu turdagi bosqichlarda olgan ballingizning ulushi."}
        </p>
      </GlassCard>
    </div>
  );
}

export default function ProfileClient() {
  const plan = usePlan();
  const { profile, clear } = useProfile();
  const { xp, level } = useTotalXp();
  const me = useMe();
  const [pending, start] = useTransition();
  const track = profile ? trackById(profile.trackId) : undefined;
  const authed = me.status === "authed";
  const learner = authed && (me.role === "student" || me.role === "individual");

  const logout = () =>
    start(async () => {
      await signOut();
      clearLocalAfterSignOut();
    });

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
      <h1 className="text-2xl font-bold lg:col-span-2">Profil</h1>

      {/* Kompyuterda chap ustun: hisob va yo'nalish */}
      <div className="flex flex-col gap-4">
      {authed ? (
        <GlassCard strong className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-lg font-bold text-[var(--accent-contrast)]"
          >
            {(me.fullName ?? me.login ?? "?").trim().charAt(0).toUpperCase()}
          </span>
          <div className="flex-1">
            <p className="font-bold">{me.fullName ?? me.login}</p>
            <p className="text-sm text-soft">
              {[ROLE_LABEL[me.role], me.universityName ?? me.organizationName].filter(Boolean).join(" · ")}
            </p>
          </div>
          <Link href="/profil/tahrir" aria-label="Profilni tahrirlash" className="glass grid h-11 w-11 shrink-0 place-items-center rounded-full">
            <Pencil size={18} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </GlassCard>
      ) : me.status === "loading" ? null : (
        <GlassCard className="flex flex-col gap-3">
          <p className="text-sm">
            Universitet bergan login bilan kiring yoki ro&apos;yxatdan o&apos;ting. Kirsangiz natijangiz saqlanadi va boshqa qurilmada ham ochiladi.
          </p>
          <GlassButton href="/kirish">Kirish</GlassButton>
        </GlassCard>
      )}

      {authed && me.mustChangePassword && <ChangePassword />}
      {authed && me.role === "student" && <Offers />}

      {learner && profile === null && (
        <GlassCard className="flex flex-col gap-3">
          <p className="text-sm">Yo&apos;nalishingizni tanlang, shunda mashqlar sizga moslanadi.</p>
          <GlassButton href="/boshlash">Yo&apos;nalish tanlash</GlassButton>
        </GlassCard>
      )}
      {!authed && me.status !== "loading" && profile === null && (
        <GlassCard className="flex flex-col gap-3">
          <p className="text-sm">Yo&apos;nalishingizni tanlang, shunda mashqlar sizga moslanadi.</p>
          <GlassButton href="/boshlash" variant="secondary">Yo&apos;nalish tanlash</GlassButton>
        </GlassCard>
      )}

      {profile && (!authed || learner) && (
        <>
          <GlassCard strong className="flex items-center gap-3">
            <Icon3D name={track?.icon ?? "profile"} size={56} />
            <div className="flex-1">
              <p className="font-bold">{track?.title}</p>
              <p className="text-sm text-soft">{LEVELS.find((l) => l.id === profile.level)?.title}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{level}-daraja</p>
              <p className="text-xs text-soft">{xp} XP</p>
            </div>
          </GlassCard>
        </>
      )}
      {(!authed || learner) && <StatsCard />}
      </div>

      {/* Kompyuterda o'ng ustun: bo'limlar */}
      <div className="flex flex-col gap-4">
      {authed && me.role !== "student" && me.role !== "individual" ? null : (
        <NavRow href="/profil/konikmalar" Icon={ListChecks} label="Ko'nikmalar" />
      )}
      {(!authed || learner) && (
        <NavRow href="/profil/qiziqishlar" Icon={Target} label="Qiziqishlar" hint={profile ? `${profile.interests.length} ta` : undefined} />
      )}
      <NavRow href="/tariflar" Icon={CreditCard} label="Tariflar" hint={plan ? PLANS[plan].title : undefined} />
      <NavRow href="/profil/sozlamalar" Icon={Settings} label="Sozlamalar" hint="Til, mavzu, hisob" />
      <NavRow href="/maxfiylik" Icon={ShieldCheck} label="Maxfiylik siyosati" />
      <NavRow href="/shartlar" Icon={FileText} label="Foydalanish shartlari" />


      {authed ? (
        <button type="button" disabled={pending} onClick={logout} className="glass min-h-[48px] rounded-2xl px-5 font-semibold">
          Chiqish
        </button>
      ) : (
        profile && (
          <button type="button" onClick={clear} className="min-h-[44px] self-center px-4 text-sm text-soft underline">
            Profilni tozalash
          </button>
        )
      )}
      </div>
    </div>
  );
}
