import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav, type NavItem } from "@/components/layout/BottomNav";
import { AppFooter, PageShell } from "@/components/layout/PageShell";
import { isAdminSessionValid, useSession } from "@/lib/session";
import { Outlet, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  LayoutDashboard,
  MapPinned,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { useEffect } from "react";

const adminNav: NavItem[] = [
  {
    to: "/admin",
    label: "Panel",
    icon: LayoutDashboard,
    ocid: "nav.admin.dashboard",
  },
  {
    to: "/admin/clients",
    label: "Clientes",
    icon: Users,
    ocid: "nav.admin.clients",
  },
  {
    to: "/admin/coverage",
    label: "Cobertura",
    icon: MapPinned,
    ocid: "nav.admin.coverage",
  },
  {
    to: "/admin/payments",
    label: "Pagos",
    icon: Wallet,
    ocid: "nav.admin.payments",
  },
  {
    to: "/admin/support",
    label: "Soporte",
    icon: Wrench,
    ocid: "nav.admin.support",
  },
  {
    to: "/admin/reports",
    label: "Reportes",
    icon: BarChart3,
    ocid: "nav.admin.reports",
  },
];

/** Administrator shell: gated on a valid master-key session token. */
export function AdminLayout() {
  const admin = useSession((state) => state.admin);
  const navigate = useNavigate();
  const valid = isAdminSessionValid(admin);

  useEffect(() => {
    if (!valid) {
      void navigate({ to: "/admin/login", replace: true });
    }
  }, [valid, navigate]);

  if (!valid) return null;

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader title="Panel Admin" subtitle="Cajigalnet · Yaguaraparo" />
      <main className="animate-slide-in-view">
        <PageShell>
          <Outlet />
        </PageShell>
        <AppFooter />
      </main>
      <BottomNav items={adminNav} />
    </div>
  );
}
