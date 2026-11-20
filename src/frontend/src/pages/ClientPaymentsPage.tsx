import {
  type PaymentAccount,
  PaymentMethod,
  type PaymentReport,
  PaymentStatus,
} from "@/backend";
import { PrimaryButton } from "@/components/shared/ActionButtons";
import { BcvRateChip } from "@/components/shared/BcvRateChip";
import { EmptyState } from "@/components/shared/EmptyState";
import { InlineError } from "@/components/shared/ErrorState";
import { Field, TextField } from "@/components/shared/Field";
import { ListSkeleton } from "@/components/shared/LoadingSkeletons";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import { type Tone, ToneBadge } from "@/components/shared/StatusBadge";
import {
  useBcvRate,
  useClient,
  useClientPayments,
  usePaymentAccounts,
  useReportPayment,
} from "@/hooks/useQueries";
import {
  formatBcvRate,
  formatBs,
  formatDate,
  formatDateTime,
  formatPhone,
  formatUsd,
  parseAmountToCents,
} from "@/lib/format";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/labels";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import {
  Building2,
  Check,
  Copy,
  CreditCard,
  Landmark,
  Receipt,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const methodIcon: Record<PaymentMethod, typeof Wallet> = {
  [PaymentMethod.pagoMovil]: Smartphone,
  [PaymentMethod.transferenciaBs]: Landmark,
  [PaymentMethod.zelle]: Building2,
  [PaymentMethod.divisas]: Wallet,
  [PaymentMethod.usdt]: Wallet,
};

const statusTone: Record<PaymentStatus, Tone> = {
  [PaymentStatus.pendiente]: "warning",
  [PaymentStatus.aprobado]: "success",
  [PaymentStatus.rechazado]: "danger",
};

const methodOptions = Object.values(PaymentMethod);

function todayInputValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** Converts a `YYYY-MM-DD` input value into a nanosecond backend timestamp. */
function dateInputToTimestamp(value: string): bigint | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const ms = new Date(`${value}T12:00:00`).getTime();
  if (Number.isNaN(ms)) return null;
  return BigInt(ms) * 1_000_000n;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copiado`);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar. Selecciona el número manualmente.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copiar ${label}`}
      data-ocid="payments.copy_button"
      className="press-tactile grid size-9 shrink-0 place-items-center rounded-xl border border-border/70 bg-background/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? (
        <Check className="size-4 text-success" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}

function AccountCard({
  account,
  amountUsd,
  amountBs,
}: {
  account: PaymentAccount;
  amountUsd: bigint;
  amountBs: bigint | null;
}) {
  const Icon = methodIcon[account.method];

  return (
    <ReliefCard className="p-4" data-ocid="payments.account_card">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-accent">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-foreground">
            {paymentMethodLabel[account.method]}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {account.bank}
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Titular</dt>
          <dd className="min-w-0 truncate text-right font-medium text-foreground">
            {account.holder}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Cédula / RIF</dt>
          <dd className="font-mono text-[13px] font-medium text-foreground">
            {account.documentId}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Teléfono</dt>
          <dd className="font-mono text-[13px] font-medium text-foreground">
            {formatPhone(account.phone)}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Número de cuenta
          </p>
          <p className="truncate font-mono text-[13px] font-semibold text-foreground">
            {account.accountNumber}
          </p>
        </div>
        <CopyButton value={account.accountNumber} label="Número de cuenta" />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 rounded-xl bg-primary/8 px-3 py-2.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Monto a pagar
          </p>
          <p className="font-display text-lg font-bold text-foreground">
            {formatUsd(amountUsd)}
          </p>
        </div>
        <p className="text-right font-mono text-[13px] font-semibold text-accent">
          {amountBs === null ? "Tasa no disponible" : formatBs(amountBs)}
        </p>
      </div>
    </ReliefCard>
  );
}

