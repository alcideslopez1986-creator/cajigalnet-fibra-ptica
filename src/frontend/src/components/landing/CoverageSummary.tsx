import { CoverageKind } from "@/backend";
import { useCoverageByKind } from "@/hooks/useQueries";
import { coverageKindPlural } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

const kinds: CoverageKind[] = [
  CoverageKind.parroquia,
  CoverageKind.pueblo,
  CoverageKind.sector,
];

/** Live coverage summary for the Municipio Cajigal, grouped by level. */
export function CoverageSummary({ className }: { className?: string }) {
  const parroquias = useCoverageByKind(CoverageKind.parroquia);
  const pueblos = useCoverageByKind(CoverageKind.pueblo);
  const sectores = useCoverageByKind(CoverageKind.sector);

  const counts: Record<CoverageKind, number | null> = {
    [CoverageKind.parroquia]: parroquias.data
      ? parroquias.data.filter((entry) => entry.active).length
      : null,
    [CoverageKind.pueblo]: pueblos.data
      ? pueblos.data.filter((entry) => entry.active).length
      : null,
    [CoverageKind.sector]: sectores.data
      ? sectores.data.filter((entry) => entry.active).length
      : null,
  };

  const isLoading =
    parroquias.isLoading || pueblos.isLoading || sectores.isLoading;

  return (
    <div
      data-ocid="landing.coverage_panel"
      className={cn("grid grid-cols-3 gap-2", className)}
    >
      {kinds.map((kind) => (
        <div
          key={kind}
          className="rounded-2xl border border-border/60 bg-background/40 px-2 py-3 text-center"
        >
          <MapPin className="mx-auto size-3.5 text-accent" aria-hidden="true" />
          <p className="mt-1.5 font-display text-xl font-bold tabular-nums text-foreground">
            {isLoading ? (
              <span className="inline-block h-5 w-8 animate-pulse rounded bg-muted align-middle" />
            ) : (
              (counts[kind] ?? 0)
            )}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {coverageKindPlural[kind]}
          </p>
        </div>
      ))}
    </div>
  );
}
