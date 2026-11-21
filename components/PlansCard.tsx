"use client";

import { Check } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/plans";
import { usePlan } from "@/lib/plan-client";
import GlassCard from "@/components/ui/GlassCard";

/** Tashkilot tariflari (biznes model hujjati, B2). Faqat ko'rsatish uchun: to'lov va limitlar PLANS da. */
const ORG_PLANS = [
  {
    title: "Universitet",
    price: "180 000 so'm",
    note: "talaba boshiga, yiliga (kamida 200 o'rindiq)",
    features: ["Talabalarga Pro imkoniyatlari", "Guruh natijalari va zaif mavzular", "Natijalarni eksport qilish", "Yaxshi talabani ish beruvchiga tavsiya qilish"],
  },
  {
    title: "Ish beruvchi",
    price: "1 000 000 so'm",
    note: "oyiga: advokatlik firmasi, bank, davlat organi",
    features: ["Rozilik bergan nomzodlar ro'yxati", "Nomzodning ko'nikma profili", "Nomzodga taklif yuborish"],
  },
];

/** Tariflar ro'yxati. To'lov hali ulanmagan: Pro demo hisoblarda yoqilgan. */
export default function PlansCard() {
  const current = usePlan();
  return (
    <section className="flex flex-col gap-3" aria-labelledby="plans-title">
      <h2 id="plans-title" className="text-lg font-bold">
        Tariflar
      </h2>
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-4">
      {(Object.keys(PLANS) as PlanId[]).map((id) => {
        const p = PLANS[id];
        const active = current === id;
        return (
          <GlassCard key={id} strong={id === "pro"} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">{p.title}</p>
                <p className="text-xs text-soft">{p.note}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{p.price}</p>
                {active && (
                  <span className="mt-1 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-[var(--accent-contrast)]">
                    Sizning tarifingiz
                  </span>
                )}
              </div>
            </div>
            <ul className="flex flex-col gap-1 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </GlassCard>
        );
      })}
      </div>

      <h2 className="mt-3 text-lg font-bold">Tashkilotlar uchun</h2>
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-4">
        {ORG_PLANS.map((p) => (
          <GlassCard key={p.title} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">{p.title}</p>
                <p className="text-xs text-soft">{p.note}</p>
              </div>
              <p className="text-right font-bold">{p.price}</p>
            </div>
            <ul className="flex flex-col gap-1 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>
      <p className="text-xs text-soft">Narx va limitlar namunaviy, pilotda aniqlashtiriladi. To&apos;lov tizimi keyingi bosqichda ulanadi.</p>
    </section>
  );
}
