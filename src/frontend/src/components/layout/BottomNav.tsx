import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  ocid: string;
};

/** Fixed bottom navigation pill for the client and administrator areas. */
export function BottomNav({
  items,
  className,
}: {
  items: NavItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Navegación principal"
      data-ocid="nav.bottom"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]",
        className,
      )}
    >
      <div className="flex items-center justify-around gap-1 rounded-[26px] border border-border/70 bg-card/95 p-1.5 shadow-nav-float backdrop-blur-xl">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            data-ocid={item.ocid}
            activeOptions={{
              exact: item.to === "/app" || item.to === "/admin",
            }}
            className="group flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-[20px] px-2 py-1.5 text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            activeProps={{
              className:
                "bg-primary/15 text-accent shadow-[inset_0_1px_0_0_oklch(0.99_0_0/0.12)]",
            }}
          >
            <item.icon className="size-5" aria-hidden="true" />
            <span className="text-[10px] font-semibold tracking-wide">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
