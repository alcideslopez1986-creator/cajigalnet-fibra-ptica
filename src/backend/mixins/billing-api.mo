import Map "mo:core/Map";
import Types "../types/billing";
import Clients "../types/clients";
import Rates "../types/rates";
import BillingLib "../lib/billing";
import AccessLib "../lib/access";

mixin (
  accounts : Map.Map<Nat, Types.PaymentAccount>,
  payments : Map.Map<Nat, Types.PaymentReport>,
  invoices : Map.Map<Nat, Types.Invoice>,
  clients : Map.Map<Nat, Clients.Client>,
  state : {
    var nextAccountId : Nat;
    var nextPaymentId : Nat;
    var nextInvoiceId : Nat;
    var bcvRate : Rates.BcvRate;
    var adminMasterKey : Text;
    var nextAdminToken : Nat;
  },
) {
  /// Public: the receiving accounts the administrator has configured.
  public query func listPaymentAccounts() : async [Types.PaymentAccount] {
    BillingLib.listAccounts(accounts);
  };

  /// Administrative: creates a receiving account.
  public shared func createPaymentAccount(adminToken : Text, input : Types.PaymentAccountInput) : async Types.PaymentAccount {
    AccessLib.requireAdmin(state, adminToken);
    BillingLib.createAccount(accounts, state, input);
  };

  /// Administrative: updates a receiving account.
  public shared func updatePaymentAccount(adminToken : Text, id : Nat, input : Types.PaymentAccountInput) : async ?Types.PaymentAccount {
    AccessLib.requireAdmin(state, adminToken);
    BillingLib.updateAccount(accounts, id, input);
  };

  /// Administrative: activates or deactivates a receiving account.
  public shared func setPaymentAccountActive(adminToken : Text, id : Nat, active : Bool) : async ?Types.PaymentAccount {
    AccessLib.requireAdmin(state, adminToken);
    BillingLib.setAccountActive(accounts, id, active);
  };

  /// Client: reports a payment for the caller's own record.
  public shared func reportPayment(clientToken : Text, input : Types.PaymentReportInput) : async Types.PaymentReport {
    let client = AccessLib.requireClient(clients, clientToken);
    BillingLib.reportPayment(payments, state, client.id, input);
  };

  /// Client: lists the caller's own payment reports.
  public query func listClientPayments(clientToken : Text) : async [Types.PaymentReport] {
    let client = AccessLib.requireClient(clients, clientToken);
    BillingLib.listPayments(payments, client.id);
  };

  /// Administrative: payment reports awaiting validation.
  public query func listPendingPayments(adminToken : Text) : async [Types.PaymentReport] {
    AccessLib.requireAdmin(state, adminToken);
    BillingLib.listPendingPayments(payments);
  };

  /// Administrative: approves a payment and issues its receipt.
  public shared func approvePayment(adminToken : Text, paymentId : Nat) : async ?Types.PaymentReceipt {
    AccessLib.requireAdmin(state, adminToken);
    BillingLib.approvePayment(payments, invoices, clients, state, paymentId, state.bcvRate.value);
  };

  /// Administrative: rejects a payment report.
  public shared func rejectPayment(adminToken : Text, paymentId : Nat) : async ?Types.PaymentReport {
    AccessLib.requireAdmin(state, adminToken);
    BillingLib.rejectPayment(payments, paymentId);
  };

  /// Administrative: issues an invoice for a client.
  public shared func issueInvoice(
    adminToken : Text,
    clientId : Nat,
    period : Text,
    amountUsd : Nat,
    amountBs : Nat,
    bcvRate : Nat,
  ) : async Types.Invoice {
    AccessLib.requireAdmin(state, adminToken);
    BillingLib.issueInvoice(invoices, clients, state, clientId, period, amountUsd, amountBs, bcvRate);
  };

  /// Client: lists the caller's own invoices.
  public query func listClientInvoices(clientToken : Text) : async [Types.Invoice] {
    let client = AccessLib.requireClient(clients, clientToken);
    BillingLib.listInvoices(invoices, client.id);
  };
};
