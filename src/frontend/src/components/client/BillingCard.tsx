import type { ClientView } from "@/backend";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CalendarClock, Wallet } from "lucide-react";

/** Cut-off date and pending balance for the current period. */
export function BillingCard({
  client,
  pendingCents,
  pendingCount,
}: {
  client: ClientView;
  pendingCents: bigint;
  pendingCount: number;
}) {
  const hasDebt = pendingCents > 0n;

  return (
    <section data-ocid="client_home.billing_section">
      <SectionTitle title="Pagos y vencimiento" />
      <div className="grid grid-cols-2 gap-3">
        <ReliefCard className="p-4">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/12 text-accent">
            <CalendarClock className="size-4" aria-hidden="true" />
          </span>
          <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Fecha de corte
          </p>
          <p
            data-ocid="client_home.cutoff_date"
            className="mt-0.5 font-display text-lg font-bold text-foreground"
          >
            Día {client.cutOffDay.toString()}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {client.graceDays.toString()} días de gracia
          </p>
        </ReliefCard>

        <ReliefCard className="p-4">
          <span
            className={cn(
              "grid size-9 place-items-center rounded-xl",
              hasDebt
                ? "bg-warning/18 text-warning"
                : "bg-success/15 text-success",
            )}
          >
            <Wallet className="size-4" aria-hidden="true" />
          </span>
          <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Saldo pendiente
          </p>
          <p
            data-ocid="client_home.pending_balance"
            className={cn(
              "mt-0.5 font-display text-lg font-bold",
              hasDebt ? "text-warning" : "text-success",
            )}
          >
            {formatUsd(pendingCents)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {hasDebt
              ? `${pendingCount} ${pendingCount === 1 ? "pago por confirmar" : "pagos por confirmar"}`
              : "Sin pagos pendientes"}
          </p>
        </ReliefCard>
      </div>
    </section>
  );
}
