export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4 border border-[#d4e8d6] space-y-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}
