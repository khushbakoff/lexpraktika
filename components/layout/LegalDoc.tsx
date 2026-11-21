import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

/** Maxfiylik va shartlar sahifalari uchun umumiy ko'rinish. */
export default function LegalDoc({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="flex flex-col gap-4">
      <Link href="/profil" className="-ml-2 flex min-h-[44px] w-fit items-center gap-1 px-2 text-sm text-soft">
        <ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" />
        Orqaga
      </Link>
      <header>
        <h1 className="text-2xl font-bold leading-tight">{title}</h1>
        <p className="mt-1 text-xs text-soft">Oxirgi yangilanish: {updated}</p>
      </header>
      <p className="rounded-2xl bg-warn/15 px-4 py-2 text-xs text-warn">
        Bu hujjat namunaviy loyiha matni. Ishga tushirishdan oldin yurist ko&apos;rib chiqishi kerak.
      </p>
      <div className="glass glass-strong flex flex-col gap-4 rounded-3xl p-4 text-sm leading-relaxed [&_h2]:text-base [&_h2]:font-bold [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </article>
  );
}
