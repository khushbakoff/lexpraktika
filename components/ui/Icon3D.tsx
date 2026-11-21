import Image from "next/image";

export type IconName =
  | "home" | "folder" | "scale" | "profile" | "document" | "lock"
  | "check" | "clock" | "shield" | "chat" | "court" | "briefcase"
  | "target" | "trophy" | "fire" | "star" | "rocket" | "money" | "cart" | "police" | "memo" | "judge" | "key";

type Props = { name: IconName; size?: number; label?: string; className?: string };

/** Realistik 3D ikonka (Microsoft Fluent Emoji 3D, MIT). Dekorativ bo'lsa label bermang. */
export default function Icon3D({ name, size = 40, label, className }: Props) {
  return (
    <Image
      src={`/icons/${name}.png`}
      width={size}
      height={size}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      className={className}
      draggable={false}
    />
  );
}
