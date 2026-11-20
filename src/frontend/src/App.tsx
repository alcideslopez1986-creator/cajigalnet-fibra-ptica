import { AdminLayout } from "@/components/layout/AdminLayout";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Toaster } from "@/components/ui/sonner";
import { AdminClientsPage } from "@/pages/AdminClientsPage";
import { AdminCoveragePage } from "@/pages/AdminCoveragePage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { AdminPaymentsPage } from "@/pages/AdminPaymentsPage";
import { AdminReportsPage } from "@/pages/AdminReportsPage";
import { AdminSupportPage } from "@/pages/AdminSupportPage";
import { ClientHomePage } from "@/pages/ClientHomePage";
import { ClientInvoicesPage } from "@/pages/ClientInvoicesPage";
import { ClientPaymentsPage } from "@/pages/ClientPaymentsPage";
import { ClientSupportPage } from "@/pages/ClientSupportPage";
import { InstallRequestPage } from "@/pages/InstallRequestPage";
import { LandingPage } from "@/pages/LandingPage";
import { RecoveryPage } from "@/pages/RecoveryPage";
import { SignInPage } from "@/pages/SignInPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </>
  ),
});

const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public",
  component: PublicLayout,
});

const landingRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/",
  component: LandingPage,
});

const signInRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/ingresar",
  component: SignInPage,
});

const recoveryRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/recuperar",
  component: RecoveryPage,
});

const installRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/instalacion",
  component: InstallRequestPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/admin/login",
  component: AdminLoginPage,
});

const clientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: ClientLayout,
});

const clientHomeRoute = createRoute({
  getParentRoute: () => clientRoute,
  path: "/",
  component: ClientHomePage,
});

const clientPaymentsRoute = createRoute({
  getParentRoute: () => clientRoute,
  path: "/payments",
  component: ClientPaymentsPage,
});

const clientInvoicesRoute = createRoute({
  getParentRoute: () => clientRoute,
  path: "/invoices",
  component: ClientInvoicesPage,
});

const clientSupportRoute = createRoute({
  getParentRoute: () => clientRoute,
  path: "/support",
  component: ClientSupportPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/",
  component: AdminDashboardPage,
});

const adminClientsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/clients",
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: AdminClientsPage,
});

const adminCoverageRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/coverage",
  component: AdminCoveragePage,
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/payments",
  component: AdminPaymentsPage,
});

const adminSupportRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/support",
  component: AdminSupportPage,
});

const adminReportsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/reports",
  component: AdminReportsPage,
});

const routeTree = rootRoute.addChildren([
  publicRoute.addChildren([
    landingRoute,
    signInRoute,
    recoveryRoute,
    installRoute,
    adminLoginRoute,
  ]),
  clientRoute.addChildren([
    clientHomeRoute,
    clientPaymentsRoute,
    clientInvoicesRoute,
    clientSupportRoute,
  ]),
  adminRoute.addChildren([
    adminDashboardRoute,
    adminClientsRoute,
    adminCoverageRoute,
    adminPaymentsRoute,
    adminSupportRoute,
    adminReportsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
