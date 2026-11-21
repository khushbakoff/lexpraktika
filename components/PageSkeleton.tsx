export default function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="glass h-16 animate-pulse rounded-3xl" />
      <div className="glass h-28 animate-pulse rounded-3xl" />
      <div className="glass h-28 animate-pulse rounded-3xl" />
    </div>
  );
}