function PaymentRow({ payment }: { payment: PaymentReport }) {
  return (
    <ReliefCard className="p-4" data-ocid="payments.report_item">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-foreground">
            {paymentMethodLabel[payment.method]}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
            Ref. {payment.reference}
          </p>
        </div>
        <ToneBadge tone={statusTone[payment.status]}>
          {paymentStatusLabel[payment.status]}
        </ToneBadge>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-base font-bold text-foreground">
            {formatUsd(payment.amountUsd)}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {formatBs(payment.amountBs)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">Pagado</p>
          <p className="text-xs font-medium text-foreground">
            {formatDate(payment.paidAt)}
          </p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Reportado el {formatDateTime(payment.createdAt)}
      </p>
    </ReliefCard>
  );
}

export function ClientPaymentsPage() {
  const client = useSession((state) => state.client);
  const clientId = client?.id ?? null;

  const accountsQuery = usePaymentAccounts();
  const rateQuery = useBcvRate();
  const clientQuery = useClient(clientId);
  const paymentsQuery = useClientPayments(clientId);
  const reportPayment = useReportPayment();

  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(todayInputValue);
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.pagoMovil);
  const [accountId, setAccountId] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const rate = rateQuery.data ?? null;
  const amountUsd = clientQuery.data?.monthlyPriceUsd ?? 0n;
  const amountBs =
    rate && amountUsd > 0n ? (amountUsd * rate.value) / 100n : null;

  const activeAccounts = (accountsQuery.data ?? []).filter((a) => a.active);
  const selectedAccountId = accountId || activeAccounts[0]?.id.toString() || "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (clientId === null) {
      setFormError("Inicia sesión para reportar un pago.");
      return;
    }
    const trimmedReference = reference.trim();
    if (trimmedReference.length < 3) {
      setFormError("Escribe la referencia del pago (mínimo 3 caracteres).");
      return;
    }
    const amountCents = parseAmountToCents(amount);
    if (amountCents === null || amountCents <= 0n) {
      setFormError("Indica un monto válido en dólares, por ejemplo 25,00.");
      return;
    }
    const paidAtTs = dateInputToTimestamp(paidAt);
    if (paidAtTs === null) {
      setFormError("Selecciona la fecha en que realizaste el pago.");
      return;
    }
    if (!selectedAccountId) {
      setFormError("Selecciona la cuenta a la que enviaste el pago.");
      return;
    }
    const rateValue = rate?.value ?? 0n;
    const amountBsCents = (amountCents * rateValue) / 100n;

    reportPayment.mutate(
      {
        clientId,
        input: {
          method,
          accountId: BigInt(selectedAccountId),
          reference: trimmedReference,
          amountUsd: amountCents,
          amountBs: amountBsCents,
          paidAt: paidAtTs,
        },
      },
      {
        onSuccess: () => {
          setReference("");
          setAmount("");
          setPaidAt(todayInputValue());
          toast.success("Pago reportado. Queda pendiente por validar.");
        },
        onError: () => {
          setFormError(
            "No pudimos registrar el pago. Revisa los datos e intenta de nuevo.",
          );
        },
      },
    );
  }

  return (
    <div data-ocid="client_payments.page" className="space-y-7">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle title="Reportar pago" className="mb-0" />
        <BcvRateChip />
      </div>

      {/* Receiving accounts */}
      <section>
        <SectionTitle title="Cuentas para pagar" />
        {accountsQuery.isLoading ? (
          <ListSkeleton rows={2} />
        ) : accountsQuery.isError ? (
          <InlineError message="No pudimos cargar las cuentas de pago." />
        ) : activeAccounts.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Sin cuentas activas"
            description="El administrador aún no ha publicado cuentas para recibir pagos. Intenta más tarde."
          />
        ) : (
          <div className="space-y-3">
            {activeAccounts.map((account) => (
              <AccountCard
                key={account.id.toString()}
                account={account}
                amountUsd={amountUsd}
                amountBs={amountBs}
              />
            ))}
          </div>
        )}
      </section>

      {/* BCV rate detail */}
      <ReliefCard className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Tasa BCV aplicada
          </p>
          <p className="mt-1 font-display text-lg font-bold text-foreground">
            {rate ? formatBcvRate(rate.value) : "No disponible"}
          </p>
          <p className="text-xs text-muted-foreground">
            {rate
              ? `Valor del ${rate.valueDate}${rate.manual ? " · manual" : ""}`
              : "El administrador debe cargar la tasa"}
          </p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-accent">
          <Receipt className="size-5" aria-hidden="true" />
        </span>
      </ReliefCard>

      {/* Report form */}
      <section>
        <SectionTitle title="Registrar mi pago" />
        <ReliefCard className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field label="Referencia" htmlFor="payment-reference">
              <TextField
                id="payment-reference"
                data-ocid="payments.reference_input"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej. 004512"
                autoComplete="off"
                maxLength={40}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Monto (USD)" htmlFor="payment-amount">
                <TextField
                  id="payment-amount"
                  data-ocid="payments.amount_input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="25,00"
                  inputMode="decimal"
                  autoComplete="off"
                />
              </Field>
              <Field label="Fecha" htmlFor="payment-date">
                <TextField
                  id="payment-date"
                  data-ocid="payments.date_input"
                  type="date"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  max={todayInputValue()}
                />
              </Field>
            </div>

            <Field label="Método" htmlFor="payment-method">
              <select
                id="payment-method"
                data-ocid="payments.method_select"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="h-12 w-full rounded-xl border border-border bg-background/60 px-4 text-[15px] text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {methodOptions.map((option) => (
                  <option key={option} value={option}>
                    {paymentMethodLabel[option]}
                  </option>
                ))}
              </select>
            </Field>

            {activeAccounts.length > 0 && (
              <Field label="Cuenta destino" htmlFor="payment-account">
                <select
                  id="payment-account"
                  data-ocid="payments.account_select"
                  value={selectedAccountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-background/60 px-4 text-[15px] text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {activeAccounts.map((account) => (
                    <option
                      key={account.id.toString()}
                      value={account.id.toString()}
                    >
                      {paymentMethodLabel[account.method]} · {account.bank} ·{" "}
                      {account.accountNumber}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {formError && <InlineError message={formError} />}

            <PrimaryButton
              type="submit"
              data-ocid="payments.submit_button"
              disabled={reportPayment.isPending}
            >
              {reportPayment.isPending ? "Enviando…" : "Reportar pago"}
            </PrimaryButton>
            <p className="text-center text-xs text-muted-foreground">
              Tu pago quedará en estado{" "}
              <span className="font-semibold text-warning">
                Pendiente por validar
              </span>{" "}
              hasta que el equipo lo confirme.
            </p>
          </form>
        </ReliefCard>
      </section>

      {/* Reported payments */}
      <section>
        <SectionTitle title="Mis pagos reportados" />
        {paymentsQuery.isLoading ? (
          <ListSkeleton rows={3} />
        ) : paymentsQuery.isError ? (
          <InlineError message="No pudimos cargar tus pagos reportados." />
        ) : (paymentsQuery.data ?? []).length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Aún no has reportado pagos"
            description="Cuando envíes un pago, aparecerá aquí con su estado de validación."
          />
        ) : (
          <div className={cn("space-y-3")}>
            {(paymentsQuery.data ?? []).map((payment) => (
              <PaymentRow key={payment.id.toString()} payment={payment} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
