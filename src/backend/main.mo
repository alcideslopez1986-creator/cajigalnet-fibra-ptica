import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";

import Map "mo:core/Map";
import Principal "mo:core/Principal";
import OutCall "mo:caffeineai-http-outcalls/outcall";

import Common "types/common";
import Clients "types/clients";
import Coverage "types/coverage";
import Billing "types/billing";
import Rates "types/rates";
import Support "types/support";

import ClientsApi "mixins/clients-api";
import CoverageApi "mixins/coverage-api";
import AccessApi "mixins/access-api";
import BillingApi "mixins/billing-api";
import RatesApi "mixins/rates-api";
import SupportApi "mixins/support-api";
import AdminApi "mixins/admin-api";
import ApiDocMixin "mixins/api-doc";

import ServiceStatusValue "ServiceStatusValue";
import CoverageKindValue "CoverageKindValue";
import PaymentMethodValue "PaymentMethodValue";
import PaymentStatusValue "PaymentStatusValue";
import InvoiceStatusValue "InvoiceStatusValue";
import InstallRequestStatusValue "InstallRequestStatusValue";
import TicketCategoryValue "TicketCategoryValue";
import TicketStatusValue "TicketStatusValue";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let clients : Map.Map<Nat, Clients.Client>;
  let coverageEntries : Map.Map<Nat, Coverage.CoverageEntry>;
  let paymentAccounts : Map.Map<Nat, Billing.PaymentAccount>;
  let paymentReports : Map.Map<Nat, Billing.PaymentReport>;
  let invoices : Map.Map<Nat, Billing.Invoice>;
  let installRequests : Map.Map<Nat, Support.InstallRequest>;
  let supportTickets : Map.Map<Nat, Support.SupportTicket>;
  let adminNotices : Map.Map<Nat, Support.AdminNotice>;

  let appState : {
    var nextClientId : Nat;
    var nextCoverageId : Nat;
    var nextAccountId : Nat;
    var nextPaymentId : Nat;
    var nextInvoiceId : Nat;
    var nextInstallRequestId : Nat;
    var nextTicketId : Nat;
    var nextNoticeId : Nat;
    var nextRecoveryCode : Nat;
    var nextAdminToken : Nat;
    var adminMasterKey : Text;
    var bcvRate : Rates.BcvRate;
  };

  transient let samplePrincipal = Principal.fromText("aaaaa-aa");

  include MixinAuthorization(accessControlState, null);

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  include ClientsApi(clients, appState);
  include CoverageApi(coverageEntries, appState);
  include AccessApi(clients, appState);
  include BillingApi(paymentAccounts, paymentReports, invoices, clients, appState);
  include RatesApi(appState, transform);
  include SupportApi(installRequests, supportTickets, adminNotices, clients, appState);
  include AdminApi(clients, paymentReports, appState);
  include ApiDocMixin();

  include Expose({
    entities = [
      clients.toEntity("client", "Client", "id")
        .sample({
          id = 0;
          fullName = "";
          cedula = "";
          phone = "";
          username = "";
          passwordHash = "";
          planName = "";
          contractedMegabits = 0;
          monthlyPriceUsd = 0;
          cutOffDay = 0;
          graceDays = 0;
          status = #activo;
          statusChangedAt = 0;
          parishId = 0;
          townId = 0;
          sectorId = 0;
          periodTrafficMb = 0;
          owner = ?samplePrincipal;
          createdAt = 0;
        })
        .hidden("passwordHash")
        .controllerOnly()
        .build(),
      coverageEntries.toEntity("coverage", "CoverageEntry", "id")
        .sample({ id = 0; kind = #parroquia; name = ""; parentId = ?0; active = true })
        .public_()
        .build(),
      paymentAccounts.toEntity("paymentAccount", "PaymentAccount", "id")
        .sample({
          id = 0;
          method = #pagoMovil;
          bank = "";
          holder = "";
          documentId = "";
          phone = "";
          accountNumber = "";
          active = true;
        })
        .public_()
        .build(),
      paymentReports.toEntity("paymentReport", "PaymentReport", "id")
        .sample({
          id = 0;
          clientId = 0;
          accountId = 0;
          reference = "";
          amountUsd = 0;
          amountBs = 0;
          paidAt = 0;
          method = #pagoMovil;
          status = #pendiente;
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
      invoices.toEntity("invoice", "Invoice", "id")
        .sample({
          id = 0;
          number = "";
          clientId = 0;
          period = "";
          planName = "";
          contractedMegabits = 0;
          amountUsd = 0;
          amountBs = 0;
          bcvRate = 0;
          status = #emitida;
          issuedAt = 0;
        })
        .controllerOnly()
        .build(),
      installRequests.toEntity("installRequest", "InstallRequest", "id")
        .sample({
          id = 0;
          reference = "";
          fullName = "";
          cedula = "";
          phone = "";
          parishId = 0;
          townId = 0;
          sectorId = 0;
          status = #pendiente;
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
      supportTickets.toEntity("supportTicket", "SupportTicket", "id")
        .sample({
          id = 0;
          clientId = 0;
          category = #sinServicio;
          description = "";
          status = #abierto;
          adminReply = ?"";
          createdAt = 0;
          updatedAt = 0;
        })
        .controllerOnly()
        .build(),
      adminNotices.toEntity("adminNotice", "AdminNotice", "id")
        .sample({ id = 0; title = ""; body = ""; clientId = ?0; createdAt = 0 })
        .public_()
        .build(),
    ];
  });
};
