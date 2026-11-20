import {
  type AdminSession,
  type BcvRate,
  type ClientInput,
  type ClientView,
  type CoverageEntry,
  type CoverageInput,
  type CoverageKind,
  type DashboardMetrics,
  type InstallRequest,
  type InstallRequestInput,
  type InstallRequestStatus,
  type Invoice,
  type LoginInput,
  type NoticeInput,
  type PaymentAccount,
  type PaymentAccountInput,
  type PaymentReceipt,
  type PaymentReport,
  type PaymentReportInput,
  type RecoveryInput,
  type RecoveryTicket,
  type ResetInput,
  type ServiceStatus,
  type SupportTicket,
  type TicketInput,
  type TicketStatus,
  createActor,
} from "@/backend";
import { useSession } from "@/lib/session";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const queryKeys = {
  clients: ["clients"] as const,
  client: (id: bigint) => ["client", id.toString()] as const,
  clientSearch: (term: string) => ["clients", "search", term] as const,
  coverage: ["coverage"] as const,
  coverageByKind: (kind: CoverageKind) => ["coverage", "kind", kind] as const,
  coverageChildren: (parentId: bigint) =>
    ["coverage", "children", parentId.toString()] as const,
  paymentAccounts: ["payment-accounts"] as const,
  clientPayments: (clientId: bigint) =>
    ["payments", "client", clientId.toString()] as const,
  pendingPayments: ["payments", "pending"] as const,
  clientInvoices: (clientId: bigint) =>
    ["invoices", "client", clientId.toString()] as const,
  bcvRate: ["bcv-rate"] as const,
  installRequests: ["install-requests"] as const,
  clientTickets: (clientId: bigint) =>
    ["tickets", "client", clientId.toString()] as const,
  clientNotices: (clientId: bigint) =>
    ["notices", "client", clientId.toString()] as const,
  dashboard: ["dashboard"] as const,
};

function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return { actor, ready: !!actor && !isFetching };
}

/** Administrator session token, or an empty string when signed out. */
function useAdminToken(): string {
  return useSession((state) => state.admin?.token ?? "");
}

/**
 * Client session token, or an empty string when signed out. The backend
 * validates the `CLI-<id>-<expiresAt>` shape and rejects anything else, so the
 * token is minted from the signed-in client record.
 */
function useClientToken(): string {
  return useSession((state) =>
    state.client ? clientSessionToken(state.client.id) : "",
  );
}

const CLIENT_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

/** Builds the `CLI-<id>-<expiresAt>` token the backend's requireClient expects. */
function clientSessionToken(id: bigint): string {
  return `CLI-${id.toString()}-${Date.now() + CLIENT_SESSION_TTL_MS}`;
}

/* ------------------------------- Clients -------------------------------- */

export function useClients() {
  const { actor, ready } = useBackend();
  const adminToken = useAdminToken();
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: async (): Promise<ClientView[]> => {
      if (!actor) return [];
      return actor.listClients(adminToken);
    },
    enabled: ready && adminToken.length > 0,
  });
}

/**
 * The signed-in client's own record. Reads through the client-scoped
 * `getMyClient` with the client session token, so the client panel loads
 * without an administrator session.
 */
export function useClient(id: bigint | null) {
  const { actor, ready } = useBackend();
  const clientToken = useClientToken();
  return useQuery({
    queryKey: queryKeys.client(id ?? 0n),
    queryFn: async (): Promise<ClientView | null> => {
      if (!actor || id === null) return null;
      return actor.getMyClient(clientToken);
    },
    enabled: ready && id !== null && clientToken.length > 0,
  });
}

export function useSearchClients(term: string) {
  const { actor, ready } = useBackend();
  const adminToken = useAdminToken();
  const trimmed = term.trim();
  return useQuery({
    queryKey: queryKeys.clientSearch(trimmed),
    queryFn: async (): Promise<ClientView[]> => {
      if (!actor) return [];
      return actor.searchClients(adminToken, trimmed);
    },
    enabled: ready && trimmed.length > 0 && adminToken.length > 0,
  });
}

export function useCreateClient() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClientInput): Promise<ClientView> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.createClient(adminToken, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateClient() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: bigint;
      input: ClientInput;
    }): Promise<ClientView | null> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.updateClient(adminToken, vars.id, vars.input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDeleteClient() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint): Promise<boolean> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.deleteClient(adminToken, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useSetClientStatus() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: bigint;
      status: ServiceStatus;
    }): Promise<ClientView | null> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.setClientStatus(adminToken, vars.id, vars.status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

/* ------------------------------- Coverage ------------------------------- */

export function useCoverage() {
  const { actor, ready } = useBackend();
  return useQuery({
    queryKey: queryKeys.coverage,
    queryFn: async (): Promise<CoverageEntry[]> => {
      if (!actor) return [];
      return actor.listCoverage();
    },
    enabled: ready,
  });
}

export function useCoverageByKind(kind: CoverageKind) {
  const { actor, ready } = useBackend();
  return useQuery({
    queryKey: queryKeys.coverageByKind(kind),
    queryFn: async (): Promise<CoverageEntry[]> => {
      if (!actor) return [];
      return actor.listCoverageByKind(kind);
    },
    enabled: ready,
  });
}

export function useCoverageChildren(parentId: bigint | null) {
  const { actor, ready } = useBackend();
  return useQuery({
    queryKey: queryKeys.coverageChildren(parentId ?? 0n),
    queryFn: async (): Promise<CoverageEntry[]> => {
      if (!actor || parentId === null) return [];
      return actor.listCoverageChildren(parentId);
    },
    enabled: ready && parentId !== null,
  });
}

export function useCreateCoverage() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CoverageInput): Promise<CoverageEntry> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.createCoverage(adminToken, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.coverage });
    },
  });
}

