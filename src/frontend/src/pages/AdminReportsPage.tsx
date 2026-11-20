import { PaymentStatus } from "@/backend";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/shared/ActionButtons";
import { Field, TextField } from "@/components/shared/Field";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import { ToneBadge } from "@/components/shared/StatusBadge";
import {
  useBcvRate,
  useClients,
  useDashboardMetrics,
  usePendingPayments,
  useSetBcvRateAutomatic,
  useSetBcvRateManual,
} from "@/hooks/useQueries";
import {
  centsToNumber,
  formatBcvRate,
  formatBs,
  formatDate,
  formatDateTime,
  formatUsd,
  parseAmountToCents,
} from "@/lib/format";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  serviceStatusLabel,
} from "@/lib/labels";
import { cn } from "@/lib/utils";
import {
  ArrowDownToLine,
  CalendarDays,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/* ------------------------------ CSV helpers ------------------------------ */

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const body = rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
  const blob = new Blob([`\uFEFF${body}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/* --------------------------------- Page ---------------------------------- */

/** Administrator reports: CSV exports of clients, payments and monthly income. */
export function AdminReportsPage() {
  const clients = useClients();
  const payments = usePendingPayments();
  const metrics = useDashboardMetrics();
  const bcv = useBcvRate();

  const clientList = clients.data ?? [];
  const paymentList = payments.data ?? [];
  const approvedPayments = paymentList.filter(
    (p) => p.status === PaymentStatus.aprobado,
  );

  const exportClients = () => {
    if (clientList.length === 0) {
      toast.error("No hay clientes para exportar");
      return;
    }
    const rows: (string | number)[][] = [
      [
        "Cédula",
        "Nombre",
        "Teléfono",
        "Plan",
        "Megabits",
        "Precio USD",
        "Estado",
      ],
      ...clientList.map((c) => [
        c.cedula,
        c.fullName,
        c.phone,
        c.planName,
        c.contractedMegabits.toString(),
        centsToNumber(c.monthlyPriceUsd).toFixed(2),
        serviceStatusLabel[c.status],
      ]),
    ];
    downloadCsv(`clientes-${todayStamp()}.csv`, rows);
    toast.success(`Listado de ${clientList.length} clientes descargado`);
  };

  const exportPayments = () => {
    if (paymentList.length === 0) {
      toast.error("No hay pagos reportados para exportar");
      return;
    }
    const rows: (string | number)[][] = [
      [
        "Referencia",
        "Cliente",
        "Método",
        "Monto USD",
        "Monto Bs.",
        "Fecha",
        "Estado",
      ],
      ...paymentList.map((p) => {
        const client = clientList.find((c) => c.id === p.clientId);
        return [
          p.reference,
          client?.fullName ?? `Cliente #${p.clientId.toString()}`,
          paymentMethodLabel[p.method],
          centsToNumber(p.amountUsd).toFixed(2),
          centsToNumber(p.amountBs).toFixed(2),
          formatDateTime(p.paidAt),
          paymentStatusLabel[p.status],
        ];
      }),
    ];
    downloadCsv(`pagos-${todayStamp()}.csv`, rows);
    toast.success(`Reporte de ${paymentList.length} pagos descargado`);
  };

  const exportIncome = () => {
    if (!metrics.data) {
      toast.error("Los indicadores aún no están disponibles");
      return;
    }
    const m = metrics.data;
    const rows: (string | number)[][] = [
      ["Concepto", "Valor"],
      ["Clientes activos", m.activeClients.toString()],
      ["Clientes por vencer", m.dueSoonClients.toString()],
      ["Clientes suspendidos", m.suspendedClients.toString()],
      ["Pagos pendientes", m.pendingPayments.toString()],
      ["Ingreso del mes (USD)", centsToNumber(m.monthlyIncomeUsd).toFixed(2)],
      ["Ingreso del mes (Bs.)", centsToNumber(m.monthlyIncomeBs).toFixed(2)],
      ["Pagos aprobados", approvedPayments.length.toString()],
      ["Tasa BCV", bcv.data ? centsToNumber(bcv.data.value).toFixed(2) : "—"],
    ];
    downloadCsv(`ingresos-${todayStamp()}.csv`, rows);
    toast.success("Resumen de ingresos descargado");
  };

  const exports = [
    {
      key: "clients",
      title: "Listado de clientes",
      description: "Cédula, contacto, plan, precio y estado de cada cliente.",
      count: `${clientList.length} registros`,
      icon: Users,
      onClick: exportClients,
      ocid: "reports.export_clients_button",
    },
    {
      key: "payments",
      title: "Reporte de pagos",
      description:
        "Referencias, montos en divisas y bolívares, método y estado.",
      count: `${paymentList.length} registros`,
      icon: Wallet,
      onClick: exportPayments,
      ocid: "reports.export_payments_button",
    },
    {
      key: "income",
      title: "Ingresos del mes",
      description:
        "Indicadores financieros y facturación acumulada del período.",
      count: metrics.data ? formatUsd(metrics.data.monthlyIncomeUsd) : "—",
      icon: FileSpreadsheet,
      onClick: exportIncome,
      ocid: "reports.export_income_button",
    },
  ];

  return (
    <div data-ocid="admin_reports.page" className="space-y-6">
      <SectionTitle title="Reportes" />

      <div className="grid gap-3">
        {exports.map((item) => (
          <ReliefCard key={item.key} className="p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-accent">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <p className="mt-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-accent">
                  {item.count}
                </p>
              </div>
            </div>
            <SecondaryButton
              type="button"
              data-ocid={item.ocid}
              onClick={item.onClick}
              className="mt-3 h-11"
            >
              <ArrowDownToLine className="size-4" aria-hidden="true" />
              Descargar CSV
            </SecondaryButton>
          </ReliefCard>
        ))}
      </div>

      <BcvRatePanel />
    </div>
  );
}

