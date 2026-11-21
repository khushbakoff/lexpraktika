import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & { strong?: boolean };

export default function GlassCard({ strong, className = "", ...rest }: Props) {
  return (
    <div
      {...rest}
      className={`glass ${strong ? "glass-strong" : ""} rounded-3xl p-4 ${className}`}
    />
  );
}
