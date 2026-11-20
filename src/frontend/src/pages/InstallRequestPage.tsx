import { type CoverageEntry, CoverageKind } from "@/backend";
import {
  FormCard,
  PublicHeader,
  PublicPageTitle,
} from "@/components/layout/PublicHeader";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/shared/ActionButtons";
import { Field, TextField } from "@/components/shared/Field";
import {
  useCoverageByKind,
  useCoverageChildren,
  useCreateInstallRequest,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  CircleCheck,
  Loader2,
  MapPin,
  Send,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

type Step = "parish" | "town" | "sector";

const STEPS: { key: Step; label: string }[] = [
  { key: "parish", label: "Parroquia" },
  { key: "town", label: "Pueblo o comunidad" },
  { key: "sector", label: "Sector" },
];

function OptionList({
  entries,
  selectedId,
  onSelect,
  loading,
  emptyLabel,
  ocidPrefix,
}: {
  entries: CoverageEntry[];
  selectedId: bigint | null;
  onSelect: (entry: CoverageEntry) => void;
  loading: boolean;
  emptyLabel: string;
  ocidPrefix: string;
}) {
  if (loading) {
    return (
      <div
        data-ocid={`${ocidPrefix}.loading_state`}
        className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-muted-foreground"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Cargando opciones…
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p
        data-ocid={`${ocidPrefix}.empty_state`}
        className="rounded-xl border border-dashed border-border/70 px-4 py-3 text-sm text-muted-foreground"
      >
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="grid gap-2">
      {entries.map((entry, index) => {
        const selected = selectedId === entry.id;
        return (
          <li key={entry.id.toString()}>
            <button
              type="button"
              data-ocid={`${ocidPrefix}.option.${index + 1}`}
              aria-pressed={selected}
              onClick={() => onSelect(entry)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-[15px] font-medium press-tactile transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-primary/15 text-foreground shadow-primary-lift"
                  : "border-border/70 bg-background/50 text-foreground hover:border-primary/40",
              )}
            >
              <span className="min-w-0 truncate">{entry.name}</span>
              {selected ? (
                <Check
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
              ) : (
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function InstallRequestPage() {
  const [fullName, setFullName] = useState("");
  const [cedula, setCedula] = useState("");
  const [phone, setPhone] = useState("");
  const [parish, setParish] = useState<CoverageEntry | null>(null);
  const [town, setTown] = useState<CoverageEntry | null>(null);
  const [sector, setSector] = useState<CoverageEntry | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const parishes = useCoverageByKind(CoverageKind.parroquia);
  const towns = useCoverageChildren(parish?.id ?? null);
  const sectors = useCoverageChildren(town?.id ?? null);
  const createRequest = useCreateInstallRequest();

  const activeParishes = (parishes.data ?? []).filter((p) => p.active);
  const activeTowns = (towns.data ?? []).filter((t) => t.active);
  const activeSectors = (sectors.data ?? []).filter((s) => s.active);

  const canSubmit =
    fullName.trim().length > 1 &&
    cedula.trim().length > 3 &&
    phone.trim().length > 6 &&
    parish !== null &&
    town !== null &&
    sector !== null &&
    !createRequest.isPending;

  function selectParish(entry: CoverageEntry) {
    setParish(entry);
    setTown(null);
    setSector(null);
  }

  function selectTown(entry: CoverageEntry) {
    setTown(entry);
    setSector(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!parish || !town || !sector) {
      setFormError("Selecciona parroquia, pueblo y sector para continuar.");
      return;
    }
    createRequest.mutate(
      {
        fullName: fullName.trim(),
        cedula: cedula.trim(),
        phone: phone.trim(),
        parishId: parish.id,
        townId: town.id,
        sectorId: sector.id,
      },
      {
        onSuccess: (data) => setReference(data.reference),
        onError: () =>
          setFormError(
            "No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.",
          ),
      },
    );
  }

  function resetForm() {
    setReference(null);
    setFullName("");
    setCedula("");
    setPhone("");
    setParish(null);
    setTown(null);
    setSector(null);
    setFormError(null);
  }

  if (reference) {
    return (
      <div data-ocid="install.page">
        <PublicHeader backTo="/" />
        <PublicPageTitle
          title="¡Solicitud recibida!"
          description="Ya tenemos tus datos y la zona donde vives."
        />
        <FormCard>
          <div
            data-ocid="install.success_state"
            className="flex flex-col items-center gap-4 text-center"
          >
            <span className="grid size-16 place-items-center rounded-full bg-success/15 text-success">
              <CircleCheck className="size-8" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Tu número de referencia
              </p>
              <p
                data-ocid="install.reference"
                className="font-mono text-2xl font-bold tracking-tight text-foreground"
              >
                {reference}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Guarda este número. Un asesor de Cajigalnet te contactará por
              WhatsApp para coordinar la visita técnica y confirmar la
              disponibilidad en tu sector.
            </p>
            <div className="w-full space-y-2 pt-2">
              <PrimaryButton asChild>
                <Link to="/" data-ocid="install.home_button">
                  Volver al inicio
                </Link>
              </PrimaryButton>
              <SecondaryButton
                type="button"
                data-ocid="install.new_request_button"
                onClick={resetForm}
              >
                Enviar otra solicitud
              </SecondaryButton>
            </div>
          </div>
        </FormCard>
      </div>
    );
  }

  return (
    <div data-ocid="install.page">
      <PublicHeader backTo="/" />
      <PublicPageTitle
        title="Solicitar instalación"
        description="Déjanos tus datos y la zona donde vives; te contactamos para agendar la visita."
      />
      <form onSubmit={handleSubmit} noValidate>
        <FormCard>
          <div className="space-y-5">
            <div className="space-y-4">
              <Field label="Nombre y apellido" htmlFor="install-name">
                <TextField
                  id="install-name"
                  data-ocid="install.name_input"
                  placeholder="María Gómez"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Field>
              <Field label="Cédula" htmlFor="install-cedula">
                <TextField
                  id="install-cedula"
                  data-ocid="install.cedula_input"
                  placeholder="V-12345678"
                  inputMode="numeric"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                />
              </Field>
              <Field label="Teléfono" htmlFor="install-phone">
                <TextField
                  id="install-phone"
                  data-ocid="install.phone_input"
                  placeholder="0414-1234567"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
            </div>

            <div className="space-y-4 border-t border-border/60 pt-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="size-4 text-accent" aria-hidden="true" />
                Ubicación en el Municipio Cajigal
              </div>

              {STEPS.map((step, index) => {
                const isParish = step.key === "parish";
                const isTown = step.key === "town";
                const entries = isParish
                  ? activeParishes
                  : isTown
                    ? activeTowns
                    : activeSectors;
                const selectedId = isParish
                  ? (parish?.id ?? null)
                  : isTown
                    ? (town?.id ?? null)
                    : (sector?.id ?? null);
                const loading = isParish
                  ? parishes.isLoading
                  : isTown
                    ? towns.isLoading
                    : sectors.isLoading;
                const disabled = isTown ? !parish : isParish ? false : !town;
                const emptyLabel = isParish
                  ? "Aún no hay parroquias registradas."
                  : isTown
                    ? "Esta parroquia no tiene pueblos registrados."
                    : "Este pueblo no tiene sectores registrados.";

                return (
                  <div key={step.key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "grid size-6 place-items-center rounded-full text-xs font-bold",
                          selectedId !== null
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {selectedId !== null ? (
                          <Check className="size-3.5" aria-hidden="true" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        {step.label}
                      </span>
                    </div>
                    {disabled ? (
                      <p className="rounded-xl border border-dashed border-border/70 px-4 py-3 text-sm text-muted-foreground">
                        Selecciona {isTown ? "una parroquia" : "un pueblo"}{" "}
                        primero.
                      </p>
                    ) : (
                      <OptionList
                        entries={entries}
                        selectedId={selectedId}
                        onSelect={
                          isParish
                            ? selectParish
                            : isTown
                              ? selectTown
                              : setSector
                        }
                        loading={loading}
                        emptyLabel={emptyLabel}
                        ocidPrefix={`install.${step.key}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {formError && (
              <div
                data-ocid="install.error_state"
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <TriangleAlert
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{formError}</span>
              </div>
            )}

            <PrimaryButton
              type="submit"
              data-ocid="install.submit_button"
              disabled={!canSubmit}
            >
              {createRequest.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              {createRequest.isPending ? "Enviando…" : "Enviar solicitud"}
            </PrimaryButton>
          </div>
        </FormCard>
      </form>
    </div>
  );
}
