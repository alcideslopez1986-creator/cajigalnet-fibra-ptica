import type { BcvRate } from "@/backend";
import { ReliefCard } from "@/components/shared/ReliefCard";
import { formatBcvRate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

/** Current BCV rate with its value date. */
export function BcvRateCard({
  rate,
  isLoading,
}: {
  rate: BcvRate | null | undefined;
  isLoading: boolean;
}) {
  return (
    <ReliefCard data-ocid="client_home.bcv_card" className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/12 text-accent">
            <RefreshCw className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Tasa BCV
            </p>
            {isLoading ? (
              <span
                data-ocid="client_home.bcv_loading_state"
                className="mt-1 block h-5 w-24 animate-pulse rounded-md bg-muted"
              />
            ) : (
              <p
                data-ocid="client_home.bcv_value"
                className="font-mono text-[15px] font-semibold text-foreground"
              >
                {rate ? formatBcvRate(rate.value) : "No disponible"}
              </p>
            )}
          </div>
        </div>
        {rate && !isLoading ? (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Valor del
            </p>
            <p className="font-mono text-[12px] font-semibold text-foreground">
              {rate.valueDate}
            </p>
            <span
              className={cn(
                "mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                rate.manual
                  ? "bg-warning/18 text-warning"
                  : "bg-success/15 text-success",
              )}
            >
              {rate.manual ? "Manual" : "Automática"}
            </span>
          </div>
        ) : null}
      </div>
    </ReliefCard>
  );
}
