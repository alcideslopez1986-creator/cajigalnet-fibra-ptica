import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type * as React from "react";

/** Header for public pages: back control plus the Cajigalnet wordmark. */
export function PublicHeader({
  backTo,
  className,
}: {
  backTo?: string;
  className?: string;
}) {
  return (
    <header className={cn("flex items-center gap-3 py-2", className)}>
      {backTo ? (
        <Link
          to={backTo}
          data-ocid="nav.back_link"
          aria-label="Volver"
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-card text-foreground press-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
      <Link
        to="/"
        data-ocid="nav.home_link"
        className="font-display text-lg font-bold tracking-tight text-foreground"
      >
        Cajigal<span className="text-accent">net</span>
      </Link>
    </header>
  );
}

export function PublicPageTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 mt-4 space-y-2">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="surface-relief rounded-[22px] border border-border/60 p-5">
      {children}
    </div>
  );
}
