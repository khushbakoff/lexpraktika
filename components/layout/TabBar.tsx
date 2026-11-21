"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FolderOpen, GraduationCap, Home, User, type LucideIcon } from "lucide-react";
import { useMe } from "@/lib/user/me";

type Tab = { href: string; label: string; Icon: LucideIcon };

const UNIVERSITY_TABS: Tab[] = [
  { href: "/universitet", label: "Talabalar", Icon: GraduationCap },
  { href: "/profil", label: "Profil", Icon: User },
];
const ORG_TABS: Tab[] = [
  { href: "/tashkilot", label: "Nomzodlar", Icon: Briefcase },
  { href: "/profil", label: "Profil", Icon: User },
];

const TABS: Tab[] = [
  { href: "/", label: "Bosh", Icon: Home },
  { href: "/vaziyatlar", label: "Vaziyatlar", Icon: FolderOpen },
  { href: "/profil", label: "Profil", Icon: User },
];

/** Suzuvchi glass pastki bar: 2–3 ta tab (rolga qarab), faol tabda kapsula va kattalashgan ikonka. */
export default function TabBar() {
  const pathname = usePathname();
  const me = useMe();
  const tabs = me.status === "authed" && me.role === "university_admin" ? UNIVERSITY_TABS : me.status === "authed" && me.role === "org_member" ? ORG_TABS : TABS;
  // Yo'nalish tanlashda bar ko'rinmaydi: diqqat bitta vazifada
  if (pathname.startsWith("/boshlash") || pathname.startsWith("/kirish")) return null;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      aria-label="Asosiy navigatsiya"
      className="fixed inset-x-0 z-50 mx-auto lg:hidden w-[calc(100%-32px)] max-w-sm"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
    >
      <ul className="glass glass-strong bar-surface flex h-16 items-center justify-around rounded-[28px] px-2">
        {tabs.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`mx-auto flex min-h-[52px] w-full max-w-[104px] flex-col items-center justify-center gap-1 rounded-2xl transition-colors ${
                  active ? "bg-accent/15 text-accent" : "text-soft"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                <span className={`text-[11px] leading-none ${active ? "font-bold" : "font-medium"}`}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
