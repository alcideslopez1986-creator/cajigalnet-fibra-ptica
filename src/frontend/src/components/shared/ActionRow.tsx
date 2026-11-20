import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type * as React from "react";

/** Tappable row used inside relief cards for navigation and quick actions. */
export function ActionRow({
  icon,
  title,
  subtitle,
  trailing,
  onClick,
  className,
  ocid,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ocid?: string;
}) {
  const content = (
    <>
      {icon && (
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-accent">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[15px] font-semibold text-foreground">
          {title}
        </span>
        {subtitle && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </span>
      {trailing ?? (
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (!onClick) {
    return (
      <div className={cn("flex items-center gap-3 px-4 py-3", className)}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={cn(
        "press-tactile flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {content}
    </button>
  );
}
