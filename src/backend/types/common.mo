module {
  /// Nanoseconds since the Unix epoch, as returned by `Time.now()`.
  public type Timestamp = Int;

  /// Correlative identifier for invoices, receipts, tickets and requests.
  public type RefId = Nat;

  /// Identifier of a client record.
  public type ClientId = Nat;

  /// Identifier of a coverage catalog entry (parish, town or sector).
  public type CoverageId = Nat;

  /// Identifier of a receiving payment account.
  public type AccountId = Nat;

  /// Identifier of a payment report.
  public type PaymentId = Nat;

  /// Identifier of an invoice.
  public type InvoiceId = Nat;

  /// Identifier of a support ticket.
  public type TicketId = Nat;

  /// Identifier of an installation request.
  public type InstallRequestId = Nat;

  /// Identifier of an admin notice.
  public type NoticeId = Nat;

  /// Service status shown to the client and managed by the administrator.
  public type ServiceStatus = {
    #activo;
    #porVencer;
    #suspendido;
  };

  /// Result of an operation that can fail for a caller-fixable reason.
  public type AppError = {
    #noEncontrado;
    #credencialesInvalidas;
    #noAutorizado;
    #codigoInvalido;
    #datosInvalidos : Text;
    #conflicto : Text;
  };
};