/* ------------------------------ BCV panel -------------------------------- */

function BcvRatePanel() {
  const { data, isLoading } = useBcvRate();
  const setManual = useSetBcvRateManual();
  const setAutomatic = useSetBcvRateAutomatic();

  const [value, setValue] = useState("");
  const [valueDate, setValueDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submitManual = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cents = parseAmountToCents(value);
    if (cents === null || cents <= 0n) {
      setError("Ingresa una tasa válida, por ejemplo 36,50");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valueDate)) {
      setError("Selecciona la fecha de vigencia de la tasa");
      return;
    }
    setError(null);
    const payload = { value: cents, valueDate };
    setValue("");
    setValueDate("");
    setManual.mutate(payload, {
      onSuccess: () => toast.success("Tasa BCV manual actualizada"),
      onError: () => {
        setError("No se pudo guardar la tasa. Intenta de nuevo.");
        setValue(value);
        setValueDate(valueDate);
      },
    });
  };

  const restoreAutomatic = () => {
    if (!data) return;
    setAutomatic.mutate(
      { value: data.value, valueDate: data.valueDate },
      {
        onSuccess: () => toast.success("Tasa BCV automática restaurada"),
        onError: () => toast.error("No se pudo restaurar la tasa automática"),
      },
    );
  };

  return (
    <ReliefCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="size-4" aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
            Tasa BCV
          </p>
        </div>
        {data && (
          <ToneBadge tone={data.manual ? "warning" : "success"}>
            {data.manual ? "Manual" : "Automática"}
          </ToneBadge>
        )}
      </div>

      {isLoading ? (
        <div
          data-ocid="reports.bcv.loading_state"
          className="mt-3 h-9 w-40 animate-pulse rounded-lg bg-muted"
        />
      ) : data ? (
        <>
          <p
            data-ocid="reports.bcv.value"
            className="mt-2 font-display text-3xl font-bold text-foreground"
          >
            {formatBcvRate(data.value)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Vigente desde {data.valueDate} · actualizada{" "}
            {formatDate(data.updatedAt)}
          </p>
        </>
      ) : (
        <p
          data-ocid="reports.bcv.empty_state"
          className="mt-3 text-sm text-muted-foreground"
        >
          La tasa automática no está disponible. Registra una tasa manual para
          continuar facturando.
        </p>
      )}

      <form onSubmit={submitManual} className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tasa (Bs./USD)" htmlFor="bcv-value">
            <TextField
              id="bcv-value"
              data-ocid="reports.bcv.input"
              inputMode="decimal"
              placeholder="36,50"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Field>
          <Field label="Vigencia" htmlFor="bcv-date">
            <TextField
              id="bcv-date"
              data-ocid="reports.bcv.date_input"
              type="date"
              value={valueDate}
              onChange={(e) => setValueDate(e.target.value)}
            />
          </Field>
        </div>
        {error && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
        <PrimaryButton
          type="submit"
          data-ocid="reports.bcv.save_button"
          disabled={setManual.isPending}
          className="h-11"
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {setManual.isPending ? "Guardando…" : "Guardar tasa manual"}
        </PrimaryButton>
      </form>

      {data?.manual && (
        <button
          type="button"
          data-ocid="reports.bcv.automatic_button"
          onClick={restoreAutomatic}
          disabled={setAutomatic.isPending}
          className={cn(
            "mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/70 px-3 py-2.5 text-[13px] font-semibold text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground disabled:opacity-60",
          )}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          {setAutomatic.isPending
            ? "Restaurando…"
            : "Volver a la tasa automática"}
        </button>
      )}
    </ReliefCard>
  );
}
