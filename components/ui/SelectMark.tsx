import { Check } from "lucide-react";

/** Tanlash belgisi: tanlanmagan bo'sh doira, tanlangan to'liq rangli va ichida galochka. */
export default function SelectMark({ on, shape = "circle" }: { on: boolean; shape?: "circle" | "square" }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-6 w-6 shrink-0 place-items-center border-2 transition-colors ${
        shape === "circle" ? "rounded-full" : "rounded-md"
      } ${on ? "border-accent bg-accent text-[var(--accent-contrast)]" : "border-soft/50"}`}
    >
      {on && <Check size={14} strokeWidth={3} />}
    </span>
  );
}
