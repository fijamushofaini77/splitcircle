export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-[var(--rose-100)]/60 ${className}`} />
  );
}

export function SkeletonGroupList() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-3 py-2.5 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonExpenseList() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3.5">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
