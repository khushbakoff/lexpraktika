"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, FileText, FolderOpen, Home, User, Zap } from "lucide-react";
import type { ReactNode } from "react";
import Logo from "@/components/ui/Logo";
import { useStreak } from "@/lib/learning/activity";
import { useTotalXp } from "@/lib/learning/progress";

const LINKS = [
  { href: "/", label: "Bosh", Icon: Home },
  { href: "/vaziyatlar", label: "Vaziyatlar", Icon: FolderOpen },
  { href: "/ariza", label: "Ariza yozish", Icon: FileText },
  { href: "/profil", label: "Profil", Icon: User },
];

function Sidebar() {
  const pathname = usePathname();
  const { streak } = useStreak();
  const { xp, level } = useTotalXp();
  const active = (h: string) => (h === "/" ? pathname === "/" : pathname.startsWith(h));
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col gap-6 border-r border-black/5 bg-white/55 px-4 py-6 backdrop-blur-xl lg:flex dark:border-white/10 dark:bg-black/25">
      <Link href="/" className="flex items-center gap-2.5 px-2 text-lg font-bold tracking-tight">
        <Logo size={36} /> LexPraktika
      </Link>
      <nav aria-label="Asosiy menyu" className="flex flex-col gap-1">
        {LINKS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={`flex min-h-[48px] items-center gap-3 rounded-2xl px-4 text-[15px] font-semibold transition-colors ${active(href) ? "bg-accent/15 text-accent" : "text-soft hover:bg-black/5 hover:text-text dark:hover:bg-white/10"}`}
          >
            <Icon size={21} strokeWidth={active(href) ? 2.25 : 1.75} aria-hidden="true" /> {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2">
        <div className="glass flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold">
          <span className="flex items-center gap-1.5" aria-label={`${streak} kunlik seriya`}>
            <Flame size={18} aria-hidden="true" className={streak > 0 ? "text-warn" : "text-soft"} /> {streak}
          </span>
          <span className="flex items-center gap-1.5" aria-label={`${xp} XP`}>
            <Zap size={18} aria-hidden="true" className="text-accent" /> {xp}
          </span>
          <span className="text-xs font-semibold text-soft">{level}-daraja</span>
        </div>
        <p className="px-2 text-[11px] leading-snug text-soft">Bu o&apos;quv mashqi, yuridik maslahat emas.</p>
      </div>
    </aside>
  );
}

const NARROW = ["/maxfiylik", "/shartlar", "/profil/tahrir", "/profil/sozlamalar", "/profil/qiziqishlar"];

/** Telefonda tor ustun va pastki bar; kompyuterda chap menyu va keng ish maydoni. */
export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = pathname.startsWith("/boshlash") || pathname.startsWith("/kirish");
  // O'qiladigan matn va kichik formalar kompyuterda ham o'rtacha kenglikda qoladi; qolgan sahifalar keng maydonni to'r bilan to'ldiradi.
  const narrow = NARROW.some((p) => pathname.startsWith(p));
  // Ariza ustaxonasi: Word oynasi butun ekranni egallaydi
  const editor = pathname.startsWith("/ariza");
  const width = bare ? "max-w-md" : narrow ? "max-w-md lg:max-w-3xl lg:px-8" : editor ? "max-w-md lg:max-w-[1600px] lg:px-6" : "max-w-md lg:max-w-[1100px] lg:px-8";
  return (
    <>
      {!bare && <Sidebar />}
      <main className={`w-full pt-[calc(env(safe-area-inset-top)+20px)] page-pad ${bare ? "" : editor ? "lg:pl-64 lg:pt-5" : "lg:pl-64 lg:pt-10"}`}>
        <div className={`mx-auto w-full px-4 ${width}`}>{children}</div>
      </main>
    </>
  );
}
