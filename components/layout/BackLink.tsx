"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ChevronLeft } from "lucide-react";
import { BACK_LABEL, readBack } from "@/lib/ui/back";

const noop = () => () => {};

/**
 * "Orqaga" havolasi. mode="scenario": vaziyat ro'yxati/Bosh/Ariza/Ish beruvchi dan kirilgan joyga qaytaradi.
 * mode="step": Bosh yoki Ariza dan to'g'ridan-to'g'ri bosqichga kirilgan bo'lsa o'sha joyga, aks holda yo'l xaritasiga.
 */
export default function BackLink({ mode, fallbackHref, fallbackLabel }: { mode: "scenario" | "step"; fallbackHref: string; fallbackLabel: string }) {
  const stored = useSyncExternalStore(noop, readBack, () => null);
  const direct = stored === "/" || stored === "/ariza";
  const useStored = stored && BACK_LABEL[stored] && (mode === "scenario" || direct);
  const href = useStored ? stored : fallbackHref;
  const label = useStored ? BACK_LABEL[stored] : fallbackLabel;
  return (
    <Link href={href} className="-ml-2 flex min-h-[44px] w-fit items-center gap-1 px-2 text-sm text-soft">
      <ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </Link>
  );
}
