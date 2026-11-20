import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SKELETON_IDS = Array.from({ length: 4 }, (_, i) => `skeleton-${i}`);

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-ocid="loading_state"
      className={cn(
        "surface-relief space-y-3 rounded-[22px] border border-border/60 p-5",
        className,
      )}
    >
      <Skeleton className="h-4 w-1/3 bg-muted" />
      <Skeleton className="h-8 w-2/3 bg-muted" />
      <Skeleton className="h-3 w-1/2 bg-muted" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div data-ocid="loading_state" className="space-y-3">
      {SKELETON_IDS.slice(0, rows).map((id) => (
        <div
          key={id}
          className="surface-relief flex items-center gap-3 rounded-[22px] border border-border/60 p-4"
        >
          <Skeleton className="size-11 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5 bg-muted" />
            <Skeleton className="h-3 w-3/5 bg-muted" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function StatGridSkeleton() {
  return (
    <div data-ocid="loading_state" className="grid grid-cols-2 gap-3">
      {SKELETON_IDS.map((id) => (
        <Skeleton key={id} className="h-24 rounded-[22px] bg-muted" />
      ))}
    </div>
  );
}
