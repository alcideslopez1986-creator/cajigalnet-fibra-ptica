import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";

export function ErrorState({
  title = "No pudimos cargar la información",
  description = "Revisa tu conexión e intenta de nuevo.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      data-ocid="error_state"
      className={cn(
        "flex flex-col items-center rounded-[22px] border border-destructive/30 bg-destructive/8 px-6 py-10 text-center",
        className,
      )}
    >
      <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-destructive/15 text-destructive">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        {description}
      </p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          data-ocid="error.retry_button"
          onClick={onRetry}
          className="mt-5 h-11 rounded-2xl border-border bg-card px-5"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Reintentar
        </Button>
      )}
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      data-ocid="form.error_state"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

export function NoResults({ message }: { message: string }) {
  return (
    <div
      data-ocid="empty_state"
      className="flex flex-col items-center rounded-[22px] border border-dashed border-border/70 px-6 py-10 text-center"
    >
      <Inbox className="mb-3 size-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
