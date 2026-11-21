import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PlansCard from "@/components/profile/PlansCard";

export const metadata = { title: "Tariflar · LexPraktika" };

export default function Tariflar() {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/profil" className="-ml-2 flex min-h-[44px] w-fit items-center gap-1 px-2 text-sm text-soft">
        <ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" />
        Profil
      </Link>
      <PlansCard />
    </div>
  );
}
