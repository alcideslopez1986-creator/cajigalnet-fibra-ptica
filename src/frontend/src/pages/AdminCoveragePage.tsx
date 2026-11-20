import { type CoverageEntry, CoverageKind } from "@/backend";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/shared/ActionButtons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState, InlineError } from "@/components/shared/ErrorState";
import { Field, TextField } from "@/components/shared/Field";
import { ListSkeleton } from "@/components/shared/LoadingSkeletons";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import { ToneBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useClients,
  useCoverage,
  useCreateCoverage,
  useDeleteCoverage,
  useInstallRequests,
  useUpdateCoverage,
} from "@/hooks/useQueries";
import { coverageKindLabel, coverageKindPlural } from "@/lib/labels";
import { cn } from "@/lib/utils";
import {
  Building2,
  ChevronDown,
  Home,
  MapPinned,
  Pencil,
  Plus,
  Power,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const KIND_ORDER: CoverageKind[] = [
  CoverageKind.parroquia,
  CoverageKind.pueblo,
  CoverageKind.sector,
];

const KIND_ICON = {
  [CoverageKind.parroquia]: Building2,
  [CoverageKind.pueblo]: Home,
  [CoverageKind.sector]: MapPinned,
} as const;

const KIND_ACCENT = {
  [CoverageKind.parroquia]: "bg-primary/12 text-accent",
  [CoverageKind.pueblo]: "bg-accent/12 text-accent",
  [CoverageKind.sector]: "bg-warning/15 text-warning",
} as const;

const KIND_DEPTH = {
  [CoverageKind.parroquia]: 0,
  [CoverageKind.pueblo]: 1,
  [CoverageKind.sector]: 2,
} as const;

const KIND_CHILD: Record<CoverageKind, CoverageKind | null> = {
  [CoverageKind.parroquia]: CoverageKind.pueblo,
  [CoverageKind.pueblo]: CoverageKind.sector,
  [CoverageKind.sector]: null,
};

const KIND_PARENT: Record<CoverageKind, CoverageKind | null> = {
  [CoverageKind.parroquia]: null,
  [CoverageKind.pueblo]: CoverageKind.parroquia,
  [CoverageKind.sector]: CoverageKind.pueblo,
};

type Draft = {
  id: bigint | null;
  kind: CoverageKind;
  name: string;
  parentId: string;
  active: boolean;
};

type Node = {
  entry: CoverageEntry;
  children: Node[];
  clients: number;
  requests: number;
};

function emptyDraft(kind: CoverageKind, parentId: string): Draft {
  return { id: null, kind, name: "", parentId, active: true };
}

function buildTree(entries: CoverageEntry[]): Node[] {
  const nodes = new Map<string, Node>();
  for (const entry of entries) {
    nodes.set(entry.id.toString(), {
      entry,
      children: [],
      clients: 0,
      requests: 0,
    });
  }
  const roots: Node[] = [];
  for (const node of nodes.values()) {
    const parentKey = node.entry.parentId?.toString();
    const parent = parentKey ? nodes.get(parentKey) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const sortNodes = (list: Node[]) => {
    list.sort((a, b) => a.entry.name.localeCompare(b.entry.name, "es"));
    for (const node of list) sortNodes(node.children);
  };
  sortNodes(roots);
  return roots;
}

function countAssignments(
  roots: Node[],
  clientIds: Map<string, number>,
  requestIds: Map<string, number>,
) {
  const walk = (node: Node): { clients: number; requests: number } => {
    const key = node.entry.id.toString();
    let clients = clientIds.get(key) ?? 0;
    let requests = requestIds.get(key) ?? 0;
    for (const child of node.children) {
      const sub = walk(child);
      clients += sub.clients;
      requests += sub.requests;
    }
    node.clients = clients;
    node.requests = requests;
    return { clients, requests };
  };
  for (const root of roots) walk(root);
}

function tally(ids: bigint[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const id of ids) {
    const key = id.toString();
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function flatten(nodes: Node[], out: Node[] = []): Node[] {
  for (const node of nodes) {
    out.push(node);
    flatten(node.children, out);
  }
  return out;
}

export function AdminCoveragePage() {
  const coverage = useCoverage();
  const clients = useClients();
  const requests = useInstallRequests();
  const createCoverage = useCreateCoverage();
  const updateCoverage = useUpdateCoverage();
  const deleteCoverage = useDeleteCoverage();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<CoverageEntry | null>(
    null,
  );

  const entries = coverage.data ?? [];

  const tree = useMemo(() => {
    const roots = buildTree(entries);
    const clientTally = tally((clients.data ?? []).map((c) => c.sectorId));
    const requestTally = tally((requests.data ?? []).map((r) => r.sectorId));
    countAssignments(roots, clientTally, requestTally);
    return roots;
  }, [entries, clients.data, requests.data]);

  const flat = useMemo(() => flatten(tree), [tree]);
  const byId = useMemo(() => {
    const map = new Map<string, CoverageEntry>();
    for (const entry of entries) map.set(entry.id.toString(), entry);
    return map;
  }, [entries]);

  const totals = useMemo(() => {
    const active = entries.filter((e) => e.active).length;
    return {
      active,
      inactive: entries.length - active,
      clients: clients.data?.length ?? 0,
      requests: requests.data?.length ?? 0,
    };
  }, [entries, clients.data, requests.data]);

  const isSaving = createCoverage.isPending || updateCoverage.isPending;

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openCreate = (kind: CoverageKind, parentId: string) => {
    setFormError(null);
    setDraft(emptyDraft(kind, parentId));
  };

  const openEdit = (entry: CoverageEntry) => {
    setFormError(null);
    setDraft({
      id: entry.id,
      kind: entry.kind,
      name: entry.name,
      parentId: entry.parentId?.toString() ?? "",
      active: entry.active,
    });
  };

  const closeDraft = () => {
    setDraft(null);
    setFormError(null);
  };

  const parentOptions = useMemo(() => {
    if (!draft) return [];
    const parentKind = KIND_PARENT[draft.kind];
    if (!parentKind) return [];
    return entries
      .filter((e) => e.kind === parentKind && e.id !== draft.id)
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [draft, entries]);

  const submitDraft = () => {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      setFormError("Escribe el nombre de la ubicación.");
      return;
    }
    const parentKind = KIND_PARENT[draft.kind];
    if (parentKind && !draft.parentId) {
      setFormError(
        `Selecciona la ${coverageKindLabel[parentKind].toLowerCase()} a la que pertenece.`,
      );
      return;
    }
    const input = {
      kind: draft.kind,
      name,
      parentId: draft.parentId ? BigInt(draft.parentId) : undefined,
      active: draft.active,
    };
    setFormError(null);
    if (draft.id === null) {
      createCoverage.mutate(input, {
        onSuccess: () => {
          toast.success(`${coverageKindLabel[draft.kind]} creada`);
          closeDraft();
        },
        onError: () => setFormError("No pudimos guardar. Intenta de nuevo."),
      });
    } else {
      updateCoverage.mutate(
        { id: draft.id, input },
        {
          onSuccess: () => {
            toast.success("Ubicación actualizada");
            closeDraft();
          },
          onError: () => setFormError("No pudimos guardar. Intenta de nuevo."),
        },
      );
    }
  };

  const toggleActive = (entry: CoverageEntry) => {
    updateCoverage.mutate(
      {
        id: entry.id,
        input: {
          kind: entry.kind,
          name: entry.name,
          parentId: entry.parentId,
          active: !entry.active,
        },
      },
      {
        onSuccess: () =>
          toast.success(
            entry.active ? "Ubicación desactivada" : "Ubicación reactivada",
          ),
        onError: () => toast.error("No pudimos actualizar la ubicación"),
      },
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    deleteCoverage.mutate(target.id, {
      onSuccess: () => {
        toast.success("Ubicación eliminada");
        setPendingDelete(null);
      },
      onError: () => toast.error("No pudimos eliminar la ubicación"),
    });
  };

  const renderNode = (node: Node) => {
    const key = node.entry.id.toString();
    const Icon = KIND_ICON[node.entry.kind];
    const hasChildren = node.children.length > 0;
    const isOpen = expanded.has(key);
    const parent = node.entry.parentId
      ? byId.get(node.entry.parentId.toString())
      : undefined;
    const childKind = KIND_CHILD[node.entry.kind];

    return (
      <li key={key} className="space-y-2">
        <ReliefCard
          data-ocid={`coverage.item.${key}`}
          className={cn("p-3.5", !node.entry.active && "opacity-70")}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl",
                KIND_ACCENT[node.entry.kind],
              )}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-semibold text-foreground">
                  {node.entry.name}
                </p>
                {!node.entry.active && (
                  <ToneBadge tone="danger" className="shrink-0">
                    Inactiva
                  </ToneBadge>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {coverageKindLabel[node.entry.kind]}
                {parent ? ` · en ${parent.name}` : " · raíz"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <ToneBadge tone="primary">
                  <Users className="size-3" aria-hidden="true" />
                  {node.clients} {node.clients === 1 ? "cliente" : "clientes"}
                </ToneBadge>
                <ToneBadge tone="warning">
                  {node.requests}{" "}
                  {node.requests === 1 ? "solicitud" : "solicitudes"}
                </ToneBadge>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 border-t border-border/50 pt-2.5">
            {hasChildren && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-ocid={`coverage.toggle.${key}`}
                aria-expanded={isOpen}
                onClick={() => toggleExpanded(key)}
                className="h-9 rounded-xl px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
                {node.children.length}
              </Button>
            )}
            {childKind && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-ocid={`coverage.add_child_button.${key}`}
                onClick={() => openCreate(childKind, key)}
                className="h-9 rounded-xl px-2.5 text-xs font-semibold text-accent hover:bg-primary/10"
              >
                <Plus className="size-4" aria-hidden="true" />
                {coverageKindLabel[childKind]}
              </Button>
            )}
            <div className="ml-auto flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                data-ocid={`coverage.edit_button.${key}`}
                aria-label={`Editar ${node.entry.name}`}
                onClick={() => openEdit(node.entry)}
                className="size-9 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                data-ocid={`coverage.toggle_active_button.${key}`}
                aria-label={
                  node.entry.active
                    ? `Desactivar ${node.entry.name}`
                    : `Reactivar ${node.entry.name}`
                }
                onClick={() => toggleActive(node.entry)}
                className={cn(
                  "size-9 rounded-xl",
                  node.entry.active
                    ? "text-success hover:bg-success/10"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Power className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                data-ocid={`coverage.delete_button.${key}`}
                aria-label={`Eliminar ${node.entry.name}`}
                onClick={() => setPendingDelete(node.entry)}
                className="size-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </ReliefCard>
        {hasChildren && isOpen && (
          <ul
            className={cn(
              "space-y-2 border-l border-border/60",
              KIND_DEPTH[node.entry.kind] === 0 ? "ml-4 pl-3" : "ml-3 pl-3",
            )}
          >
            {node.children.map(renderNode)}
          </ul>
        )}
      </li>
    );
  };

  const loading = coverage.isLoading;
  const failed = coverage.isError;

  return (
    <div data-ocid="admin_coverage.page" className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Municipio Cajigal
          </p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-foreground">
            Cobertura
          </h1>
        </div>
        <PrimaryButton
          type="button"
          fullWidth={false}
          data-ocid="coverage.add_parish_button"
          onClick={() => openCreate(CoverageKind.parroquia, "")}
          className="h-11 shrink-0 px-4 text-sm"
        >
          <Plus className="size-4" aria-hidden="true" />
          Parroquia
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ReliefCard className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Ubicaciones activas
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {totals.active}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              / {entries.length}
            </span>
          </p>
        </ReliefCard>
        <ReliefCard className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Asignaciones
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {totals.clients + totals.requests}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {totals.clients} clientes · {totals.requests} solicitudes
          </p>
        </ReliefCard>
      </div>

      <div>
        <SectionTitle
          title="Jerarquía"
          action={
            <span className="text-xs text-muted-foreground">
              {KIND_ORDER.map((k) => coverageKindPlural[k]).join(" · ")}
            </span>
          }
        />

        {loading && <ListSkeleton rows={5} />}

        {failed && (
          <ErrorState
            title="No pudimos cargar la cobertura"
            description="Revisa tu conexión e intenta de nuevo."
            onRetry={() => void coverage.refetch()}
          />
        )}

        {!loading && !failed && tree.length === 0 && (
          <EmptyState
            icon={MapPinned}
            title="Aún no hay cobertura registrada"
            description="Crea la primera parroquia del Municipio Cajigal para empezar a organizar pueblos y sectores."
            action={
              <PrimaryButton
                type="button"
                fullWidth={false}
                data-ocid="coverage.empty_add_button"
                onClick={() => openCreate(CoverageKind.parroquia, "")}
                className="px-5"
              >
                <Plus className="size-4" aria-hidden="true" />
                Crear parroquia
              </PrimaryButton>
            }
          />
        )}

        {!loading && !failed && tree.length > 0 && (
          <ul data-ocid="coverage.list" className="space-y-2">
            {tree.map(renderNode)}
          </ul>
        )}
      </div>

      <ReliefCard className="p-4">
        <p className="text-[13px] font-semibold text-foreground">
          Asignación de clientes y solicitudes
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Los contadores muestran cuántos clientes y solicitudes de instalación
          están asignados a cada sector. Asigna la ubicación desde las vistas de
          Clientes y Solicitudes.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {flat.length} ubicaciones · {totals.inactive} inactivas
        </p>
      </ReliefCard>

      <Dialog
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open) closeDraft();
        }}
      >
        <DialogContent
          data-ocid="coverage.form.dialog"
          className="surface-relief rounded-[22px] border-border/60"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {draft?.id === null
                ? `Nueva ${draft ? coverageKindLabel[draft.kind].toLowerCase() : "ubicación"}`
                : "Editar ubicación"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Organiza la cobertura del Municipio Cajigal.
            </DialogDescription>
          </DialogHeader>

          {draft && (
            <div className="space-y-4">
              <Field label="Tipo" htmlFor="coverage-kind">
                <Select
                  value={draft.kind}
                  onValueChange={(value) =>
                    setDraft({
                      ...draft,
                      kind: value as CoverageKind,
                      parentId: "",
                    })
                  }
                >
                  <SelectTrigger
                    id="coverage-kind"
                    data-ocid="coverage.kind.select"
                    className="h-12 w-full rounded-xl border-border bg-background/60 px-4 text-[15px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KIND_ORDER.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {coverageKindLabel[kind]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Nombre" htmlFor="coverage-name">
                <TextField
                  id="coverage-name"
                  data-ocid="coverage.name.input"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Ej. Yaguaraparo centro"
                  autoComplete="off"
                />
              </Field>

              {KIND_PARENT[draft.kind] && (
                <Field
                  label={`Pertenece a ${coverageKindLabel[KIND_PARENT[draft.kind] as CoverageKind].toLowerCase()}`}
                  htmlFor="coverage-parent"
                >
                  <Select
                    value={draft.parentId}
                    onValueChange={(value) =>
                      setDraft({ ...draft, parentId: value })
                    }
                  >
                    <SelectTrigger
                      id="coverage-parent"
                      data-ocid="coverage.parent.select"
                      className="h-12 w-full rounded-xl border-border bg-background/60 px-4 text-[15px]"
                    >
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentOptions.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          Sin opciones disponibles
                        </SelectItem>
                      ) : (
                        parentOptions.map((option) => (
                          <SelectItem
                            key={option.id.toString()}
                            value={option.id.toString()}
                          >
                            {option.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              )}

              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Activa
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Disponible para asignar clientes
                  </p>
                </div>
                <Switch
                  data-ocid="coverage.active.switch"
                  checked={draft.active}
                  onCheckedChange={(checked) =>
                    setDraft({ ...draft, active: checked })
                  }
                  aria-label="Ubicación activa"
                />
              </div>

              {formError && <InlineError message={formError} />}
            </div>
          )}

          <DialogFooter className="gap-2">
            <SecondaryButton
              type="button"
              data-ocid="coverage.form.cancel_button"
              onClick={closeDraft}
              className="h-11"
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              type="button"
              data-ocid="coverage.form.submit_button"
              onClick={submitDraft}
              disabled={isSaving}
              className="h-11"
            >
              {isSaving ? "Guardando…" : "Guardar"}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent
          data-ocid="coverage.delete.dialog"
          className="surface-relief rounded-[22px] border-border/60"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Eliminar ubicación
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              ¿Seguro que quieres eliminar “{pendingDelete?.name}”? Esta acción
              no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <SecondaryButton
              type="button"
              data-ocid="coverage.delete.cancel_button"
              onClick={() => setPendingDelete(null)}
              className="h-11"
            >
              Cancelar
            </SecondaryButton>
            <Button
              type="button"
              variant="destructive"
              data-ocid="coverage.delete.confirm_button"
              onClick={confirmDelete}
              disabled={deleteCoverage.isPending}
              className="h-11 rounded-2xl font-semibold press-tactile"
            >
              {deleteCoverage.isPending ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
