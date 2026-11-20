import {
  type InstallRequest,
  InstallRequestStatus,
  type SupportTicket,
  TicketStatus,
} from "@/backend";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAllTickets,
  useClients,
  useCoverage,
  useCreateNotice,
  useInstallRequests,
  useReplyTicket,
  useSetInstallRequestStatus,
} from "@/hooks/useQueries";
import {
  formatDate,
  formatDateTime,
  formatPhone,
  initials,
} from "@/lib/format";
import {
  installStatusLabel,
  ticketCategoryLabel,
  ticketStatusLabel,
} from "@/lib/labels";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ClipboardList,
  Megaphone,
  MessageSquareReply,
  Send,
  Wrench,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

const ticketStatusTone: Record<TicketStatus, string> = {
  [TicketStatus.abierto]: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  [TicketStatus.enProceso]:
    "bg-primary/15 text-primary-foreground border-primary/40",
  [TicketStatus.resuelto]:
    "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
};

const installStatusTone: Record<InstallRequestStatus, string> = {
  [InstallRequestStatus.pendiente]:
    "bg-amber-400/15 text-amber-300 border-amber-400/30",
  [InstallRequestStatus.aprobada]:
    "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  [InstallRequestStatus.rechazada]:
    "bg-destructive/15 text-destructive border-destructive/30",
};

const ticketStatusOptions: TicketStatus[] = [
  TicketStatus.abierto,
  TicketStatus.enProceso,
  TicketStatus.resuelto,
];

const installStatusOptions: InstallRequestStatus[] = [
  InstallRequestStatus.pendiente,
  InstallRequestStatus.aprobada,
  InstallRequestStatus.rechazada,
];

const ALL_CLIENTS = "todos";

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        tone,
      )}
    >
      {label}
    </Badge>
  );
}

