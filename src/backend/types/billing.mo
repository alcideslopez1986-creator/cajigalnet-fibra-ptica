import Common "common";

module {
  public type AccountId = Common.AccountId;
  public type PaymentId = Common.PaymentId;
  public type InvoiceId = Common.InvoiceId;
  public type ClientId = Common.ClientId;
  public type Timestamp = Common.Timestamp;

  /// Payment method of a receiving account or a reported payment.
  public type PaymentMethod = {
    #pagoMovil;
    #transferenciaBs;
    #divisas;
    #zelle;
    #usdt;
  };

  /// A receiving account configured by the administrator.
  public type PaymentAccount = {
    id : AccountId;
    method : PaymentMethod;
    bank : Text;
    holder : Text;
    /// Cédula or RIF of the holder.
    documentId : Text;
    phone : Text;
    accountNumber : Text;
    active : Bool;
  };

  public type PaymentAccountInput = {
    method : PaymentMethod;
    bank : Text;
    holder : Text;
    documentId : Text;
    phone : Text;
    accountNumber : Text;
    active : Bool;
  };

  public type PaymentStatus = {
    #pendiente;
    #aprobado;
    #rechazado;
  };

  /// A payment reported by a client.
  public type PaymentReport = {
    id : PaymentId;
    clientId : ClientId;
    accountId : AccountId;
    reference : Text;
    amountUsd : Nat;
    amountBs : Nat;
    paidAt : Timestamp;
    method : PaymentMethod;
    status : PaymentStatus;
    createdAt : Timestamp;
  };

  public type PaymentReportInput = {
    accountId : AccountId;
    reference : Text;
    amountUsd : Nat;
    amountBs : Nat;
    paidAt : Timestamp;
    method : PaymentMethod;
  };

  public type InvoiceStatus = {
    #emitida;
    #pagada;
    #anulada;
  };

  /// A digital invoice with a correlative number.
  public type Invoice = {
    id : InvoiceId;
    number : Text;
    clientId : ClientId;
    period : Text;
    planName : Text;
    contractedMegabits : Nat;
    amountUsd : Nat;
    amountBs : Nat;
    bcvRate : Nat;
    status : InvoiceStatus;
    issuedAt : Timestamp;
  };

  /// Confirmation receipt issued when a payment is approved.
  public type PaymentReceipt = {
    invoiceId : InvoiceId;
    invoiceNumber : Text;
    paymentId : PaymentId;
    clientId : ClientId;
    amountUsd : Nat;
    amountBs : Nat;
    bcvRate : Nat;
    approvedAt : Timestamp;
    whatsappUrl : Text;
  };
};
