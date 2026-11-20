import { AppFooter, PageShell } from "@/components/layout/PageShell";
import { Outlet } from "@tanstack/react-router";

/** Public shell for the landing, sign-in, recovery and installation pages. */
export function PublicLayout() {
  return (
    <div className="min-h-dvh bg-background">
      <main className="animate-slide-in-view">
        <PageShell withNav={false}>
          <Outlet />
        </PageShell>
        <AppFooter />
      </main>
    </div>
  );
}
