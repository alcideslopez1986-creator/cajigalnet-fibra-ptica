import type { ClientView } from "@/backend";
import { ReliefCard } from "@/components/shared/ReliefCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatMegabits, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Gauge, MapPin } from "lucide-react";

/** Identity + plan + service status headline for the client account. */
export function AccountHero({
  client,
  location,
}: {
  client: ClientView;
  location: string;
}) {
  return (
    <ReliefCard
      data-ocid="client_home.hero_card"
      className="relative overflow-hidden p-5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-gradient-glow opacity-80"
      />
      <div className="relative flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-primary font-display text-base font-bold text-primary-foreground shadow-primary-lift"
        >
          {initials(client.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Cuenta de servicio
          </p>
          <h1 className="mt-0.5 truncate font-display text-xl font-bold text-foreground">
            {client.fullName}
          </h1>
          <p className="mt-0.5 font-mono text-[12px] text-muted-foreground">
            {client.cedula} · @{client.username}
          </p>
        </div>
        <StatusBadge status={client.status} className="shrink-0" />
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-border/60 bg-background/40 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Gauge className="size-3 text-accent" aria-hidden="true" />
            Plan contratado
          </p>
          <p className="mt-1 truncate text-[15px] font-semibold text-foreground">
            {client.planName}
          </p>
          <p className="font-mono text-[12px] text-accent">
            {formatMegabits(client.contractedMegabits)}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/40 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <MapPin className="size-3 text-accent" aria-hidden="true" />
            Ubicación
          </p>
          <p
            className={cn(
              "mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-foreground",
            )}
          >
            {location}
          </p>
        </div>
      </div>
    </ReliefCard>
  );
}