export function useUpdateCoverage() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: bigint;
      input: CoverageInput;
    }): Promise<CoverageEntry | null> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.updateCoverage(adminToken, vars.id, vars.input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.coverage });
    },
  });
}

export function useDeleteCoverage() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint): Promise<boolean> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.deleteCoverage(adminToken, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.coverage });
    },
  });
}

/* -------------------------------- Access -------------------------------- */

export function useClientSignIn() {
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (input: LoginInput): Promise<ClientView | null> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.clientSignIn(input);
    },
  });
}

export function useRequestPasswordRecovery() {
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (
      input: RecoveryInput,
    ): Promise<RecoveryTicket | null> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.requestPasswordRecovery(input);
    },
  });
}

export function useResetPassword() {
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (input: ResetInput): Promise<boolean> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.resetPassword(input);
    },
  });
}

export function useAdminSignIn() {
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (masterKey: string): Promise<AdminSession | null> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.adminSignIn(masterKey);
    },
  });
}

/* -------------------------------- Billing ------------------------------- */

export function usePaymentAccounts() {
  const { actor, ready } = useBackend();
  return useQuery({
    queryKey: queryKeys.paymentAccounts,
    queryFn: async (): Promise<PaymentAccount[]> => {
      if (!actor) return [];
      return actor.listPaymentAccounts();
    },
    enabled: ready,
  });
}

export function useCreatePaymentAccount() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PaymentAccountInput): Promise<PaymentAccount> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.createPaymentAccount(adminToken, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.paymentAccounts,
      });
    },
  });
}

export function useUpdatePaymentAccount() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: bigint;
      input: PaymentAccountInput;
    }): Promise<PaymentAccount | null> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.updatePaymentAccount(adminToken, vars.id, vars.input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.paymentAccounts,
      });
    },
  });
}

export function useSetPaymentAccountActive() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: bigint;
      active: boolean;
    }): Promise<PaymentAccount | null> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.setPaymentAccountActive(adminToken, vars.id, vars.active);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.paymentAccounts,
      });
    },
  });
}

export function useReportPayment() {
  const { actor } = useBackend();
  const clientToken = useClientToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      clientId: bigint;
      input: PaymentReportInput;
    }): Promise<PaymentReport> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.reportPayment(clientToken, vars.input);
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.clientPayments(vars.clientId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.pendingPayments,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useClientPayments(clientId: bigint | null) {
  const { actor, ready } = useBackend();
  const clientToken = useClientToken();
  return useQuery({
    queryKey: queryKeys.clientPayments(clientId ?? 0n),
    queryFn: async (): Promise<PaymentReport[]> => {
      if (!actor || clientId === null) return [];
      return actor.listClientPayments(clientToken);
    },
    enabled: ready && clientId !== null && clientToken.length > 0,
  });
}

export function usePendingPayments() {
  const { actor, ready } = useBackend();
  const adminToken = useAdminToken();
  return useQuery({
    queryKey: queryKeys.pendingPayments,
    queryFn: async (): Promise<PaymentReport[]> => {
      if (!actor) return [];
      return actor.listPendingPayments(adminToken);
    },
    enabled: ready && adminToken.length > 0,
  });
}

export function useApprovePayment() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: bigint): Promise<PaymentReceipt | null> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.approvePayment(adminToken, paymentId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.pendingPayments,
      });
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useRejectPayment() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: bigint): Promise<PaymentReport | null> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.rejectPayment(adminToken, paymentId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.pendingPayments,
      });
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useIssueInvoice() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      clientId: bigint;
      period: string;
      amountUsd: bigint;
      amountBs: bigint;
      bcvRate: bigint;
    }): Promise<Invoice> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.issueInvoice(
        adminToken,
        vars.clientId,
        vars.period,
        vars.amountUsd,
        vars.amountBs,
        vars.bcvRate,
      );
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.clientInvoices(vars.clientId),
      });
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useClientInvoices(clientId: bigint | null) {
  const { actor, ready } = useBackend();
  const clientToken = useClientToken();
  return useQuery({
    queryKey: queryKeys.clientInvoices(clientId ?? 0n),
    queryFn: async (): Promise<Invoice[]> => {
      if (!actor || clientId === null) return [];
      return actor.listClientInvoices(clientToken);
    },
    enabled: ready && clientId !== null && clientToken.length > 0,
  });
}

