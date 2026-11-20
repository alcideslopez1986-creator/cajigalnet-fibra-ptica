import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground shadow-primary-lift",
        className,
      )}
    >
      {initials(name) || "CN"}
    </span>
  );
}
