import Image from "next/image";

/** LexPraktika logotipi: L va P harflari birlashgan monogram. */
export default function Logo({ size = 48, className }: { size?: number; className?: string }) {
  return <Image src="/logo.svg" width={size} height={size} alt="LexPraktika logotipi" className={className} priority />;
}
