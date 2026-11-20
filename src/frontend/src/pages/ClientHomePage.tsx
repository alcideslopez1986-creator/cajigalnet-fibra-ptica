import { PaymentStatus } from "@/backend";
import { AccountHero } from "@/components/client/AccountHero";
import { BcvRateCard } from "@/components/client/BcvRateCard";
import { BillingCard } from "@/components/client/BillingCard";
import { NoticesList } from "@/components/client/NoticesList";
import { TrafficCard } from "@/components/client/TrafficCard";
import { CardSkeleton } from "@/components/shared/LoadingSkeletons";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import {
  useBcvRate,
  useClient,
  useClientNotices,
  useClientPayments,
  useCoverage,
} from "@/hooks/useQueries";
import { useSession } from "@/lib/session";
import { Link } from "@tanstack/react-router";
import { CreditCard, FileText, LifeBuoy } from "lucide-react";

const shortcuts = [
  {
    to: "/app/payments",
    label: "Reportar un pago",
    icon: CreditCard,
    ocid: "client_home.payments_link",
  },
  {
    to: "/app/invoices",
    label: "Ver mis facturas",
    icon: FileText,
    ocid: "client_home.invoices_link",
  },
  {
    to: "/app/support",
    label: "Reportar una falla",
    icon: LifeBuoy,
    ocid: "client_home.support_link",
  },
] as const;

/** Client account summary: plan, status, traffic, balance, notices and BCV rate. */
export function ClientHomePage() {
  const sessionClient = useSession((state) => state.client);
  const clientId = sessionClient?.id ?? null;

  const clientQuery = useClient(clientId);
  const noticesQuery = useClientNotices(clientId);
  const paymentsQuery = useClientPayments(clientId);
  const coverageQuery = useCoverage();
  const bcvQuery = useBcvRate();

  const client = clientQuery.data ?? sessionClient;
  const coverage = coverageQuery.data ?? [];

  const nameOf = (id: bigint | undefined) =>
    id === undefined
      ? null
      : (coverage.find((entry) => entry.id === id)?.name ?? null);

  const location = client
    ? [nameOf(client.sectorId), nameOf(client.townId), nameOf(client.parishId)]
        .filter((part): part is string => Boolean(part))
        .join(", ")
    : "";

  const pendingPayments = (paymentsQuery.data ?? []).filter(
    (payment) => payment.status === PaymentStatus.pendiente,
  );
  const pendingCents = pendingPayments.reduce(
    (total, payment) => total + payment.amountUsd,
    0n,
  );

  return (
    <div data-ocid="client_home.page" className="space-y-6">
      {client ? (
        <AccountHero
          client={client}
          location={location || "Ubicación no registrada"}
        />
      ) : clientQuery.isLoading ? (
        <CardSkeleton />
      ) : null}

      {client ? <TrafficCard client={client} /> : null}

      {client ? (
        <BillingCard
          client={client}
          pendingCents={pendingCents}
          pendingCount={pendingPayments.length}
        />
      ) : null}

      <BcvRateCard rate={bcvQuery.data} isLoading={bcvQuery.isLoading} />

      <NoticesList notices={noticesQuery.data ?? []} />

      <section>
        <SectionTitle title="Accesos rápidos" />
        <div className="space-y-3">
          {shortcuts.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={item.ocid}
              className="surface-relief press-tactile flex items-center gap-3 rounded-[22px] border border-border/60 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-accent">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="text-[15px] font-semibold text-foreground">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {client ? (
        <ReliefCard className="p-4">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Los datos de consumo y estado del enlace se actualizan cuando el
            administrador los registra en el sistema.
          </p>
        </ReliefCard>
      ) : null}
    </div>
  );
}
