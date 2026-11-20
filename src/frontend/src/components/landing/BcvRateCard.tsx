import { useBcvRate } from "@/hooks/useQueries";
import { formatBcvRate, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CalendarClock, TrendingUp } from "lucide-react";

/** BCV rate card with its value date, used on the public landing. */
export function BcvRateCard({ className }: { className?: string }) {
  const { data, isLoading } = useBcvRate();

  return (
    <div
      data-ocid="landing.bcv_card"
      className={cn(
        "surface-relief flex items-center gap-3 rounded-[22px] border border-border/60 p-4",
        className,
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-accent">
        <TrendingUp className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Tasa BCV del día
        </p>
        {isLoading ? (
          <span
            data-ocid="landing.bcv_loading_state"
            className="mt-1.5 block h-6 w-28 animate-pulse rounded bg-muted"
          />
        ) : data ? (
          <p className="mt-0.5 font-mono text-lg font-bold tabular-nums text-foreground">
            {formatBcvRate(data.value)}
            <span className="ml-1 text-[11px] font-semibold text-muted-foreground">
              / USD
            </span>
          </p>
        ) : (
          <p
            data-ocid="landing.bcv_empty_state"
            className="mt-1 text-sm font-semibold text-muted-foreground"
          >
            Tasa no disponible
          </p>
        )}
      </div>
      {data ? (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
          <CalendarClock className="size-3" aria-hidden="true" />
          {formatDate(data.updatedAt)}
        </span>
      ) : null}
    </div>
  );
}
