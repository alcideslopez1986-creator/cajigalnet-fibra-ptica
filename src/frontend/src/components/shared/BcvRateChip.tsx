import { useBcvRate } from "@/hooks/useQueries";
import { formatBcvRate, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

/** Compact chip showing the current BCV rate used for Bs. conversions. */
export function BcvRateChip({ className }: { className?: string }) {
  const { data, isLoading } = useBcvRate();

  if (isLoading) {
    return (
      <span
        data-ocid="bcv.loading_state"
        className={cn(
          "inline-flex h-7 w-32 animate-pulse items-center rounded-full bg-muted",
          className,
        )}
      />
    );
  }

  if (!data) {
    return (
      <span
        data-ocid="bcv.empty_state"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground",
          className,
        )}
      >
        Tasa BCV no disponible
      </span>
    );
  }

  return (
    <span
      data-ocid="bcv.chip"
      title={`Actualizada el ${formatDate(data.updatedAt)}${data.manual ? " (manual)" : ""}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-3 py-1 font-mono text-[11px] font-semibold text-foreground",
        className,
      )}
    >
      <RefreshCw className="size-3 text-accent" aria-hidden="true" />
      BCV {formatBcvRate(data.value)}
      {data.manual && (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-warning">
          manual
        </span>
      )}
    </span>
  );
}
