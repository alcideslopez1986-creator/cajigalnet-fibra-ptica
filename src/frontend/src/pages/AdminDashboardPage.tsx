import { Avatar } from "@/components/shared/Avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState, NoResults } from "@/components/shared/ErrorState";
import {
  ListSkeleton,
  StatGridSkeleton,
} from "@/components/shared/LoadingSkeletons";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  useBcvRate,
  useCoverage,
  useDashboardMetrics,
  useSearchClients,
} from "@/hooks/useQueries";
import {
  formatBcvRate,
  formatBs,
  formatMegabits,
  formatUsd,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CalendarClock,
  ChevronRight,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

type Tone = "success" | "warning" | "danger" | "primary";

const tileTones: Record<Tone, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/18 text-warning",
  danger: "bg-destructive/15 text-destructive",
  primary: "bg-primary/15 text-accent",
};

const tileGlow: Record<Tone, string> = {
  success: "from-success/12",
  warning: "from-warning/12",
  danger: "from-destructive/12",
  primary: "from-primary/14",
};

/** Administrator dashboard: KPI board, BCV rate and client search. */
export function AdminDashboardPage() {
  const navigate = useNavigate();
  const metrics = useDashboardMetrics();
  const bcv = useBcvRate();
  const coverage = useCoverage();

  const [term, setTerm] = useState("");
  const search = useSearchClients(term);
  const trimmed = term.trim();

  const coverageNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of coverage.data ?? []) {
      map.set(entry.id.toString(), entry.name);
    }
    return map;
  }, [coverage.data]);

  const data = metrics.data;
  const tiles: {
    label: string;
    value: string;
    hint: string;
    icon: typeof Users;
    tone: Tone;
    to: "/admin/clients" | "/admin/payments";
  }[] = [
    {
      label: "Clientes activos",
      value: data ? data.activeClients.toString() : "—",
      hint: "Servicio en línea",
      icon: Users,
      tone: "success",
      to: "/admin/clients",
    },
    {
      label: "Por vencer / mora",
      value: data ? data.dueSoonClients.toString() : "—",
      hint: "Cobro próximo",
      icon: CalendarClock,
      tone: "warning",
      to: "/admin/clients",
    },
    {
      label: "Suspendidos",
      value: data ? data.suspendedClients.toString() : "—",
      hint: "Servicio cortado",
      icon: Ban,
      tone: "danger",
      to: "/admin/clients",
    },
    {
      label: "Pagos por validar",
      value: data ? data.pendingPayments.toString() : "—",
      hint: "Reportes recibidos",
      icon: AlertTriangle,
      tone: "primary",
      to: "/admin/payments",
    },
  ];

  const results = search.data ?? [];

  return (
    <div data-ocid="admin_dashboard.page" className="space-y-7">
      <section aria-labelledby="dashboard-kpis">
        <SectionTitle
          title="Resumen del mes"
          action={
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Cajigalnet
            </span>
          }
        />
        {metrics.isError ? (
          <ErrorState onRetry={() => void metrics.refetch()} />
        ) : metrics.isLoading ? (
          <StatGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {tiles.map((tile, index) => (
              <button
                key={tile.label}
                type="button"
                data-ocid={`dashboard.stat.${index + 1}`}
                onClick={() => void navigate({ to: tile.to })}
                className="group text-left"
              >
                <ReliefCard
                  interactive
                  className="relative overflow-hidden p-4"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b to-transparent opacity-70",
                      tileGlow[tile.tone],
                    )}
                  />
                  <div className="relative flex items-start justify-between">
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-xl",
                        tileTones[tile.tone],
                      )}
                    >
                      <tile.icon className="size-4" aria-hidden="true" />
                    </span>
                    <ChevronRight
                      className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="relative mt-3 font-display text-[26px] font-bold leading-none text-foreground tabular-nums">
                    {tile.value}
                  </p>
                  <p className="relative mt-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {tile.label}
                  </p>
                  <p className="relative mt-0.5 text-[11px] text-muted-foreground/80">
                    {tile.hint}
                  </p>
                </ReliefCard>
              </button>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="dashboard-income">
        <SectionTitle title="Ingresos del mes" />
        <ReliefCard className="relative overflow-hidden p-5">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-primary/20 blur-2xl"
          />
          <div className="relative flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-4 text-accent" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
              Cobrado y validado
            </p>
          </div>
          <div className="relative mt-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-[30px] font-bold leading-none text-foreground tabular-nums">
                {data ? formatUsd(data.monthlyIncomeUsd) : "—"}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {data ? formatBs(data.monthlyIncomeBs) : "—"} al BCV
              </p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-success/15 text-success">
              <Wallet className="size-5" aria-hidden="true" />
            </span>
          </div>
        </ReliefCard>
      </section>

      <section aria-labelledby="dashboard-bcv">
        <SectionTitle title="Tasa BCV" />
        <ReliefCard className="p-5">
          {bcv.isLoading ? (
            <div
              data-ocid="bcv.loading_state"
              className="h-14 animate-pulse rounded-xl bg-muted"
            />
          ) : !bcv.data ? (
            <p
              data-ocid="bcv.empty_state"
              className="text-sm text-muted-foreground"
            >
              La tasa BCV aún no está configurada.
            </p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-2xl font-bold text-foreground tabular-nums">
                  {formatBcvRate(bcv.data.value)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Valor del {bcv.data.valueDate}
                </p>
              </div>
              <span
                data-ocid="bcv.source_badge"
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
                  bcv.data.manual
                    ? "bg-warning/18 text-warning"
                    : "bg-success/15 text-success",
                )}
              >
                <RefreshCw className="size-3" aria-hidden="true" />
                {bcv.data.manual ? "Manual" : "Automática"}
              </span>
            </div>
          )}
        </ReliefCard>
      </section>

      <section aria-labelledby="dashboard-search">
        <SectionTitle title="Buscar cliente" />
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            data-ocid="dashboard.search_input"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Nombre, cédula, pueblo o sector"
            aria-label="Buscar cliente por nombre, cédula, pueblo o sector"
            className="h-12 rounded-2xl border-border/70 bg-card pl-10 text-[15px]"
          />
        </div>

        <div className="mt-3">
          {trimmed.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Encuentra a cualquier cliente"
              description="Escribe un nombre, cédula, pueblo o sector para ver su estado y abrir su gestión."
            />
          ) : search.isError ? (
            <ErrorState onRetry={() => void search.refetch()} />
          ) : search.isLoading ? (
            <ListSkeleton rows={3} />
          ) : results.length === 0 ? (
            <NoResults message={`Sin resultados para “${trimmed}”.`} />
          ) : (
            <ul data-ocid="dashboard.search_list" className="space-y-2.5">
              {results.map((client, index) => {
                const town = coverageNames.get(client.townId.toString());
                const sector = coverageNames.get(client.sectorId.toString());
                const place = [town, sector].filter(Boolean).join(" · ");
                return (
                  <li key={client.id.toString()}>
                    <button
                      type="button"
                      data-ocid={`dashboard.search_result.${index + 1}`}
                      onClick={() =>
                        void navigate({
                          to: "/admin/clients",
                          search: { q: client.cedula },
                        })
                      }
                      className="group flex w-full items-center gap-3 rounded-[22px] border border-border/60 bg-card/70 p-3.5 text-left press-tactile hover:border-primary/40"
                    >
                      <Avatar name={client.fullName} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {client.fullName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          V-{client.cedula} ·{" "}
                          {formatMegabits(client.contractedMegabits)}
                        </p>
                        {place && (
                          <p className="truncate text-[11px] text-muted-foreground/80">
                            {place}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <StatusBadge status={client.status} showDot={false} />
                        <ArrowRight
                          className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
