import Char "mo:core/Char";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/billing";
import Clients "../types/clients";

module {
  public type PaymentAccount = Types.PaymentAccount;
  public type PaymentAccountInput = Types.PaymentAccountInput;
  public type PaymentReport = Types.PaymentReport;
  public type PaymentReportInput = Types.PaymentReportInput;
  public type Invoice = Types.Invoice;
  public type PaymentReceipt = Types.PaymentReceipt;
  public type Client = Clients.Client;

  /// Base URL of the Cajigalnet support WhatsApp channel.
  let supportWhatsappBase = "https://wa.me/584120000000?text=";

  /// Correlative invoice number, e.g. `FAC-000001`.
  func invoiceNumber(id : Nat) : Text {
    let digits = id.toText();
    let width = 6;
    let len = digits.size();
    let padding = if (len >= width) { "" } else {
      var acc = "";
      var i = 0;
      while (i < width - len) {
        acc := acc # "0";
        i += 1;
      };
      acc;
    };
    "FAC-" # padding # digits;
  };

  func encodeComponent(text : Text) : Text {
    var out = "";
    for (c in text.toIter()) {
      switch (c) {
        case (' ') { out := out # "%20" };
        case ('\n') { out := out # "%0A" };
        case ('?') { out := out # "%3F" };
        case ('&') { out := out # "%26" };
        case ('#') { out := out # "%23" };
        case ('%') { out := out # "%25" };
        case ('+') { out := out # "%2B" };
        case (_) { out := out # c.toText() };
      };
    };
    out;
  };

  func methodLabel(method : Types.PaymentMethod) : Text {
    switch (method) {
      case (#pagoMovil) { "Pago Móvil" };
      case (#transferenciaBs) { "Transferencia en Bs." };
      case (#divisas) { "Divisas / Efectivo" };
      case (#zelle) { "Zelle" };
      case (#usdt) { "USDT" };
    };
  };

  func accountFromInput(id : Nat, input : PaymentAccountInput) : PaymentAccount {
    {
      id;
      method = input.method;
      bank = input.bank;
      holder = input.holder;
      documentId = input.documentId;
      phone = input.phone;
      accountNumber = input.accountNumber;
      active = input.active;
    };
  };

  func byIdAscending(a : Nat, b : Nat) : { #less; #equal; #greater } {
    Nat.compare(a, b);
  };

  public func createAccount(
    accounts : Map.Map<Nat, PaymentAccount>,
    state : { var nextAccountId : Nat },
    input : PaymentAccountInput,
  ) : PaymentAccount {
    let id = state.nextAccountId;
    state.nextAccountId := id + 1;
    let account = accountFromInput(id, input);
    accounts.add(id, account);
    account;
  };

  public func updateAccount(
    accounts : Map.Map<Nat, PaymentAccount>,
    id : Nat,
    input : PaymentAccountInput,
  ) : ?PaymentAccount {
    switch (accounts.get(id)) {
      case null { null };
      case (?_) {
        let account = accountFromInput(id, input);
        accounts.add(id, account);
        ?account;
      };
    };
  };

  public func setAccountActive(
    accounts : Map.Map<Nat, PaymentAccount>,
    id : Nat,
    active : Bool,
  ) : ?PaymentAccount {
    switch (accounts.get(id)) {
      case null { null };
      case (?account) {
        let updated : PaymentAccount = { account with active };
        accounts.add(id, updated);
        ?updated;
      };
    };
  };

  public func listAccounts(accounts : Map.Map<Nat, PaymentAccount>) : [PaymentAccount] {
    let entries = accounts.entries().toArray();
    let sorted = entries.sort(func(a, b) = byIdAscending(a.0, b.0));
    sorted.map(func(entry) = entry.1);
  };

  public func reportPayment(
    payments : Map.Map<Nat, PaymentReport>,
    state : { var nextPaymentId : Nat },
    clientId : Nat,
    input : PaymentReportInput,
  ) : PaymentReport {
    let id = state.nextPaymentId;
    state.nextPaymentId := id + 1;
    let report : PaymentReport = {
      id;
      clientId;
      accountId = input.accountId;
      reference = input.reference;
      amountUsd = input.amountUsd;
      amountBs = input.amountBs;
      paidAt = input.paidAt;
      method = input.method;
      status = #pendiente;
      createdAt = Time.now();
    };
    payments.add(id, report);
    report;
  };

  public func listPayments(
    payments : Map.Map<Nat, PaymentReport>,
    clientId : Nat,
  ) : [PaymentReport] {
    let entries = payments.entries().toArray();
    let sorted = entries.sort(func(a, b) = byIdAscending(a.0, b.0));
    sorted.map(func(entry) = entry.1).filter(func(report) = report.clientId == clientId);
  };

  public func listPendingPayments(payments : Map.Map<Nat, PaymentReport>) : [PaymentReport] {
    let entries = payments.entries().toArray();
    let sorted = entries.sort(func(a, b) = byIdAscending(a.0, b.0));
    sorted.map(func(entry) = entry.1).filter(
      func(report) = switch (report.status) { case (#pendiente) { true }; case (_) { false } }
    );
  };

  /// Approves a pending payment, issuing the correlative confirmation receipt.
  public func approvePayment(
    payments : Map.Map<Nat, PaymentReport>,
    invoices : Map.Map<Nat, Invoice>,
    clients : Map.Map<Nat, Client>,
    state : { var nextInvoiceId : Nat },
    paymentId : Nat,
    bcvRate : Nat,
  ) : ?PaymentReceipt {
    switch (payments.get(paymentId)) {
      case null { null };
      case (?report) {
        switch (report.status) {
          case (#pendiente) {};
          case (_) { return null };
        };
        let approved : PaymentReport = { report with status = #aprobado };
        payments.add(paymentId, approved);

        let invoiceId = state.nextInvoiceId;
        state.nextInvoiceId := invoiceId + 1;
        let number = invoiceNumber(invoiceId);
        let now = Time.now();
        let client = clients.get(approved.clientId);
        let (planName, contractedMegabits) = switch (client) {
          case null { ("", 0) };
          case (?c) { (c.planName, c.contractedMegabits) };
        };
        let invoice : Invoice = {
          id = invoiceId;
          number;
          clientId = approved.clientId;
          period = "";
          planName;
          contractedMegabits;
          amountUsd = approved.amountUsd;
          amountBs = approved.amountBs;
          bcvRate;
          status = #pagada;
          issuedAt = now;
        };
        invoices.add(invoiceId, invoice);

        let clientName = switch (client) {
          case null { "" };
          case (?c) { c.fullName };
        };
        let message = "Cajigalnet: pago aprobado. Recibo " # number
          # (if (clientName == "") { "" } else { " - " # clientName })
          # " - USD " # approved.amountUsd.toText()
          # " / Bs. " # approved.amountBs.toText()
          # " (" # methodLabel(approved.method) # "). Gracias por su pago.";
        let whatsappUrl = supportWhatsappBase # encodeComponent(message);

        ?{
          invoiceId;
          invoiceNumber = number;
          paymentId;
          clientId = approved.clientId;
          amountUsd = approved.amountUsd;
          amountBs = approved.amountBs;
          bcvRate;
          approvedAt = now;
          whatsappUrl;
        };
      };
    };
  };

  public func rejectPayment(
    payments : Map.Map<Nat, PaymentReport>,
    paymentId : Nat,
  ) : ?PaymentReport {
    switch (payments.get(paymentId)) {
      case null { null };
      case (?report) {
        let rejected : PaymentReport = { report with status = #rechazado };
        payments.add(paymentId, rejected);
        ?rejected;
      };
    };
  };

  public func issueInvoice(
    invoices : Map.Map<Nat, Invoice>,
    clients : Map.Map<Nat, Client>,
    state : { var nextInvoiceId : Nat },
    clientId : Nat,
    period : Text,
    amountUsd : Nat,
    amountBs : Nat,
    bcvRate : Nat,
  ) : Invoice {
    let id = state.nextInvoiceId;
    state.nextInvoiceId := id + 1;
    let (planName, contractedMegabits) = switch (clients.get(clientId)) {
      case null { ("", 0) };
      case (?c) { (c.planName, c.contractedMegabits) };
    };
    let invoice : Invoice = {
      id;
      number = invoiceNumber(id);
      clientId;
      period;
      planName;
      contractedMegabits;
      amountUsd;
      amountBs;
      bcvRate;
      status = #emitida;
      issuedAt = Time.now();
    };
    invoices.add(id, invoice);
    invoice;
  };

  public func listInvoices(
    invoices : Map.Map<Nat, Invoice>,
    clientId : Nat,
  ) : [Invoice] {
    let entries = invoices.entries().toArray();
    let sorted = entries.sort(func(a, b) = byIdAscending(a.0, b.0));
    sorted.map(func(entry) = entry.1).filter(func(invoice) = invoice.clientId == clientId);
  };
};
