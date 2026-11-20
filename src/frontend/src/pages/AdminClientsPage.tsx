import {
  type ClientInput,
  type ClientView,
  CoverageKind,
  ServiceStatus,
} from "@/backend";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBcvRate,
  useClients,
  useCoverageByKind,
  useCoverageChildren,
  useCreateClient,
  useIssueInvoice,
  useSetClientStatus,
  useUpdateClient,
} from "@/hooks/useQueries";
import {
  formatMegabits,
  formatPhone,
  formatUsd,
  initials,
  parseAmountToCents,
} from "@/lib/format";
import { serviceStatusLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import {
  CircleDollarSign,
  MapPin,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Draft = {
  fullName: string;
  cedula: string;
  phone: string;
  username: string;
  password: string;
  planName: string;
  contractedMegabits: string;
  monthlyPriceUsd: string;
  cutOffDay: string;
  graceDays: string;
  parishId: string;
  townId: string;
  sectorId: string;
};

const emptyDraft: Draft = {
  fullName: "",
  cedula: "",
  phone: "",
  username: "",
  password: "",
  planName: "",
  contractedMegabits: "",
  monthlyPriceUsd: "",
  cutOffDay: "",
  graceDays: "3",
  parishId: "",
  townId: "",
  sectorId: "",
};

function draftFromClient(client: ClientView): Draft {
  return {
    fullName: client.fullName,
    cedula: client.cedula,
    phone: client.phone,
    username: client.username,
    password: "",
    planName: client.planName,
    contractedMegabits: client.contractedMegabits.toString(),
    monthlyPriceUsd: (Number(client.monthlyPriceUsd) / 100).toFixed(2),
    cutOffDay: client.cutOffDay.toString(),
    graceDays: client.graceDays.toString(),
    parishId: client.parishId.toString(),
    townId: client.townId.toString(),
    sectorId: client.sectorId.toString(),
  };
}

const statusTone: Record<ServiceStatus, string> = {
  [ServiceStatus.activo]: "border-success/40 bg-success/15 text-success",
  [ServiceStatus.porVencer]: "border-warning/40 bg-warning/15 text-warning",
  [ServiceStatus.suspendido]:
    "border-destructive/40 bg-destructive/15 text-destructive",
};

function StatusPill({ status }: { status: ServiceStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5", statusTone[status])}
    >
      {serviceStatusLabel[status]}
    </Badge>
  );
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function AdminClientsPage() {
  const clientsQuery = useClients();
  const setStatus = useSetClientStatus();
  const issueInvoice = useIssueInvoice();
  const bcvRate = useBcvRate();

  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ClientView | null>(null);

  const clients = clientsQuery.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) =>
      [client.fullName, client.cedula, client.username, client.phone].some(
        (field) => field.toLowerCase().includes(term),
      ),
    );
  }, [clients, search]);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (client: ClientView) => {
    setEditing(client);
    setEditorOpen(true);
  };

  const toggleStatus = (client: ClientView) => {
    const next =
      client.status === ServiceStatus.suspendido
        ? ServiceStatus.activo
        : ServiceStatus.suspendido;
    setStatus.mutate(
      { id: client.id, status: next },
      {
        onSuccess: () =>
          toast.success(
            next === ServiceStatus.suspendido
              ? `${client.fullName} suspendido`
              : `${client.fullName} reactivado`,
          ),
        onError: () => toast.error("No se pudo cambiar el estado"),
      },
    );
  };

  const billClient = (client: ClientView) => {
    const rate = bcvRate.data?.value ?? 0n;
    const amountBs = (client.monthlyPriceUsd * rate) / 100n;
    issueInvoice.mutate(
      {
        clientId: client.id,
        period: currentPeriod(),
        amountUsd: client.monthlyPriceUsd,
        amountBs,
        bcvRate: rate,
      },
      {
        onSuccess: (invoice) =>
          toast.success(`Factura ${invoice.number} emitida`),
        onError: () => toast.error("No se pudo emitir la factura"),
      },
    );
  };

  return (
    <div data-ocid="admin_clients.page" className="space-y-5">
      <SectionTitle
        title="Clientes"
        action={
          <Button
            type="button"
            onClick={openCreate}
            data-ocid="admin_clients.open_modal_button"
            className="press-tactile h-9 rounded-full bg-gradient-primary px-4 text-primary-foreground shadow-lg shadow-primary/25"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nuevo
          </Button>
        }
      />

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, cédula o usuario"
          aria-label="Buscar clientes"
          data-ocid="admin_clients.search_input"
          className="h-11 rounded-full border-border/70 bg-card pl-9"
        />
      </div>

      {clientsQuery.isLoading ? (
        <div className="space-y-3" data-ocid="admin_clients.loading_state">
          {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((id) => (
            <div
              key={id}
              className="h-28 animate-pulse rounded-[22px] border border-border/60 bg-card/60"
            />
          ))}
        </div>
      ) : clientsQuery.isError ? (
        <ReliefCard className="p-5" data-ocid="admin_clients.error_state">
          <p className="text-sm font-semibold text-foreground">
            No se pudo cargar la lista de clientes
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void clientsQuery.refetch()}
            className="mt-3 rounded-full"
            data-ocid="admin_clients.retry_button"
          >
            Reintentar
          </Button>
        </ReliefCard>
      ) : filtered.length === 0 ? (
        <ReliefCard
          className="p-6 text-center"
          data-ocid="admin_clients.empty_state"
        >
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/12 text-accent">
            <Users className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-3 text-[15px] font-semibold text-foreground">
            {clients.length === 0
              ? "Aún no hay clientes registrados"
              : "Sin resultados"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {clients.length === 0
              ? "Registra el primer cliente para comenzar a facturar."
              : "Prueba con otro nombre, cédula o usuario."}
          </p>
          {clients.length === 0 && (
            <Button
              type="button"
              onClick={openCreate}
              className="mt-4 rounded-full bg-gradient-primary text-primary-foreground"
              data-ocid="admin_clients.primary_button"
            >
              <Plus className="size-4" aria-hidden="true" />
              Registrar cliente
            </Button>
          )}
        </ReliefCard>
      ) : (
        <ul className="space-y-3" data-ocid="admin_clients.list">
          {filtered.map((client, index) => {
            const suspended = client.status === ServiceStatus.suspendido;
            return (
              <li key={client.id.toString()}>
                <ReliefCard
                  className="p-4"
                  data-ocid={`admin_clients.item.${index + 1}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-primary font-display text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25">
                      {initials(client.fullName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[15px] font-semibold text-foreground">
                          {client.fullName}
                        </p>
                        <StatusPill status={client.status} />
                      </div>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        V-{client.cedula} · {client.username}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/90">
                          {client.planName}
                        </span>
                        <span>{formatMegabits(client.contractedMegabits)}</span>
                        <span className="font-semibold text-accent">
                          {formatUsd(client.monthlyPriceUsd)}/mes
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" aria-hidden="true" />
                        <span className="truncate">
                          {formatPhone(client.phone)} · Corte día{" "}
                          {client.cutOffDay.toString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-border/50 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(client)}
                      className="press-tactile h-9 flex-1 rounded-full"
                      data-ocid={`admin_clients.edit_button.${index + 1}`}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => billClient(client)}
                      disabled={issueInvoice.isPending}
                      className="press-tactile h-9 flex-1 rounded-full"
                      data-ocid={`admin_clients.invoice_button.${index + 1}`}
                    >
                      <CircleDollarSign
                        className="size-3.5"
                        aria-hidden="true"
                      />
                      Facturar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => toggleStatus(client)}
                      disabled={setStatus.isPending}
                      className={cn(
                        "press-tactile h-9 flex-1 rounded-full",
                        suspended
                          ? "bg-success text-success-foreground hover:bg-success/90"
                          : "bg-warning text-warning-foreground hover:bg-warning/90",
                      )}
                      data-ocid={`admin_clients.toggle.${index + 1}`}
                    >
                      {suspended ? (
                        <Power className="size-3.5" aria-hidden="true" />
                      ) : (
                        <PowerOff className="size-3.5" aria-hidden="true" />
                      )}
                      {suspended ? "Reactivar" : "Suspender"}
                    </Button>
                  </div>
                </ReliefCard>
              </li>
            );
          })}
        </ul>
      )}

      <ClientEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        editing={editing}
      />
    </div>
  );
}

function ClientEditorDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ClientView | null;
}) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  const parishes = useCoverageByKind(CoverageKind.parroquia);
  const towns = useCoverageChildren(
    draft.parishId ? BigInt(draft.parishId) : null,
  );
  const sectors = useCoverageChildren(
    draft.townId ? BigInt(draft.townId) : null,
  );

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft(editing ? draftFromClient(editing) : emptyDraft);
      setError(null);
    }
    onOpenChange(next);
  };

  const pending = createClient.isPending || updateClient.isPending;

  const submit = () => {
    const priceCents = parseAmountToCents(draft.monthlyPriceUsd);
    const megabits = Number(draft.contractedMegabits);
    const cutOffDay = Number(draft.cutOffDay);
    const graceDays = Number(draft.graceDays);

    if (!draft.fullName.trim() || !draft.cedula.trim()) {
      setError("Nombre completo y cédula son obligatorios.");
      return;
    }
    if (!draft.username.trim() || (!editing && !draft.password.trim())) {
      setError("Usuario y contraseña son obligatorios.");
      return;
    }
    if (priceCents === null) {
      setError("Indica un precio mensual válido en USD.");
      return;
    }
    if (!Number.isFinite(megabits) || megabits <= 0) {
      setError("Indica los megas contratados.");
      return;
    }
    if (!Number.isInteger(cutOffDay) || cutOffDay < 1 || cutOffDay > 31) {
      setError("El día de corte debe estar entre 1 y 31.");
      return;
    }
    if (!Number.isInteger(graceDays) || graceDays < 0) {
      setError("Los días de gracia deben ser cero o más.");
      return;
    }
    if (!draft.parishId || !draft.townId || !draft.sectorId) {
      setError("Selecciona parroquia, pueblo y sector.");
      return;
    }

    const input: ClientInput = {
      fullName: draft.fullName.trim(),
      cedula: draft.cedula.trim(),
      phone: draft.phone.trim(),
      username: draft.username.trim(),
      password: draft.password,
      planName: draft.planName.trim(),
      contractedMegabits: BigInt(megabits),
      monthlyPriceUsd: priceCents,
      cutOffDay: BigInt(cutOffDay),
      graceDays: BigInt(graceDays),
      parishId: BigInt(draft.parishId),
      townId: BigInt(draft.townId),
      sectorId: BigInt(draft.sectorId),
    };

    setError(null);
    if (editing) {
      updateClient.mutate(
        { id: editing.id, input },
        {
          onSuccess: () => {
            toast.success("Cliente actualizado");
            onOpenChange(false);
          },
          onError: () => setError("No se pudo guardar el cliente."),
        },
      );
    } else {
      createClient.mutate(input, {
        onSuccess: () => {
          toast.success("Cliente registrado");
          onOpenChange(false);
        },
        onError: () => setError("No se pudo registrar el cliente."),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto rounded-[22px] border-border/60 bg-card"
        data-ocid="admin_clients.modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {editing ? "Editar cliente" : "Nuevo cliente"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Actualiza los datos del servicio y la ubicación."
              : "Registra los datos del servicio y la ubicación del cliente."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Field label="Nombre completo" htmlFor="client-fullname">
            <Input
              id="client-fullname"
              value={draft.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              data-ocid="admin_clients.fullname_input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cédula" htmlFor="client-cedula">
              <Input
                id="client-cedula"
                inputMode="numeric"
                value={draft.cedula}
                onChange={(e) => set("cedula", e.target.value)}
                data-ocid="admin_clients.cedula_input"
              />
            </Field>
            <Field label="Teléfono" htmlFor="client-phone">
              <Input
                id="client-phone"
                inputMode="tel"
                value={draft.phone}
                onChange={(e) => set("phone", e.target.value)}
                data-ocid="admin_clients.phone_input"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Usuario" htmlFor="client-username">
              <Input
                id="client-username"
                autoCapitalize="none"
                value={draft.username}
                onChange={(e) => set("username", e.target.value)}
                data-ocid="admin_clients.username_input"
              />
            </Field>
            <Field
              label={editing ? "Contraseña (opcional)" : "Contraseña"}
              htmlFor="client-password"
            >
              <Input
                id="client-password"
                type="password"
                value={draft.password}
                onChange={(e) => set("password", e.target.value)}
                data-ocid="admin_clients.password_input"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plan" htmlFor="client-plan">
              <Input
                id="client-plan"
                value={draft.planName}
                onChange={(e) => set("planName", e.target.value)}
                data-ocid="admin_clients.plan_input"
              />
            </Field>
            <Field label="Megas contratados" htmlFor="client-megabits">
              <Input
                id="client-megabits"
                inputMode="numeric"
                value={draft.contractedMegabits}
                onChange={(e) => set("contractedMegabits", e.target.value)}
                data-ocid="admin_clients.megabits_input"
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Precio USD" htmlFor="client-price">
              <Input
                id="client-price"
                inputMode="decimal"
                value={draft.monthlyPriceUsd}
                onChange={(e) => set("monthlyPriceUsd", e.target.value)}
                data-ocid="admin_clients.price_input"
              />
            </Field>
            <Field label="Día corte" htmlFor="client-cutoff">
              <Input
                id="client-cutoff"
                inputMode="numeric"
                value={draft.cutOffDay}
                onChange={(e) => set("cutOffDay", e.target.value)}
                data-ocid="admin_clients.cutoff_input"
              />
            </Field>
            <Field label="Días gracia" htmlFor="client-grace">
              <Input
                id="client-grace"
                inputMode="numeric"
                value={draft.graceDays}
                onChange={(e) => set("graceDays", e.target.value)}
                data-ocid="admin_clients.grace_input"
              />
            </Field>
          </div>

          <Field label="Parroquia">
            <Select
              value={draft.parishId}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  parishId: value,
                  townId: "",
                  sectorId: "",
                }))
              }
            >
              <SelectTrigger
                className="w-full"
                data-ocid="admin_clients.parish_select"
              >
                <SelectValue placeholder="Selecciona parroquia" />
              </SelectTrigger>
              <SelectContent>
                {(parishes.data ?? []).map((entry) => (
                  <SelectItem
                    key={entry.id.toString()}
                    value={entry.id.toString()}
                  >
                    {entry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Pueblo">
            <Select
              value={draft.townId}
              disabled={!draft.parishId}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  townId: value,
                  sectorId: "",
                }))
              }
            >
              <SelectTrigger
                className="w-full"
                data-ocid="admin_clients.town_select"
              >
                <SelectValue
                  placeholder={
                    draft.parishId ? "Selecciona pueblo" : "Elige parroquia"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(towns.data ?? []).map((entry) => (
                  <SelectItem
                    key={entry.id.toString()}
                    value={entry.id.toString()}
                  >
                    {entry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Sector">
            <Select
              value={draft.sectorId}
              disabled={!draft.townId}
              onValueChange={(value) => set("sectorId", value)}
            >
              <SelectTrigger
                className="w-full"
                data-ocid="admin_clients.sector_select"
              >
                <SelectValue
                  placeholder={
                    draft.townId ? "Selecciona sector" : "Elige pueblo"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(sectors.data ?? []).map((entry) => (
                  <SelectItem
                    key={entry.id.toString()}
                    value={entry.id.toString()}
                  >
                    {entry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {error && (
            <p
              className="text-sm font-medium text-destructive"
              data-ocid="admin_clients.error_state"
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
            data-ocid="admin_clients.cancel_button"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={pending}
            className="rounded-full bg-gradient-primary text-primary-foreground"
            data-ocid="admin_clients.submit_button"
          >
            {pending ? "Guardando…" : editing ? "Guardar cambios" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
