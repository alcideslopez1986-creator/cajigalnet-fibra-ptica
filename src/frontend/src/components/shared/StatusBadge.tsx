import { ServiceStatus } from "@/backend";
import { serviceStatusLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

const statusStyles: Record<ServiceStatus, string> = {
  [ServiceStatus.activo]: "bg-success/15 text-success",
  [ServiceStatus.porVencer]: "bg-warning/18 text-warning",
  [ServiceStatus.suspendido]: "bg-destructive/15 text-destructive",
};

const dotStyles: Record<ServiceStatus, string> = {
  [ServiceStatus.activo]: "bg-success",
  [ServiceStatus.porVencer]: "bg-warning",
  [ServiceStatus.suspendido]: "bg-destructive",
};

export function StatusBadge({
  status,
  className,
  showDot = true,
}: {
  status: ServiceStatus;
  className?: string;
  showDot?: boolean;
}) {
  return (
    <span
      data-ocid={`status.badge.${status}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
        statusStyles[status],
        className,
      )}
    >
      {showDot && (
        <span className="relative flex size-1.5">
          {status === ServiceStatus.activo && (
            <span
              className={cn(
                "absolute inline-flex size-full animate-ping rounded-full opacity-70",
                dotStyles[status],
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex size-1.5 rounded-full",
              dotStyles[status],
            )}
          />
        </span>
      )}
      {serviceStatusLabel[status]}
    </span>
  );
}

export type Tone = "neutral" | "success" | "warning" | "danger" | "primary";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/18 text-warning",
  danger: "bg-destructive/15 text-destructive",
  primary: "bg-primary/15 text-accent",
};

export function ToneBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
