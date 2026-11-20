import { Avatar } from "@/components/shared/Avatar";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bell } from "lucide-react";
import type * as React from "react";

/** Sticky app header: wordmark or back control on the left, identity on the right. */
export function AppHeader({
  title,
  subtitle,
  avatarName,
  backTo,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  avatarName?: string;
  backTo?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border/70 bg-card/85 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-3">
        {backTo ? (
          <Link
            to={backTo}
            data-ocid="nav.back_link"
            aria-label="Volver"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-background/60 text-foreground press-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[17px] font-bold tracking-tight text-foreground">
            {title}
          </p>
          {subtitle && (
            <p className="truncate text-[11px] text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {right}
        {avatarName ? (
          <Avatar name={avatarName} className="size-9" />
        ) : (
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border/70 bg-background/60 text-muted-foreground">
            <Bell className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </header>
  );
}
