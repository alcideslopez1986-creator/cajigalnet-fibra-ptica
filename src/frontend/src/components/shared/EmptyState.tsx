import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type * as React from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-ocid="empty_state"
      className={cn(
        "flex flex-col items-center justify-center rounded-[22px] border border-dashed border-border/70 bg-card/40 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/12 text-accent">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
