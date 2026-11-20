import {
  type PaymentAccount,
  type PaymentAccountInput,
  PaymentMethod,
  type PaymentReceipt,
  type PaymentReport,
} from "@/backend";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/shared/ActionButtons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState, InlineError } from "@/components/shared/ErrorState";
import { Field, TextField } from "@/components/shared/Field";
import { ListSkeleton } from "@/components/shared/LoadingSkeletons";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import { type Tone, ToneBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useApprovePayment,
  useCreatePaymentAccount,
  usePaymentAccounts,
  usePendingPayments,
  useRejectPayment,
  useSetPaymentAccountActive,
  useUpdatePaymentAccount,
} from "@/hooks/useQueries";
import { formatBs, formatDate, formatPhone, formatUsd } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Banknote,
  Check,
  Landmark,
  Pencil,
  Plus,
  Receipt,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const methodOrder: PaymentMethod[] = [
  PaymentMethod.pagoMovil,
  PaymentMethod.transferenciaBs,
  PaymentMethod.divisas,
  PaymentMethod.zelle,
  PaymentMethod.usdt,
];

const methodTone: Record<PaymentMethod, Tone> = {
  [PaymentMethod.pagoMovil]: "primary",
  [PaymentMethod.transferenciaBs]: "primary",
  [PaymentMethod.divisas]: "success",
  [PaymentMethod.zelle]: "success",
  [PaymentMethod.usdt]: "warning",
};

const methodIcon: Record<PaymentMethod, typeof Wallet> = {
  [PaymentMethod.pagoMovil]: Wallet,
  [PaymentMethod.transferenciaBs]: Landmark,
  [PaymentMethod.divisas]: Banknote,
  [PaymentMethod.zelle]: BadgeCheck,
  [PaymentMethod.usdt]: Receipt,
};

type AccountDraft = {
  method: PaymentMethod;
  bank: string;
  holder: string;
  documentId: string;
  phone: string;
  accountNumber: string;
  active: boolean;
};

const emptyDraft: AccountDraft = {
  method: PaymentMethod.pagoMovil,
  bank: "",
  holder: "",
  documentId: "",
  phone: "",
  accountNumber: "",
  active: true,
};

function draftFromAccount(account: PaymentAccount): AccountDraft {
  return {
    method: account.method,
    bank: account.bank,
    holder: account.holder,
    documentId: account.documentId,
    phone: account.phone,
    accountNumber: account.accountNumber,
    active: account.active,
  };
}

