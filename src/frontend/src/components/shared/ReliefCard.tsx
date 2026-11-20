import { cn } from "@/lib/utils";
import type * as React from "react";

/** Relief card: gradient surface, lit top edge, soft cast shadow. */
export function ReliefCard({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "surface-relief rounded-[22px] border border-border/60",
        interactive && "press-tactile cursor-pointer hover:border-primary/40",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("mb-3 flex items-center justify-between gap-3", className)}
    >
      <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {action}
    </div>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
