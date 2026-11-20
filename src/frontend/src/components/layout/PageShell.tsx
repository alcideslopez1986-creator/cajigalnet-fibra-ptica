import { cn } from "@/lib/utils";
import type * as React from "react";

/** Mobile-first page frame: max-width column, gutters, room for the bottom nav. */
export function PageShell({
  children,
  className,
  withNav = true,
}: {
  children: React.ReactNode;
  className?: string;
  withNav?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md px-4 pt-4",
        withNav ? "pb-32" : "pb-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AppFooter() {
  return (
    <footer className="mx-auto w-full max-w-md px-4 pb-6 pt-2 text-center">
      <p className="text-[11px] text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-accent underline-offset-2 hover:underline"
        >
          caffeine.ai
        </a>
      </p>
    </footer>
  );
}
