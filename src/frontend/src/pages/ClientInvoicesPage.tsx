import type { Invoice, InvoiceStatus, PaymentReport } from "@/backend";
import { BcvRateChip } from "@/components/shared/BcvRateChip";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ListSkeleton } from "@/components/shared/LoadingSkeletons";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import { type Tone, ToneBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClientInvoices, useClientPayments } from "@/hooks/useQueries";
import {
  formatBcvRate,
  formatBs,
  formatDate,
  formatDateTime,
  formatMegabits,
  formatUsd,
} from "@/lib/format";
import { invoiceStatusLabel, paymentMethodLabel } from "@/lib/labels";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  MessageCircle,
  Printer,
  Receipt,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const invoiceTone: Record<InvoiceStatus, Tone> = {
  emitida: "warning",
  pagada: "success",
  anulada: "danger",
};

const approvedPayments = (payments: PaymentReport[]): PaymentReport[] =>
  payments.filter((payment) => payment.status === "aprobado");

/** Client invoices: correlative list, printable detail and approved-payment receipts. */
export function ClientInvoicesPage() {
  const client = useSession((state) => state.client);
  const clientId = client?.id ?? null;

  const invoicesQuery = useClientInvoices(clientId);
  const paymentsQuery = useClientPayments(clientId);

  const [openInvoice, setOpenInvoice] = useState<Invoice | null>(null);
  const [openReceipt, setOpenReceipt] = useState<PaymentReport | null>(null);

  const invoices = useMemo(
    () =>
      [...(invoicesQuery.data ?? [])].sort((a, b) =>
        a.id < b.id ? 1 : a.id > b.id ? -1 : 0,
      ),
    [invoicesQuery.data],
  );

  const receipts = useMemo(
    () =>
      [...approvedPayments(paymentsQuery.data ?? [])].sort((a, b) =>
        a.id < b.id ? 1 : a.id > b.id ? -1 : 0,
      ),
    [paymentsQuery.data],
  );

  const isLoading = invoicesQuery.isLoading || paymentsQuery.isLoading;
  const isError = invoicesQuery.isError || paymentsQuery.isError;

  return (
    <div data-ocid="client_invoices.page" className="space-y-7">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle title="Mis facturas" className="mb-0" />
        <BcvRateChip />
      </div>

      <section aria-labelledby="invoices-heading">
        <h2 id="invoices-heading" className="sr-only">
          Facturas emitidas
        </h2>

        {isLoading ? (
          <ListSkeleton rows={3} />
        ) : isError ? (
          <ErrorState
            onRetry={() => {
              void invoicesQuery.refetch();
              void paymentsQuery.refetch();
            }}
          />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aún no tienes facturas"
            description="Cuando el equipo emita tu primera factura aparecerá aquí con su número correlativo y montos."
          />
        ) : (
          <ul data-ocid="client_invoices.list" className="space-y-3">
            {invoices.map((invoice, index) => (
              <li key={invoice.id.toString()}>
                <button
                  type="button"
                  data-ocid={`client_invoices.item.${index + 1}`}
                  onClick={() => setOpenInvoice(invoice)}
                  className="surface-relief press-tactile flex w-full items-center gap-3 rounded-[22px] border border-border/60 p-4 text-left transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-accent">
                    <Receipt className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-mono text-[13px] font-semibold text-foreground">
                        {invoice.number}
                      </span>
                      <ToneBadge tone={invoiceTone[invoice.status]}>
                        {invoiceStatusLabel[invoice.status]}
                      </ToneBadge>
                    </span>
                    <span className="mt-1 block truncate text-[13px] text-muted-foreground">
                      {invoice.period || formatDate(invoice.issuedAt)} ·{" "}
                      {invoice.planName || "Plan de fibra"}
                    </span>
                    <span className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-[15px] font-bold text-foreground">
                        {formatUsd(invoice.amountUsd)}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {formatBs(invoice.amountBs)}
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="receipts-heading">
        <SectionTitle title="Recibos de pago" />
        <h2 id="receipts-heading" className="sr-only">
          Recibos de pagos aprobados
        </h2>

        {isLoading ? (
          <ListSkeleton rows={2} />
        ) : receipts.length === 0 ? (
          <ReliefCard className="p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Cuando el equipo apruebe un pago verás aquí su recibo de
              confirmación, listo para compartir por WhatsApp.
            </p>
          </ReliefCard>
        ) : (
          <ul data-ocid="client_receipts.list" className="space-y-3">
            {receipts.map((payment, index) => (
              <li key={payment.id.toString()}>
                <button
                  type="button"
                  data-ocid={`client_receipts.item.${index + 1}`}
                  onClick={() => setOpenReceipt(payment)}
                  className="surface-relief press-tactile flex w-full items-center gap-3 rounded-[22px] border border-border/60 p-4 text-left transition-smooth hover:border-success/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-success/15 text-success">
                    <CheckCircle2 className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-foreground">
                      Pago aprobado · {paymentMethodLabel[payment.method]}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
                      Ref. {payment.reference}
                    </span>
                    <span className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-[15px] font-bold text-foreground">
                        {formatUsd(payment.amountUsd)}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {formatBs(payment.amountBs)}
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <InvoiceDialog
        invoice={openInvoice}
        clientName={client?.fullName ?? ""}
        clientCedula={client?.cedula ?? ""}
        onClose={() => setOpenInvoice(null)}
      />

      <ReceiptDialog
        payment={openReceipt}
        clientName={client?.fullName ?? ""}
        clientCedula={client?.cedula ?? ""}
        onClose={() => setOpenReceipt(null)}
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  strong = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/50 py-2.5 last:border-b-0">
      <dt className="shrink-0 text-[12px] text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-words text-right text-[13px] text-foreground",
          mono && "font-mono",
          strong && "font-display text-[15px] font-bold",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function DocumentHeader({
  eyebrow,
  number,
  title,
}: {
  eyebrow: string;
  number: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl bg-gradient-primary px-4 py-4 text-primary-foreground shadow-primary-lift">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">
        {eyebrow}
      </p>
      <p className="mt-1 font-display text-lg font-bold">{title}</p>
      <p className="mt-0.5 font-mono text-[12px] opacity-90">{number}</p>
    </div>
  );
}

function InvoiceDialog({
  invoice,
  clientName,
  clientCedula,
  onClose,
}: {
  invoice: Invoice | null;
  clientName: string;
  clientCedula: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={invoice !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-ocid="client_invoices.detail_modal"
        className="max-h-[90dvh] overflow-y-auto rounded-[22px] border-border bg-card p-5"
      >
        {invoice ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Factura {invoice.number}</DialogTitle>
              <DialogDescription>
                Detalle de la factura con montos en dólares y bolívares.
              </DialogDescription>
            </DialogHeader>

            <div id="invoice-print-area" className="space-y-4">
              <DocumentHeader
                eyebrow="Cajigalnet · Factura"
                number={invoice.number}
                title={invoice.planName || "Servicio de internet"}
              />

              <div className="flex items-center justify-between gap-3">
                <ToneBadge tone={invoiceTone[invoice.status]}>
                  {invoiceStatusLabel[invoice.status]}
                </ToneBadge>
                <span className="text-[12px] text-muted-foreground">
                  Emitida el {formatDate(invoice.issuedAt)}
                </span>
              </div>

              <dl className="rounded-2xl border border-border/60 bg-background/40 px-4 py-1">
                <DetailRow label="Cliente" value={clientName || "—"} />
                <DetailRow label="Cédula" value={clientCedula || "—"} mono />
                <DetailRow
                  label="Período"
                  value={invoice.period || "No especificado"}
                />
                <DetailRow
                  label="Plan"
                  value={`${invoice.planName || "Plan de fibra"} · ${formatMegabits(invoice.contractedMegabits)}`}
                />
                <DetailRow
                  label="Tasa BCV aplicada"
                  value={formatBcvRate(invoice.bcvRate)}
                  mono
                />
              </dl>

              <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Total USD
                  </span>
                  <span className="font-display text-xl font-bold text-foreground">
                    {formatUsd(invoice.amountUsd)}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <span className="text-[12px] text-muted-foreground">
                    Total en bolívares
                  </span>
                  <span className="font-mono text-[13px] font-semibold text-foreground">
                    {formatBs(invoice.amountBs)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                data-ocid="client_invoices.print_button"
                onClick={() => window.print()}
                className="h-11 flex-1 rounded-2xl bg-gradient-primary font-semibold text-primary-foreground shadow-primary-lift press-tactile hover:brightness-110"
              >
                <Printer className="size-4" aria-hidden="true" />
                Imprimir o guardar
              </Button>
              <Button
                type="button"
                variant="outline"
                data-ocid="client_invoices.close_button"
                onClick={onClose}
                className="h-11 flex-1 rounded-2xl border-border bg-card font-semibold press-tactile"
              >
                <X className="size-4" aria-hidden="true" />
                Cerrar
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ReceiptDialog({
  payment,
  clientName,
  clientCedula,
  onClose,
}: {
  payment: PaymentReport | null;
  clientName: string;
  clientCedula: string;
  onClose: () => void;
}) {
  const whatsappHref = payment
    ? `https://wa.me/?text=${encodeURIComponent(
        `Cajigalnet: pago aprobado. Recibo de ${clientName || "cliente"} - USD ${formatUsd(
          payment.amountUsd,
        )} / ${formatBs(payment.amountBs)} (${paymentMethodLabel[payment.method]}). Ref. ${payment.reference}.`,
      )}`
    : "#";

  return (
    <Dialog open={payment !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-ocid="client_receipts.detail_modal"
        className="max-h-[90dvh] overflow-y-auto rounded-[22px] border-border bg-card p-5"
      >
        {payment ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Recibo de pago aprobado</DialogTitle>
              <DialogDescription>
                Recibo de confirmación con montos y tasa aplicada.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <DocumentHeader
                eyebrow="Cajigalnet · Recibo de pago"
                number={`Pago #${payment.id.toString()}`}
                title="Pago aprobado"
              />

              <div className="flex items-center gap-2">
                <ToneBadge tone="success">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Aprobado
                </ToneBadge>
                <span className="text-[12px] text-muted-foreground">
                  {formatDateTime(payment.paidAt)}
                </span>
              </div>

              <dl className="rounded-2xl border border-border/60 bg-background/40 px-4 py-1">
                <DetailRow label="Cliente" value={clientName || "—"} />
                <DetailRow label="Cédula" value={clientCedula || "—"} mono />
                <DetailRow
                  label="Método"
                  value={paymentMethodLabel[payment.method]}
                />
                <DetailRow label="Referencia" value={payment.reference} mono />
                <DetailRow
                  label="Tasa BCV aplicada"
                  value={formatBcvRate(
                    payment.amountUsd > 0n
                      ? (payment.amountBs * 100n) / payment.amountUsd
                      : 0n,
                  )}
                  mono
                />
              </dl>

              <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Monto USD
                  </span>
                  <span className="font-display text-xl font-bold text-foreground">
                    {formatUsd(payment.amountUsd)}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <span className="text-[12px] text-muted-foreground">
                    Monto en bolívares
                  </span>
                  <span className="font-mono text-[13px] font-semibold text-foreground">
                    {formatBs(payment.amountBs)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                asChild
                className="h-11 flex-1 rounded-2xl bg-gradient-primary font-semibold text-primary-foreground shadow-primary-lift press-tactile hover:brightness-110"
              >
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  data-ocid="client_receipts.whatsapp_button"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Compartir por WhatsApp
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                data-ocid="client_receipts.close_button"
                onClick={onClose}
                className="h-11 flex-1 rounded-2xl border-border bg-card font-semibold press-tactile"
              >
                <X className="size-4" aria-hidden="true" />
                Cerrar
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