function TicketCard({
  ticket,
  clientName,
  index,
}: {
  ticket: SupportTicket;
  clientName: string;
  index: number;
}) {
  const reply = useReplyTicket();
  const [draft, setDraft] = useState(ticket.adminReply ?? "");
  const [status, setStatus] = useState<TicketStatus>(ticket.status);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    reply.mutate(
      { id: ticket.id, reply: text, status },
      {
        onSuccess: () => toast.success("Respuesta enviada al cliente"),
        onError: () => toast.error("No se pudo enviar la respuesta"),
      },
    );
  }

  return (
    <ReliefCard
      data-ocid={`admin_support.ticket.item.${index}`}
      className="p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-[13px] font-bold text-accent">
            {initials(clientName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-foreground">
              {clientName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {ticketCategoryLabel[ticket.category]} ·{" "}
              {formatDateTime(ticket.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge
          label={ticketStatusLabel[ticket.status]}
          tone={ticketStatusTone[ticket.status]}
        />
      </div>

      <p className="mt-3 whitespace-pre-line break-words rounded-xl bg-background/50 p-3 text-sm leading-relaxed text-foreground/90">
        {ticket.description}
      </p>

      {ticket.adminReply ? (
        <div className="mt-3 rounded-xl border border-emerald-400/25 bg-emerald-400/8 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
            <MessageSquareReply className="size-3.5" aria-hidden="true" />
            Respuesta enviada
          </p>
          <p className="mt-1 whitespace-pre-line break-words text-sm text-foreground/90">
            {ticket.adminReply}
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label
            htmlFor={`ticket-reply-${ticket.id}`}
            className="text-xs font-medium text-muted-foreground"
          >
            Respuesta al cliente
          </Label>
          <Textarea
            id={`ticket-reply-${ticket.id}`}
            data-ocid={`admin_support.ticket.reply_input.${index}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Explica la solución o el paso siguiente…"
            rows={2}
            className="resize-none bg-background/60"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as TicketStatus)}
          >
            <SelectTrigger
              data-ocid={`admin_support.ticket.status_select.${index}`}
              className="w-full bg-background/60 sm:w-44"
              aria-label="Estado del ticket"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ticketStatusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {ticketStatusLabel[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="submit"
            data-ocid={`admin_support.ticket.reply_button.${index}`}
            disabled={reply.isPending || draft.trim().length === 0}
            className="press-tactile rounded-full bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110"
          >
            <Send className="size-4" aria-hidden="true" />
            {reply.isPending ? "Enviando…" : "Enviar respuesta"}
          </Button>
        </div>
      </form>
    </ReliefCard>
  );
}

function InstallRequestCard({
  request,
  location,
  index,
}: {
  request: InstallRequest;
  location: string;
  index: number;
}) {
  const setStatus = useSetInstallRequestStatus();

  function handleChange(next: InstallRequestStatus) {
    setStatus.mutate(
      { id: request.id, status: next },
      {
        onSuccess: () => toast.success("Estado de la solicitud actualizado"),
        onError: () => toast.error("No se pudo actualizar la solicitud"),
      },
    );
  }

  return (
    <ReliefCard
      data-ocid={`admin_support.install.item.${index}`}
      className="p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold tracking-wide text-accent">
            {request.reference}
          </p>
          <p className="mt-1 truncate text-[15px] font-semibold text-foreground">
            {request.fullName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            C.I. {request.cedula} · {formatPhone(request.phone)}
          </p>
        </div>
        <StatusBadge
          label={installStatusLabel[request.status]}
          tone={installStatusTone[request.status]}
        />
      </div>

      <div className="mt-3 rounded-xl bg-background/50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Ubicación solicitada
        </p>
        <p className="mt-1 break-words text-sm text-foreground/90">
          {location}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Recibida el {formatDate(request.createdAt)}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-muted-foreground">Cambiar estado</span>
        <Select
          value={request.status}
          onValueChange={(value) => handleChange(value as InstallRequestStatus)}
          disabled={setStatus.isPending}
        >
          <SelectTrigger
            data-ocid={`admin_support.install.status_select.${index}`}
            className="w-full bg-background/60 sm:w-44"
            aria-label="Estado de la solicitud de instalación"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {installStatusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {installStatusLabel[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </ReliefCard>
  );
}

function NoticeComposer() {
  const clients = useClients();
  const createNotice = useCreateNotice();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<string>(ALL_CLIENTS);

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    const payload = {
      title: title.trim(),
      body: body.trim(),
      clientId: target === ALL_CLIENTS ? undefined : BigInt(target),
    };
    createNotice.mutate(payload, {
      onSuccess: () => {
        toast.success(
          target === ALL_CLIENTS
            ? "Aviso publicado para todos los clientes"
            : "Aviso enviado al cliente",
        );
        setTitle("");
        setBody("");
        setTarget(ALL_CLIENTS);
      },
      onError: () => toast.error("No se pudo publicar el aviso"),
    });
  }

  return (
    <ReliefCard className="p-4 sm:p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="notice-title" className="text-xs font-medium">
            Título
          </Label>
          <Input
            id="notice-title"
            data-ocid="admin_support.notice.title_input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Mantenimiento programado"
            className="bg-background/60"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notice-body" className="text-xs font-medium">
            Mensaje
          </Label>
          <Textarea
            id="notice-body"
            data-ocid="admin_support.notice.body_input"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Escribe el aviso que verá el cliente en su panel…"
            rows={4}
            className="resize-none bg-background/60"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notice-target" className="text-xs font-medium">
            Destinatario
          </Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger
              id="notice-target"
              data-ocid="admin_support.notice.target_select"
              className="w-full bg-background/60"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CLIENTS}>Todos los clientes</SelectItem>
              {(clients.data ?? []).map((client) => (
                <SelectItem
                  key={client.id.toString()}
                  value={client.id.toString()}
                >
                  {client.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          data-ocid="admin_support.notice.submit_button"
          disabled={createNotice.isPending || !canSubmit}
          className="press-tactile w-full rounded-full bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110"
        >
          <Megaphone className="size-4" aria-hidden="true" />
          {createNotice.isPending ? "Publicando…" : "Publicar aviso"}
        </Button>
      </form>
    </ReliefCard>
  );
}

/** Administrator support view: technical tickets, installation requests and notices. */
export function AdminSupportPage() {
  const tickets = useAllTickets();
  const installRequests = useInstallRequests();
  const clients = useClients();
  const coverage = useCoverage();

  const clientNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const client of clients.data ?? []) {
      map.set(client.id.toString(), client.fullName);
    }
    return map;
  }, [clients.data]);

  const coverageNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of coverage.data ?? []) {
      map.set(entry.id.toString(), entry.name);
    }
    return map;
  }, [coverage.data]);

  const openTickets = (tickets.data ?? []).filter(
    (ticket) => ticket.status !== TicketStatus.resuelto,
  ).length;
  const pendingInstalls = (installRequests.data ?? []).filter(
    (request) => request.status === InstallRequestStatus.pendiente,
  ).length;

  return (
    <div data-ocid="admin_support.page" className="space-y-8">
      <div>
        <SectionTitle title="Soporte" />
        <div className="grid grid-cols-2 gap-3">
          <ReliefCard className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Tickets abiertos
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">
              {openTickets}
            </p>
          </ReliefCard>
          <ReliefCard className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Instalaciones pendientes
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">
              {pendingInstalls}
            </p>
          </ReliefCard>
        </div>
      </div>

      <section data-ocid="admin_support.tickets.section">
        <SectionTitle
          title="Tickets técnicos"
          action={
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wrench className="size-3.5" aria-hidden="true" />
              {tickets.data?.length ?? 0} en total
            </span>
          }
        />
        {tickets.isLoading ? (
          <div
            data-ocid="admin_support.tickets.loading_state"
            className="space-y-3"
          >
            {["a", "b"].map((id) => (
              <div
                key={id}
                className="h-40 animate-pulse rounded-[22px] bg-muted/40"
              />
            ))}
          </div>
        ) : (tickets.data ?? []).length === 0 ? (
          <ReliefCard
            data-ocid="admin_support.tickets.empty_state"
            className="p-6 text-center"
          >
            <CheckCircle2
              className="mx-auto size-8 text-emerald-400"
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-foreground">
              Sin tickets pendientes
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Los reportes de falla de los clientes aparecerán aquí.
            </p>
          </ReliefCard>
        ) : (
          <div className="space-y-3">
            {(tickets.data ?? []).map((ticket, index) => (
              <TicketCard
                key={ticket.id.toString()}
                ticket={ticket}
                index={index + 1}
                clientName={
                  clientNames.get(ticket.clientId.toString()) ??
                  `Cliente #${ticket.clientId.toString()}`
                }
              />
            ))}
          </div>
        )}
      </section>

      <section data-ocid="admin_support.installs.section">
        <SectionTitle
          title="Solicitudes de instalación"
          action={
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ClipboardList className="size-3.5" aria-hidden="true" />
              {installRequests.data?.length ?? 0} en total
            </span>
          }
        />
        {installRequests.isLoading ? (
          <div
            data-ocid="admin_support.installs.loading_state"
            className="space-y-3"
          >
            {["a", "b"].map((id) => (
              <div
                key={id}
                className="h-36 animate-pulse rounded-[22px] bg-muted/40"
              />
            ))}
          </div>
        ) : (installRequests.data ?? []).length === 0 ? (
          <ReliefCard
            data-ocid="admin_support.installs.empty_state"
            className="p-6 text-center"
          >
            <ClipboardList
              className="mx-auto size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-foreground">
              Sin solicitudes nuevas
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Las solicitudes enviadas desde la portada llegarán aquí.
            </p>
          </ReliefCard>
        ) : (
          <div className="space-y-3">
            {(installRequests.data ?? []).map((request, index) => {
              const parish = coverageNames.get(request.parishId.toString());
              const town = coverageNames.get(request.townId.toString());
              const sector = coverageNames.get(request.sectorId.toString());
              const location =
                [parish, town, sector].filter(Boolean).join(" · ") ||
                "Ubicación no disponible";
              return (
                <InstallRequestCard
                  key={request.id.toString()}
                  request={request}
                  index={index + 1}
                  location={location}
                />
              );
            })}
          </div>
        )}
      </section>

      <section data-ocid="admin_support.notices.section">
        <SectionTitle title="Redactar aviso" />
        <NoticeComposer />
      </section>
    </div>
  );
}