/* --------------------------------- Rates -------------------------------- */

/** A stored rate older than this is refreshed from bcv.today on read. */
const BCV_RATE_STALE_MS = 12 * 60 * 60 * 1000;

function isBcvRateStale(rate: BcvRate | null): boolean {
  if (!rate || rate.value <= 0n) return true;
  const updatedMs = Number(rate.updatedAt / 1_000_000n);
  if (!Number.isFinite(updatedMs) || updatedMs <= 0) return true;
  return Date.now() - updatedMs > BCV_RATE_STALE_MS;
}

/**
 * The current BCV rate. When the stored rate is missing or stale, the backend
 * is asked to fetch the official rate from bcv.today before returning it.
 */
export function useBcvRate() {
  const { actor, ready } = useBackend();
  return useQuery({
    queryKey: queryKeys.bcvRate,
    queryFn: async (): Promise<BcvRate | null> => {
      if (!actor) return null;
      const stored = await actor.getBcvRate();
      if (!isBcvRateStale(stored)) return stored;
      try {
        return await actor.refreshBcvRate();
      } catch {
        return stored;
      }
    },
    enabled: ready,
    staleTime: BCV_RATE_STALE_MS,
  });
}

export function useSetBcvRateManual() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      value: bigint;
      valueDate: string;
    }): Promise<BcvRate> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.setBcvRateManual(vars.value, vars.valueDate);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bcvRate });
    },
  });
}

export function useSetBcvRateAutomatic() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      value: bigint;
      valueDate: string;
    }): Promise<BcvRate> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.setBcvRateAutomatic(vars.value, vars.valueDate);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bcvRate });
    },
  });
}

/* ------------------------------- Requests ------------------------------- */

export function useCreateInstallRequest() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: InstallRequestInput): Promise<InstallRequest> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.createInstallRequest(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.installRequests,
      });
    },
  });
}

export function useInstallRequests() {
  const { actor, ready } = useBackend();
  const adminToken = useAdminToken();
  return useQuery({
    queryKey: queryKeys.installRequests,
    queryFn: async (): Promise<InstallRequest[]> => {
      if (!actor) return [];
      return actor.listInstallRequests(adminToken);
    },
    enabled: ready && adminToken.length > 0,
  });
}

export function useSetInstallRequestStatus() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: bigint;
      status: InstallRequestStatus;
    }): Promise<InstallRequest | null> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.setInstallRequestStatus(adminToken, vars.id, vars.status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.installRequests,
      });
    },
  });
}

/* -------------------------------- Support ------------------------------- */

export function useCreateTicket() {
  const { actor } = useBackend();
  const clientToken = useClientToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      clientId: bigint;
      input: TicketInput;
    }): Promise<SupportTicket> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.createTicket(clientToken, vars.input);
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.clientTickets(vars.clientId),
      });
    },
  });
}

export function useAllTickets() {
  const { actor, ready } = useBackend();
  const adminToken = useAdminToken();
  return useQuery({
    queryKey: ["tickets", "all"] as const,
    queryFn: async (): Promise<SupportTicket[]> => {
      if (!actor) return [];
      return actor.listAllTickets(adminToken);
    },
    enabled: ready && adminToken.length > 0,
  });
}

export function useClientTickets(clientId: bigint | null) {
  const { actor, ready } = useBackend();
  const clientToken = useClientToken();
  return useQuery({
    queryKey: queryKeys.clientTickets(clientId ?? 0n),
    queryFn: async (): Promise<SupportTicket[]> => {
      if (!actor || clientId === null) return [];
      return actor.listClientTickets(clientToken);
    },
    enabled: ready && clientId !== null && clientToken.length > 0,
  });
}

export function useReplyTicket() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: bigint;
      reply: string;
      status: TicketStatus;
    }): Promise<SupportTicket | null> => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.replyTicket(adminToken, vars.id, vars.reply, vars.status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useCreateNotice() {
  const { actor } = useBackend();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NoticeInput) => {
      if (!actor) throw new Error("El sistema no está listo");
      return actor.createNotice(adminToken, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
}

export function useClientNotices(clientId: bigint | null) {
  const { actor, ready } = useBackend();
  const clientToken = useClientToken();
  return useQuery({
    queryKey: queryKeys.clientNotices(clientId ?? 0n),
    queryFn: async () => {
      if (!actor || clientId === null) return [];
      return actor.listClientNotices(clientToken);
    },
    enabled: ready && clientId !== null && clientToken.length > 0,
  });
}

/* ------------------------------- Dashboard ------------------------------ */

export function useDashboardMetrics() {
  const { actor, ready } = useBackend();
  const adminToken = useAdminToken();
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async (): Promise<DashboardMetrics | null> => {
      if (!actor) return null;
      return actor.getDashboardMetrics(adminToken);
    },
    enabled: ready && adminToken.length > 0,
  });
}
