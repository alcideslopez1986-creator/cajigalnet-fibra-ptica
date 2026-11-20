import {
  CoverageKind,
  InstallRequestStatus,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  ServiceStatus,
  TicketCategory,
  TicketStatus,
} from "@/backend";

export const serviceStatusLabel: Record<ServiceStatus, string> = {
  [ServiceStatus.activo]: "Activo",
  [ServiceStatus.porVencer]: "Por vencer",
  [ServiceStatus.suspendido]: "Suspendido",
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  [PaymentMethod.pagoMovil]: "Pago Móvil",
  [PaymentMethod.transferenciaBs]: "Transferencia Bs.",
  [PaymentMethod.zelle]: "Zelle",
  [PaymentMethod.divisas]: "Divisas",
  [PaymentMethod.usdt]: "USDT",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  [PaymentStatus.pendiente]: "Pendiente",
  [PaymentStatus.aprobado]: "Aprobado",
  [PaymentStatus.rechazado]: "Rechazado",
};

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  [InvoiceStatus.emitida]: "Emitida",
  [InvoiceStatus.pagada]: "Pagada",
  [InvoiceStatus.anulada]: "Anulada",
};

export const ticketStatusLabel: Record<TicketStatus, string> = {
  [TicketStatus.abierto]: "Abierto",
  [TicketStatus.enProceso]: "En proceso",
  [TicketStatus.resuelto]: "Resuelto",
};

export const ticketCategoryLabel: Record<TicketCategory, string> = {
  [TicketCategory.sinServicio]: "Sin servicio",
  [TicketCategory.lentitud]: "Lentitud",
  [TicketCategory.luzRojaLos]: "Luz roja en el LOS",
  [TicketCategory.cambioClaveWifi]: "Cambio de clave WiFi",
  [TicketCategory.otro]: "Otro",
};

export const installStatusLabel: Record<InstallRequestStatus, string> = {
  [InstallRequestStatus.pendiente]: "Pendiente",
  [InstallRequestStatus.aprobada]: "Aprobada",
  [InstallRequestStatus.rechazada]: "Rechazada",
};

export const coverageKindLabel: Record<CoverageKind, string> = {
  [CoverageKind.parroquia]: "Parroquia",
  [CoverageKind.pueblo]: "Pueblo",
  [CoverageKind.sector]: "Sector",
};

export const coverageKindPlural: Record<CoverageKind, string> = {
  [CoverageKind.parroquia]: "Parroquias",
  [CoverageKind.pueblo]: "Pueblos",
  [CoverageKind.sector]: "Sectores",
};
