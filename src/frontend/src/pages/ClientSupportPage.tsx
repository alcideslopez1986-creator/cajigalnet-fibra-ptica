import { type SupportTicket, TicketCategory, TicketStatus } from "@/backend";
import { PrimaryButton } from "@/components/shared/ActionButtons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState, InlineError } from "@/components/shared/ErrorState";
import { Field } from "@/components/shared/Field";
import { ListSkeleton } from "@/components/shared/LoadingSkeletons";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import { type Tone, ToneBadge } from "@/components/shared/StatusBadge";
import { Textarea } from "@/components/ui/textarea";
import { useClientTickets, useCreateTicket } from "@/hooks/useQueries";
import { formatDateTime } from "@/lib/format";
import { ticketCategoryLabel, ticketStatusLabel } from "@/lib/labels";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import {
  CalendarClock,
  CheckCircle2,
  LifeBuoy,
  MessageSquareReply,
  Send,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORY_OPTIONS: {
  value: TicketCategory;
  icon: typeof WifiOff;
  hint: string;
}[] = [
  {
    value: TicketCategory.sinServicio,
    icon: WifiOff,
    hint: "No tengo internet",
  },
  {
    value: TicketCategory.luzRojaLos,
    icon: Zap,
    hint: "Luz roja en el LOS",
  },
  {
    value: TicketCategory.lentitud,
    icon: Wifi,
    hint: "Navega lento",
  },
  {
    value: TicketCategory.cambioClaveWifi,
    icon: LifeBuoy,
    hint: "Nueva clave WiFi",
  },
];

const statusTone: Record<TicketStatus, Tone> = {
  [TicketStatus.abierto]: "warning",
  [TicketStatus.enProceso]: "primary",
  [TicketStatus.resuelto]: "success",
};

const statusIcon: Record<TicketStatus, typeof CheckCircle2> = {
  [TicketStatus.abierto]: CalendarClock,
  [TicketStatus.enProceso]: MessageSquareReply,
  [TicketStatus.resuelto]: CheckCircle2,
};

function TicketCard({
  ticket,
  index,
}: { ticket: SupportTicket; index: number }) {
  const StatusIcon = statusIcon[ticket.status];
  return (
    <ReliefCard data-ocid={`support.ticket.item.${index + 1}`} className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-foreground">
            {ticketCategoryLabel[ticket.category]}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5" aria-hidden="true" />
            {formatDateTime(ticket.createdAt)}
          </p>
        </div>
        <ToneBadge tone={statusTone[ticket.status]} className="shrink-0">
          <StatusIcon className="size-3.5" aria-hidden="true" />
          {ticketStatusLabel[ticket.status]}
        </ToneBadge>
      </div>

      <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-foreground/85">
        {ticket.description}
      </p>

      {ticket.adminReply ? (
        <div className="mt-3 rounded-2xl border border-primary/25 bg-primary/8 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            <MessageSquareReply className="size-3.5" aria-hidden="true" />
            Respuesta del equipo
          </p>
          <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-foreground">
            {ticket.adminReply}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-xs italic text-muted-foreground">
          Aún sin respuesta del equipo técnico.
        </p>
      )}
    </ReliefCard>
  );
}

/** Client technical support: report a failure and follow each ticket. */
export function ClientSupportPage() {
  const client = useSession((state) => state.client);
  const clientId = client?.id ?? null;
  const ticketsQuery = useClientTickets(clientId);
  const createTicket = useCreateTicket();

  const [category, setCategory] = useState<TicketCategory>(
    TicketCategory.sinServicio,
  );
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = description.trim();
  const descriptionError =
    touched && trimmed.length < 10
      ? "Describe la falla con al menos 10 caracteres."
      : undefined;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!clientId || trimmed.length < 10) return;

    const captured = trimmed;
    setDescription("");
    setTouched(false);
    createTicket.mutate(
      { clientId, input: { category, description: captured } },
      {
        onSuccess: () => {
          toast.success("Ticket enviado", {
            description: "El equipo técnico revisará tu reporte.",
          });
        },
        onError: () => {
          setDescription((current) => (current === "" ? captured : current));
          toast.error("No pudimos enviar el ticket", {
            description: "Revisa tu conexión e intenta de nuevo.",
          });
        },
      },
    );
  }

  const tickets = ticketsQuery.data ?? [];

  return (
    <div data-ocid="client_support.page" className="space-y-6">
      <div>
        <SectionTitle title="Soporte técnico" className="mb-1" />
        <p className="text-sm text-muted-foreground">
          Reporta una falla y sigue la respuesta del equipo en cada ticket.
        </p>
      </div>

      <ReliefCard className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <fieldset className="space-y-2">
            <legend className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Tipo de falla
            </legend>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = category === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    data-ocid={`support.category.${option.value}`}
                    aria-pressed={active}
                    onClick={() => setCategory(option.value)}
                    className={cn(
                      "press-tactile flex flex-col items-start gap-1.5 rounded-2xl border p-3 text-left transition-colors",
                      active
                        ? "border-primary/60 bg-primary/12 shadow-primary-lift"
                        : "border-border/70 bg-background/50 hover:border-primary/40",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-xl",
                        active
                          ? "bg-primary/20 text-accent"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <span className="text-[13px] font-semibold leading-tight text-foreground">
                      {ticketCategoryLabel[option.value]}
                    </span>
                    <span className="text-[11px] leading-tight text-muted-foreground">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field
            label="Descripción"
            htmlFor="ticket-description"
            error={descriptionError}
            hint="Cuéntanos qué ocurre, desde cuándo y qué luces ves en el equipo."
          >
            <Textarea
              id="ticket-description"
              data-ocid="support.description.textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={() => setTouched(true)}
              rows={4}
              placeholder="Ej: Desde ayer no tengo internet y el router muestra la luz LOS en rojo."
              className="min-h-24 rounded-xl border-border bg-background/60 px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary"
            />
          </Field>

          {createTicket.isError && (
            <InlineError message="No pudimos enviar el ticket. Intenta de nuevo." />
          )}

          <PrimaryButton
            type="submit"
            data-ocid="support.submit_button"
            disabled={createTicket.isPending || trimmed.length === 0}
          >
            <Send className="size-4" aria-hidden="true" />
            {createTicket.isPending ? "Enviando…" : "Enviar reporte"}
          </PrimaryButton>
        </form>
      </ReliefCard>

      <section className="space-y-3">
        <SectionTitle title="Mis tickets" />
        {ticketsQuery.isLoading ? (
          <ListSkeleton rows={3} />
        ) : ticketsQuery.isError ? (
          <ErrorState onRetry={() => void ticketsQuery.refetch()} />
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            title="Sin tickets por ahora"
            description="Cuando reportes una falla, aquí verás su estado y la respuesta del equipo técnico."
          />
        ) : (
          <div data-ocid="support.ticket.list" className="space-y-3">
            {tickets.map((ticket, index) => (
              <TicketCard
                key={ticket.id.toString()}
                ticket={ticket}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