/** Administrator payments: validation queue plus receiving-account management. */
export function AdminPaymentsPage() {
  const pending = usePendingPayments();
  const accounts = usePaymentAccounts();
  const approve = useApprovePayment();
  const reject = useRejectPayment();
  const createAccount = useCreatePaymentAccount();
  const updateAccount = useUpdatePaymentAccount();
  const setActive = useSetPaymentAccountActive();

  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [rejecting, setRejecting] = useState<PaymentReport | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentAccount | null>(null);
  const [draft, setDraft] = useState<AccountDraft>(emptyDraft);
  const [formError, setFormError] = useState<string | null>(null);

  const pendingRows = pending.data ?? [];
  const accountRows = accounts.data ?? [];

  function handleApprove(payment: PaymentReport) {
    approve.mutate(payment.id, {
      onSuccess: (data) => {
        if (data) {
          setReceipt(data);
          toast.success(`Pago aprobado · ${data.invoiceNumber}`);
        } else {
          toast.error("El pago ya no está pendiente");
        }
      },
      onError: () => toast.error("No pudimos aprobar el pago"),
    });
  }

  function openReject(payment: PaymentReport) {
    setRejecting(payment);
    setRejectReason("");
  }

  function confirmReject() {
    if (!rejecting) return;
    const reason = rejectReason.trim();
    if (reason.length < 4) {
      toast.error("Escribe el motivo del rechazo");
      return;
    }
    reject.mutate(rejecting.id, {
      onSuccess: () => {
        toast.success("Pago rechazado");
        setRejecting(null);
        setRejectReason("");
      },
      onError: () => toast.error("No pudimos rechazar el pago"),
    });
  }

  function openCreate() {
    setEditing(null);
    setDraft(emptyDraft);
    setFormError(null);
    setEditorOpen(true);
  }

  function openEdit(account: PaymentAccount) {
    setEditing(account);
    setDraft(draftFromAccount(account));
    setFormError(null);
    setEditorOpen(true);
  }

  function patchDraft(patch: Partial<AccountDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function submitAccount() {
    const input: PaymentAccountInput = {
      method: draft.method,
      bank: draft.bank.trim(),
      holder: draft.holder.trim(),
      documentId: draft.documentId.trim(),
      phone: draft.phone.trim(),
      accountNumber: draft.accountNumber.trim(),
      active: draft.active,
    };
    if (
      !input.bank ||
      !input.holder ||
      !input.documentId ||
      !input.accountNumber
    ) {
      setFormError("Completa banco, titular, cédula o RIF y número de cuenta.");
      return;
    }
    setFormError(null);
    const onSuccess = () => {
      toast.success(editing ? "Cuenta actualizada" : "Cuenta agregada");
      setEditorOpen(false);
    };
    const onError = () => setFormError("No pudimos guardar la cuenta.");
    if (editing) {
      updateAccount.mutate({ id: editing.id, input }, { onSuccess, onError });
    } else {
      createAccount.mutate(input, { onSuccess, onError });
    }
  }

  function toggleActive(account: PaymentAccount) {
    setActive.mutate(
      { id: account.id, active: !account.active },
      {
        onSuccess: () =>
          toast.success(
            account.active ? "Cuenta desactivada" : "Cuenta activada",
          ),
        onError: () => toast.error("No pudimos cambiar el estado"),
      },
    );
  }

  const saving = createAccount.isPending || updateAccount.isPending;

  return (
    <div data-ocid="admin_payments.page" className="space-y-8">
      {/* ------------------------- Validation queue ------------------------- */}
      <section data-ocid="admin_payments.validation.section">
        <SectionTitle
          title="Pagos por validar"
          action={
            <ToneBadge tone={pendingRows.length > 0 ? "warning" : "neutral"}>
              {pendingRows.length} pendiente
              {pendingRows.length === 1 ? "" : "s"}
            </ToneBadge>
          }
        />

        {pending.isLoading ? (
          <ListSkeleton rows={3} />
        ) : pending.isError ? (
          <ErrorState onRetry={() => void pending.refetch()} />
        ) : pendingRows.length === 0 ? (
          <EmptyState
            icon={BadgeCheck}
            title="Todo al día"
            description="No hay pagos reportados esperando validación. Los nuevos reportes aparecerán aquí."
          />
        ) : (
          <ul data-ocid="admin_payments.pending.list" className="space-y-3">
            {pendingRows.map((payment, index) => {
              const Icon = methodIcon[payment.method];
              const approving =
                approve.isPending && approve.variables === payment.id;
              return (
                <li key={payment.id.toString()}>
                  <ReliefCard
                    data-ocid={`admin_payments.pending.item.${index + 1}`}
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-accent">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-[15px] font-semibold text-foreground">
                            Cliente #{payment.clientId.toString()}
                          </p>
                          <ToneBadge tone={methodTone[payment.method]}>
                            {paymentMethodLabel[payment.method]}
                          </ToneBadge>
                        </div>
                        <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                          Ref. {payment.reference}
                        </p>
                        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="font-display text-lg font-bold text-foreground">
                            {formatUsd(payment.amountUsd)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatBs(payment.amountBs)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Pagado el {formatDate(payment.paidAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        data-ocid={`admin_payments.approve_button.${index + 1}`}
                        disabled={approving}
                        onClick={() => handleApprove(payment)}
                        className="h-11 rounded-2xl bg-success font-semibold text-success-foreground press-tactile hover:brightness-105"
                      >
                        <Check className="size-4" aria-hidden="true" />
                        {approving ? "Aprobando…" : "Aprobar"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        data-ocid={`admin_payments.reject_button.${index + 1}`}
                        onClick={() => openReject(payment)}
                        className="h-11 rounded-2xl border-destructive/40 bg-card font-semibold text-destructive press-tactile hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="size-4" aria-hidden="true" />
                        Rechazar
                      </Button>
                    </div>
                  </ReliefCard>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ------------------------ Receiving accounts ------------------------ */}
      <section data-ocid="admin_payments.accounts.section">
        <SectionTitle
          title="Cuentas receptoras"
          action={
            <Button
              type="button"
              data-ocid="admin_payments.add_account_button"
              onClick={openCreate}
              className="h-9 rounded-full bg-gradient-primary px-4 text-xs font-semibold text-primary-foreground shadow-primary-lift press-tactile hover:brightness-110"
            >
              <Plus className="size-4" aria-hidden="true" />
              Agregar
            </Button>
          }
        />

        {accounts.isLoading ? (
          <ListSkeleton rows={3} />
        ) : accounts.isError ? (
          <ErrorState onRetry={() => void accounts.refetch()} />
        ) : accountRows.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="Sin cuentas registradas"
            description="Agrega las cuentas donde los clientes pueden reportar sus pagos."
            action={
              <PrimaryButton
                type="button"
                data-ocid="admin_payments.empty_add_button"
                onClick={openCreate}
                fullWidth={false}
                className="px-6"
              >
                <Plus className="size-4" aria-hidden="true" />
                Agregar cuenta
              </PrimaryButton>
            }
          />
        ) : (
          <ul data-ocid="admin_payments.accounts.list" className="space-y-3">
            {accountRows.map((account, index) => {
              const Icon = methodIcon[account.method];
              return (
                <li key={account.id.toString()}>
                  <ReliefCard
                    data-ocid={`admin_payments.account.item.${index + 1}`}
                    className={cn(
                      "p-4 transition-opacity",
                      !account.active && "opacity-70",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-accent">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-[15px] font-semibold text-foreground">
                            {account.bank}
                          </p>
                          <ToneBadge tone={methodTone[account.method]}>
                            {paymentMethodLabel[account.method]}
                          </ToneBadge>
                          <ToneBadge
                            tone={account.active ? "success" : "neutral"}
                          >
                            {account.active ? "Activa" : "Inactiva"}
                          </ToneBadge>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {account.holder} · {account.documentId}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                          {account.accountNumber}
                          {account.phone
                            ? ` · ${formatPhone(account.phone)}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`account-active-${account.id.toString()}`}
                          data-ocid={`admin_payments.account_switch.${index + 1}`}
                          checked={account.active}
                          disabled={
                            setActive.isPending &&
                            setActive.variables?.id === account.id
                          }
                          onCheckedChange={() => toggleActive(account)}
                        />
                        <Label
                          htmlFor={`account-active-${account.id.toString()}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          {account.active ? "Activa" : "Inactiva"}
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        data-ocid={`admin_payments.edit_account_button.${index + 1}`}
                        onClick={() => openEdit(account)}
                        className="h-9 rounded-full px-3 text-xs font-semibold text-accent hover:bg-primary/10 hover:text-accent"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Editar
                      </Button>
                    </div>
                  </ReliefCard>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* --------------------------- Receipt modal -------------------------- */}
      <Dialog
        open={receipt !== null}
        onOpenChange={(open) => {
          if (!open) setReceipt(null);
        }}
      >
        <DialogContent
          data-ocid="admin_payments.receipt.modal"
          className="surface-relief rounded-[22px] border-border/60"
        >
          <DialogHeader>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-success/15 text-success sm:mx-0">
              <BadgeCheck className="size-6" aria-hidden="true" />
            </span>
            <DialogTitle className="text-center sm:text-left">
              Pago aprobado
            </DialogTitle>
            <DialogDescription className="text-center sm:text-left">
              Se emitió el recibo correlativo. Compártelo con el cliente por
              WhatsApp.
            </DialogDescription>
          </DialogHeader>
          {receipt && (
            <div className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  Recibo
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {receipt.invoiceNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  Monto
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatUsd(receipt.amountUsd)} · {formatBs(receipt.amountBs)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  Tasa BCV
                </span>
                <span className="text-sm text-foreground">
                  {formatBs(receipt.bcvRate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  Aprobado
                </span>
                <span className="text-sm text-foreground">
                  {formatDate(receipt.approvedAt)}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <SecondaryButton
              type="button"
              data-ocid="admin_payments.receipt.close_button"
              onClick={() => setReceipt(null)}
            >
              Cerrar
            </SecondaryButton>
            {receipt && (
              <PrimaryButton
                type="button"
                data-ocid="admin_payments.receipt.whatsapp_button"
                onClick={() =>
                  window.open(receipt.whatsappUrl, "_blank", "noopener")
                }
              >
                Compartir por WhatsApp
              </PrimaryButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------------------- Reject modal -------------------------- */}
      <Dialog
        open={rejecting !== null}
        onOpenChange={(open) => {
          if (!open) setRejecting(null);
        }}
      >
        <DialogContent
          data-ocid="admin_payments.reject.modal"
          className="surface-relief rounded-[22px] border-border/60"
        >
          <DialogHeader>
            <DialogTitle>Rechazar pago</DialogTitle>
            <DialogDescription>
              {rejecting
                ? `Referencia ${rejecting.reference} · ${formatUsd(rejecting.amountUsd)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <Field
            label="Motivo del rechazo"
            htmlFor="reject-reason"
            hint="El cliente verá este motivo en su estado de cuenta."
          >
            <Textarea
              id="reject-reason"
              data-ocid="admin_payments.reject_reason.textarea"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={3}
              placeholder="Ej. La referencia no coincide con el monto reportado."
              className="rounded-xl border-border bg-background/60 text-[15px] focus-visible:border-primary"
            />
          </Field>
          <DialogFooter className="gap-2">
            <SecondaryButton
              type="button"
              data-ocid="admin_payments.reject.cancel_button"
              onClick={() => setRejecting(null)}
            >
              Cancelar
            </SecondaryButton>
            <Button
              type="button"
              data-ocid="admin_payments.reject.confirm_button"
              disabled={reject.isPending}
              onClick={confirmReject}
              className="h-12 rounded-2xl bg-destructive font-semibold text-destructive-foreground press-tactile hover:bg-destructive/90"
            >
              {reject.isPending ? "Rechazando…" : "Confirmar rechazo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --------------------------- Account editor ------------------------- */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent
          data-ocid="admin_payments.account.modal"
          className="surface-relief max-h-[90dvh] overflow-y-auto rounded-[22px] border-border/60"
        >
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar cuenta" : "Nueva cuenta receptora"}
            </DialogTitle>
            <DialogDescription>
              Los clientes verán estos datos al reportar un pago.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Método" htmlFor="account-method">
              <Select
                value={draft.method}
                onValueChange={(value) =>
                  patchDraft({ method: value as PaymentMethod })
                }
              >
                <SelectTrigger
                  id="account-method"
                  data-ocid="admin_payments.account_method.select"
                  className="h-12 w-full rounded-xl border-border bg-background/60 text-[15px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methodOrder.map((method) => (
                    <SelectItem key={method} value={method}>
                      {paymentMethodLabel[method]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Banco" htmlFor="account-bank">
              <TextField
                id="account-bank"
                data-ocid="admin_payments.account_bank.input"
                value={draft.bank}
                onChange={(event) => patchDraft({ bank: event.target.value })}
                placeholder="Banco de Venezuela"
              />
            </Field>
            <Field label="Titular" htmlFor="account-holder">
              <TextField
                id="account-holder"
                data-ocid="admin_payments.account_holder.input"
                value={draft.holder}
                onChange={(event) => patchDraft({ holder: event.target.value })}
                placeholder="Nombre o razón social"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cédula / RIF" htmlFor="account-document">
                <TextField
                  id="account-document"
                  data-ocid="admin_payments.account_document.input"
                  value={draft.documentId}
                  onChange={(event) =>
                    patchDraft({ documentId: event.target.value })
                  }
                  placeholder="V-12345678"
                />
              </Field>
              <Field label="Teléfono" htmlFor="account-phone">
                <TextField
                  id="account-phone"
                  data-ocid="admin_payments.account_phone.input"
                  value={draft.phone}
                  onChange={(event) =>
                    patchDraft({ phone: event.target.value })
                  }
                  placeholder="0414-1234567"
                  inputMode="tel"
                />
              </Field>
            </div>
            <Field label="Número de cuenta" htmlFor="account-number">
              <TextField
                id="account-number"
                data-ocid="admin_payments.account_number.input"
                value={draft.accountNumber}
                onChange={(event) =>
                  patchDraft({ accountNumber: event.target.value })
                }
                placeholder="0102-0000-00-0000000000"
              />
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-4 py-3">
              <Label
                htmlFor="account-active"
                className="text-sm font-medium text-foreground"
              >
                Cuenta activa
              </Label>
              <Switch
                id="account-active"
                data-ocid="admin_payments.account_active.switch"
                checked={draft.active}
                onCheckedChange={(checked) => patchDraft({ active: checked })}
              />
            </div>
            {formError && <InlineError message={formError} />}
          </div>
          <DialogFooter className="gap-2">
            <SecondaryButton
              type="button"
              data-ocid="admin_payments.account.cancel_button"
              onClick={() => setEditorOpen(false)}
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              type="button"
              data-ocid="admin_payments.account.save_button"
              disabled={saving}
              onClick={submitAccount}
            >
              {saving ? "Guardando…" : editing ? "Guardar cambios" : "Agregar"}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
