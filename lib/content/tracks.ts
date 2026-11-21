import type { IconName } from "@/components/ui/Icon3D";

export type Track = {
  id: string;
  title: string;
  tagline: string;
  icon: IconName;
  /** Shu yo'nalishda odatda qiziqarli sohalar (onboardingda oldindan belgilanadi). */
  areas: string[];
};

export const TRACKS: Track[] = [
  { id: "advokat", title: "Advokat", tagline: "Mijozni himoya qilish, hujjat, sud", icon: "scale", areas: ["mehnat", "fuqarolik", "oila"] },
  { id: "sudya", title: "Sudya", tagline: "Ish materiallarini ko'rish, qaror chiqarish", icon: "judge", areas: ["fuqarolik", "jinoyat"] },
  { id: "huquq-tartibot", title: "Prokuror / tergovchi", tagline: "Qonun ijrosi, tergov, ayblov", icon: "police", areas: ["jinoyat"] },
  { id: "notarius", title: "Notarius", tagline: "Shartnoma, ishonchnoma, guvohlantirish", icon: "memo", areas: ["fuqarolik", "oila"] },
  { id: "korxona", title: "Korxona yuristi", tagline: "Kompaniya uchun shartnoma, mehnat, nizolar", icon: "briefcase", areas: ["mehnat", "tadbirkorlik", "shaxsiy-malumot"] },
  { id: "davlat", title: "Davlat xizmati", tagline: "Adliya, hokimlik, davlat organlari", icon: "court", areas: ["mehnat", "mamuriy", "iste'molchi"] },
  { id: "umumiy", title: "Hali bilmayman", tagline: "Hammasini sinab ko'raman", icon: "rocket", areas: [] },
];

export type Area = { id: string; title: string; icon: IconName };

export const AREAS: Area[] = [
  { id: "mehnat", title: "Mehnat", icon: "briefcase" },
  { id: "fuqarolik", title: "Shartnoma va fuqarolik", icon: "document" },
  { id: "jinoyat", title: "Jinoyat", icon: "police" },
  { id: "tadbirkorlik", title: "Tadbirkorlik va soliq", icon: "money" },
  { id: "oila", title: "Oila", icon: "home" },
  { id: "iste'molchi", title: "Iste'molchi huquqi", icon: "cart" },
  { id: "shaxsiy-malumot", title: "Shaxsiy ma'lumot", icon: "key" },
  { id: "mamuriy", title: "Davlat organlariga murojaat", icon: "court" },
  { id: "kasb", title: "Kasbga kirish va ish jarayoni", icon: "briefcase" },
];

export const LEVELS = [
  { id: "boshlovchi", title: "Yangi boshlovchi", note: "Asoslardan boshlayman" },
  { id: "orta", title: "Nazariyani bilaman", note: "Amaliyot kerak" },
  { id: "ilgor", title: "Tajribam bor", note: "Murakkab holatlar kerak" },
] as const;

export const trackById = (id: string) => TRACKS.find((t) => t.id === id);
export const areaById = (id: string) => AREAS.find((a) => a.id === id);
