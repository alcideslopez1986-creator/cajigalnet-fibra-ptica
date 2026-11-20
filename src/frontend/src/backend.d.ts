import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type AccountId = bigint;
export interface AdminNotice {
    id: NoticeId;
    title: string;
    clientId?: ClientId;
    body: string;
    createdAt: Timestamp;
}
export interface AdminSession {
    token: string;
    expiresAt: Timestamp;
}
export interface BcvRate {
    value: bigint;
    updatedAt: Timestamp;
    valueDate: string;
    manual: boolean;
}
export interface Cell {
    value: Value;
    name: string;
}
export type ClientId = bigint;
export interface ClientInput {
    graceDays: bigint;
    contractedMegabits: bigint;
    parishId: CoverageId;
    username: string;
    cutOffDay: bigint;
    password: string;
    fullName: string;
    monthlyPriceUsd: bigint;
    townId: CoverageId;
    phone: string;
    sectorId: CoverageId;
    planName: string;
    cedula: string;
}
export interface ClientView {
    id: ClientId;
    graceDays: bigint;
    status: ServiceStatus;
    contractedMegabits: bigint;
    parishId: CoverageId;
    username: string;
    cutOffDay: bigint;
    periodTrafficMb: bigint;
    fullName: string;
    statusChangedAt: Timestamp;
    monthlyPriceUsd: bigint;
    townId: CoverageId;
    phone: string;
    sectorId: CoverageId;
    planName: string;
    cedula: string;
}
export interface CoverageEntry {
    id: CoverageId;
    active: boolean;
    kind: CoverageKind;
    name: string;
    parentId?: CoverageId;
}
export type CoverageId = bigint;
export interface CoverageInput {
    active: boolean;
    kind: CoverageKind;
    name: string;
    parentId?: CoverageId;
}
export interface DashboardMetrics {
    pendingPayments: bigint;
    suspendedClients: bigint;
    activeClients: bigint;
    monthlyIncomeBs: bigint;
    monthlyIncomeUsd: bigint;
    dueSoonClients: bigint;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface HttpHeader {
    value: string;
    name: string;
}
export interface HttpRequestResult {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export interface InstallRequest {
    id: InstallRequestId;
    status: InstallRequestStatus;
    parishId: CoverageId;
    createdAt: Timestamp;
    reference: string;
    fullName: string;
    townId: CoverageId;
    phone: string;
    sectorId: CoverageId;
    cedula: string;
}
export type InstallRequestId = bigint;
export interface InstallRequestInput {
    parishId: CoverageId;
    fullName: string;
    townId: CoverageId;
    phone: string;
    sectorId: CoverageId;
    cedula: string;
}
export interface Invoice {
    id: InvoiceId;
    status: InvoiceStatus;
    clientId: ClientId;
    contractedMegabits: bigint;
    period: string;
    amountBs: bigint;
    number: string;
    bcvRate: bigint;
    amountUsd: bigint;
    issuedAt: Timestamp;
    planName: string;
}
export type InvoiceId = bigint;
export interface LoginInput {
    password: string;
    identifier: string;
}
export type NoticeId = bigint;
export interface NoticeInput {
    title: string;
    clientId?: ClientId;
    body: string;
}
export interface PaymentAccount {
    id: AccountId;
    method: PaymentMethod;
    active: boolean;
    bank: string;
    documentId: string;
    accountNumber: string;
    phone: string;
    holder: string;
}
export interface PaymentAccountInput {
    method: PaymentMethod;
    active: boolean;
    bank: string;
    documentId: string;
    accountNumber: string;
    phone: string;
    holder: string;
}
export type PaymentId = bigint;
export interface PaymentReceipt {
    clientId: ClientId;
    whatsappUrl: string;
    approvedAt: Timestamp;
    invoiceId: InvoiceId;
    amountBs: bigint;
    invoiceNumber: string;
    paymentId: PaymentId;
    bcvRate: bigint;
    amountUsd: bigint;
}
export interface PaymentReport {
    id: PaymentId;
    status: PaymentStatus;
    method: PaymentMethod;
    clientId: ClientId;
    accountId: AccountId;
    createdAt: Timestamp;
    reference: string;
    amountBs: bigint;
    amountUsd: bigint;
    paidAt: Timestamp;
}
export interface PaymentReportInput {
    method: PaymentMethod;
    accountId: AccountId;
    reference: string;
    amountBs: bigint;
    amountUsd: bigint;
    paidAt: Timestamp;
}
export interface RecoveryInput {
    phone: string;
    cedula: string;
}
export interface RecoveryTicket {
    whatsappUrl: string;
    code: string;
    message: string;
}
export interface ResetInput {
    code: string;
    newPassword: string;
    phone: string;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface SupportTicket {
    id: TicketId;
    status: TicketStatus;
    clientId: ClientId;
    adminReply?: string;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
    category: TicketCategory;
}
export type TicketId = bigint;
export interface TicketInput {
    description: string;
    category: TicketCategory;
}
export type Timestamp = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: HttpRequestResult;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum CoverageKind {
    parroquia = "parroquia",
    sector = "sector",
    pueblo = "pueblo"
}
export enum InstallRequestStatus {
    rechazada = "rechazada",
    pendiente = "pendiente",
    aprobada = "aprobada"
}
export enum InvoiceStatus {
    anulada = "anulada",
    emitida = "emitida",
    pagada = "pagada"
}
export enum PaymentMethod {
    usdt = "usdt",
    divisas = "divisas",
    zelle = "zelle",
    pagoMovil = "pagoMovil",
    transferenciaBs = "transferenciaBs"
}
export enum PaymentStatus {
    rechazado = "rechazado",
    pendiente = "pendiente",
    aprobado = "aprobado"
}
export enum ServiceStatus {
    activo = "activo",
    porVencer = "porVencer",
    suspendido = "suspendido"
}
export enum TicketCategory {
    cambioClaveWifi = "cambioClaveWifi",
    sinServicio = "sinServicio",
    otro = "otro",
    lentitud = "lentitud",
    luzRojaLos = "luzRojaLos"
}
export enum TicketStatus {
    resuelto = "resuelto",
    enProceso = "enProceso",
    abierto = "abierto"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminSignIn(masterKey: string): Promise<AdminSession | null>;
    /**
     * / Administrative: approves a payment and issues its receipt.
     */
    approvePayment(adminToken: string, paymentId: bigint): Promise<PaymentReceipt | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clientSignIn(input: LoginInput): Promise<ClientView | null>;
    /**
     * / Administrative: creates a client.
     */
    createClient(adminToken: string, input: ClientInput): Promise<ClientView>;
    /**
     * / Administrative: creates a parish, town or sector.
     */
    createCoverage(adminToken: string, input: CoverageInput): Promise<CoverageEntry>;
    /**
     * / Public: a visitor requests an installation.
     */
    createInstallRequest(input: InstallRequestInput): Promise<InstallRequest>;
    /**
     * / Administrative: publishes a notice.
     */
    createNotice(adminToken: string, input: NoticeInput): Promise<AdminNotice>;
    /**
     * / Administrative: creates a receiving account.
     */
    createPaymentAccount(adminToken: string, input: PaymentAccountInput): Promise<PaymentAccount>;
    /**
     * / Client: opens a support ticket for the caller's own record.
     */
    createTicket(clientToken: string, input: TicketInput): Promise<SupportTicket>;
    /**
     * / Administrative: deletes a client.
     */
    deleteClient(adminToken: string, id: bigint): Promise<boolean>;
    /**
     * / Administrative: deletes a coverage entry.
     */
    deleteCoverage(adminToken: string, id: bigint): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getBcvRate(): Promise<BcvRate>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Administrative: reads any client by id.
     */
    getClient(adminToken: string, id: bigint): Promise<ClientView | null>;
    /**
     * / Administrative: dashboard indicators.
     */
    getDashboardMetrics(adminToken: string): Promise<DashboardMetrics>;
    /**
     * / Client: reads only the caller's own record.
     */
    getMyClient(clientToken: string): Promise<ClientView>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Administrative: issues an invoice for a client.
     */
    issueInvoice(adminToken: string, clientId: bigint, period: string, amountUsd: bigint, amountBs: bigint, bcvRate: bigint): Promise<Invoice>;
    /**
     * / Administrative: lists every support ticket.
     */
    listAllTickets(adminToken: string): Promise<Array<SupportTicket>>;
    /**
     * / Client: lists the caller's own invoices.
     */
    listClientInvoices(clientToken: string): Promise<Array<Invoice>>;
    /**
     * / Client: lists the caller's own notices.
     */
    listClientNotices(clientToken: string): Promise<Array<AdminNotice>>;
    /**
     * / Client: lists the caller's own payment reports.
     */
    listClientPayments(clientToken: string): Promise<Array<PaymentReport>>;
    /**
     * / Client: lists the caller's own tickets.
     */
    listClientTickets(clientToken: string): Promise<Array<SupportTicket>>;
    /**
     * / Administrative: lists every client.
     */
    listClients(adminToken: string): Promise<Array<ClientView>>;
    listCoverage(): Promise<Array<CoverageEntry>>;
    listCoverageByKind(kind: CoverageKind): Promise<Array<CoverageEntry>>;
    listCoverageChildren(parentId: bigint): Promise<Array<CoverageEntry>>;
    /**
     * / Administrative: lists installation requests.
     */
    listInstallRequests(adminToken: string): Promise<Array<InstallRequest>>;
    /**
     * / Public: the receiving accounts the administrator has configured.
     */
    listPaymentAccounts(): Promise<Array<PaymentAccount>>;
    /**
     * / Administrative: payment reports awaiting validation.
     */
    listPendingPayments(adminToken: string): Promise<Array<PaymentReport>>;
    /**
     * / Fetches the official BCV rate from bcv.today and stores it as automatic.
     */
    refreshBcvRate(): Promise<BcvRate>;
    /**
     * / Administrative: rejects a payment report.
     */
    rejectPayment(adminToken: string, paymentId: bigint): Promise<PaymentReport | null>;
    /**
     * / Administrative: replies to a ticket and updates its status.
     */
    replyTicket(adminToken: string, id: bigint, adminReply: string, status: TicketStatus): Promise<SupportTicket | null>;
    /**
     * / Client: reports a payment for the caller's own record.
     */
    reportPayment(clientToken: string, input: PaymentReportInput): Promise<PaymentReport>;
    requestPasswordRecovery(input: RecoveryInput): Promise<RecoveryTicket | null>;
    resetPassword(input: ResetInput): Promise<boolean>;
    schema(): Promise<string>;
    /**
     * / Administrative: searches clients by name, cédula, town or sector.
     */
    searchClients(adminToken: string, term: string): Promise<Array<ClientView>>;
    /**
     * / Idempotently seeds the Municipio Cajigal catalog when empty.
     */
    seedCoverage(): Promise<Array<CoverageEntry>>;
    setBcvRateAutomatic(value: bigint, valueDate: string): Promise<BcvRate>;
    setBcvRateManual(value: bigint, valueDate: string): Promise<BcvRate>;
    /**
     * / Administrative: suspends or reactivates a client's service.
     */
    setClientStatus(adminToken: string, id: bigint, status: ServiceStatus): Promise<ClientView | null>;
    /**
     * / Administrative: approves or rejects an installation request.
     */
    setInstallRequestStatus(adminToken: string, id: bigint, status: InstallRequestStatus): Promise<InstallRequest | null>;
    /**
     * / Administrative: activates or deactivates a receiving account.
     */
    setPaymentAccountActive(adminToken: string, id: bigint, active: boolean): Promise<PaymentAccount | null>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    /**
     * / Administrative: updates a client.
     */
    updateClient(adminToken: string, id: bigint, input: ClientInput): Promise<ClientView | null>;
    /**
     * / Administrative: updates a coverage entry.
     */
    updateCoverage(adminToken: string, id: bigint, input: CoverageInput): Promise<CoverageEntry | null>;
    /**
     * / Administrative: updates a receiving account.
     */
    updatePaymentAccount(adminToken: string, id: bigint, input: PaymentAccountInput): Promise<PaymentAccount | null>;
}
