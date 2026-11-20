import type { ClientView } from "@/backend";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import { formatMegabytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Activity, Wifi } from "lucide-react";

/** Period traffic against the contracted plan, with a relief progress meter. */
export function TrafficCard({ client }: { client: ClientView }) {
  const usedMb = client.periodTrafficMb;
  const planMb = client.contractedMegabits * 1024n;
  const rawPercent = planMb > 0n ? (Number(usedMb) / Number(planMb)) * 100 : 0;
  const percent = Math.max(0, Math.min(100, Math.round(rawPercent)));
  const remainingMb = planMb > usedMb ? planMb - usedMb : 0n;
  const tone =
    percent >= 90
      ? "bg-destructive"
      : percent >= 70
        ? "bg-warning"
        : "bg-success";

  return (
    <section data-ocid="client_home.traffic_section">
      <SectionTitle title="Consumo del período" />
      <ReliefCard className="p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Consumido
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">
              {formatMegabytes(usedMb)}
            </p>
          </div>
          <p
            data-ocid="client_home.traffic_percent"
            className="font-mono text-lg font-semibold text-accent"
          >
            {percent}%
          </p>
        </div>

        <div
          aria-label="Porcentaje del plan consumido"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          data-ocid="client_home.traffic_progress"
          className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-background/70 shadow-[inset_0_1px_2px_oklch(0.1_0.05_265/0.6)]"
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500 ease-out",
              tone,
            )}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>0 MB</span>
          <span className="font-mono">{formatMegabytes(planMb)} del plan</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2">
            <Activity
              className="size-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Disponible
              </p>
              <p className="truncate font-mono text-[12px] font-semibold text-foreground">
                {formatMegabytes(remainingMb)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2">
            <Wifi className="size-4 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Estado del enlace
              </p>
              <p className="truncate text-[12px] font-semibold text-muted-foreground">
                No disponible
              </p>
            </div>
          </div>
        </div>
      </ReliefCard>
    </section>
  );
}
