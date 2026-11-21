import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

/** Katta, barmoq bilan oson bosiladigan tugma (balandligi 52px). */
export default function GlassButton({ href, children, variant = "primary", className = "" }: Props) {
  const base =
    "flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-5 text-base font-semibold transition-transform active:scale-[0.98]";
  const style =
    variant === "primary"
      ? "bg-accent text-[var(--accent-contrast)] shadow-[0_6px_18px_color-mix(in_srgb,var(--accent)_30%,transparent)]"
      : "glass text-text";
  return (
    <Link href={href} className={`${base} ${style} ${className}`}>
      {children}
    </Link>
  );
}
