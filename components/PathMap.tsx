"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import Icon3D, { type IconName } from "@/components/ui/Icon3D";
import { rememberBack } from "@/lib/back";

export type PathNode = {
  key: string;
  title: string;
  sub: string;
  href: string;
  /** Qulflangan tugun bosilsa boriladigan joy (joriy bosqich) */
  lockHref?: string;
  icon: IconName;
  state: "done" | "current" | "open" | "locked";
};
export type PathItem = PathNode | { key: string; header: string };

const OFFSET = [0, 52, 76, 52, 0, -52, -76, -52];

const lockLabel = (it: PathNode) => `${it.title}${it.state === "locked" ? ", qulflangan: avval oldingisini bajaring" : ""}`;

/** Kompyuter: tugunlar kartochka to'rida (bo'sh joy qolmasin), tartib chapdan o'ngga, yuqoridan pastga. */
function PathGrid({ items, backTo }: { items: PathItem[]; backTo: string }) {
  return (
    <div className="hidden w-full grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3 lg:grid">
      {items.map((it) => {
        if ("header" in it) {
          return (
            <p key={it.key} className="col-span-full mt-2 rounded-2xl bg-accent/12 px-4 py-2 text-xs font-bold uppercase tracking-wide text-accent first:mt-0">
              {it.header}
            </p>
          );
        }
        const current = it.state === "current";
        const ring =
          it.state === "done" ? "border-success bg-success/20" : current ? "border-accent bg-accent/20" : it.state === "open" ? "border-accent/60 bg-white/50 dark:bg-white/10" : "border-soft/40 bg-white/30 dark:bg-white/10";
        return (
          <Link
            key={it.key}
            href={it.state === "locked" ? (it.lockHref ?? it.href) : it.href}
            onClick={() => rememberBack(backTo)}
            aria-label={lockLabel(it)}
            aria-disabled={it.state === "locked" ? "true" : undefined}
            aria-current={current ? "step" : undefined}
            className={`flex min-h-[84px] items-center gap-3 rounded-2xl px-3 py-3 transition-colors ${
              current ? "border border-accent bg-accent/15" : "glass hover:bg-white/80 dark:hover:bg-white/15"
            } ${it.state === "locked" ? "opacity-70" : ""}`}
          >
            <span className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-full border-[3px] ${ring}`}>
              <Icon3D name={it.state === "locked" ? "lock" : it.icon} size={30} />
              {it.state === "done" && (
                <span aria-hidden="true" className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-success text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 block text-sm font-semibold leading-snug">{it.title}</span>
              <span className="mt-0.5 block truncate text-xs text-soft">{it.sub}</span>
            </span>
            {current && (
              <span className="shrink-0 rounded-lg bg-accent px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--accent-contrast)]">Boshlash</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

/** Duolingo uslubidagi yo'l xaritasi: telefonda tugunlar ilon izi bo'ylab, kompyuterda kartochka to'ri. */
export default function PathMap({ items, backTo }: { items: PathItem[]; backTo: string }) {
  const order = items.map((_, i) => items.slice(0, i + 1).filter((x) => !("header" in x)).length - 1);
  return (
    <>
    <PathGrid items={items} backTo={backTo} />
    <div className="flex w-full flex-col items-center overflow-x-clip py-2 lg:hidden">
      {items.map((it, idx) => {
        if ("header" in it) {
          return (
            <p key={it.key} className="my-4 w-full rounded-2xl bg-accent/12 px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-accent">
              {it.header}
            </p>
          );
        }
        const n = order[idx];
        const x = OFFSET[n % OFFSET.length];
        const nx = OFFSET[(n + 1) % OFFSET.length];
        const nextIsNode = items[idx + 1] && !("header" in items[idx + 1]);
        const tone =
          it.state === "done"
            ? "border-success bg-success/20"
            : it.state === "current"
              ? "border-accent bg-accent/20 node-pulse"
              : it.state === "open"
                ? "border-accent/60 bg-white/50 dark:bg-white/10"
                : "border-soft/40 bg-white/30 opacity-70 dark:bg-white/10";
        return (
          <Fragment key={it.key}>
            <div className="flex w-[200px] flex-col items-center" style={{ transform: `translateX(${x}px)` }}>
              {it.state === "current" && (
                <span className="mb-1 rounded-xl bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--accent-contrast)]">
                  Boshlash
                </span>
              )}
              <Link
                href={it.state === "locked" ? (it.lockHref ?? it.href) : it.href}
                onClick={() => rememberBack(backTo)}
                aria-label={lockLabel(it)}
                aria-disabled={it.state === "locked" ? "true" : undefined}
                className={`relative grid h-[84px] w-[84px] place-items-center rounded-full border-[5px] border-b-[9px] transition-transform active:translate-y-1 active:border-b-[5px] ${tone}`}
              >
                <Icon3D name={it.state === "locked" ? "lock" : it.icon} size={44} />
                {it.state === "done" && (
                  <span aria-hidden="true" className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-success text-white">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
              </Link>
              <p className="mt-2 line-clamp-2 max-w-[200px] text-center text-sm font-semibold leading-snug">{it.title}</p>
              <p className="max-w-[200px] text-center text-xs text-soft">{it.sub}</p>
            </div>
            {nextIsNode && (
              <svg aria-hidden="true" width="200" height="56" viewBox="0 0 200 56" className="text-soft/50">
                <path
                  d={`M${100 + x} 4 C${100 + x} 30, ${100 + nx} 26, ${100 + nx} 52`}
                  fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 11"
                />
              </svg>
            )}
          </Fragment>
        );
      })}
    </div>
    </>
  );
}
