import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav, type NavItem } from "@/components/layout/BottomNav";
import { AppFooter, PageShell } from "@/components/layout/PageShell";
import { useSession } from "@/lib/session";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { CreditCard, FileText, Home, LifeBuoy } from "lucide-react";
import { useEffect } from "react";

const clientNav: NavItem[] = [
  { to: "/app", label: "Inicio", icon: Home, ocid: "nav.client.home" },
  {
    to: "/app/payments",
    label: "Pagos",
    icon: CreditCard,
    ocid: "nav.client.payments",
  },
  {
    to: "/app/invoices",
    label: "Facturas",
    icon: FileText,
    ocid: "nav.client.invoices",
  },
  {
    to: "/app/support",
    label: "Soporte",
    icon: LifeBuoy,
    ocid: "nav.client.support",
  },
];

/** Client area shell: requires a signed-in client, renders header + bottom nav. */
export function ClientLayout() {
  const client = useSession((state) => state.client);
  const navigate = useNavigate();

  useEffect(() => {
    if (!client) {
      void navigate({ to: "/ingresar", replace: true });
    }
  }, [client, navigate]);

  if (!client) return null;

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader
        title={`¡Hola, ${client.fullName.split(" ")[0]}!`}
        subtitle={client.planName}
        avatarName={client.fullName}
      />
      <main className="animate-slide-in-view">
        <PageShell>
          <Outlet />
        </PageShell>
        <AppFooter />
      </main>
      <BottomNav items={clientNav} />
    </div>
  );
}
