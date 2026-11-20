import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";

module {
  public type OldActor = {};

  type Client = {
    id : Nat;
    fullName : Text;
    cedula : Text;
    phone : Text;
    username : Text;
    passwordHash : Text;
    planName : Text;
    contractedMegabits : Nat;
    monthlyPriceUsd : Nat;
    cutOffDay : Nat;
    graceDays : Nat;
    status : { #activo; #porVencer; #suspendido };
    statusChangedAt : Int;
    parishId : Nat;
    townId : Nat;
    sectorId : Nat;
    periodTrafficMb : Nat;
    owner : ?Principal;
    createdAt : Int;
  };

  type CoverageEntry = {
    id : Nat;
    kind : { #parroquia; #pueblo; #sector };
    name : Text;
    parentId : ?Nat;
    active : Bool;
  };

  type PaymentAccount = {
    id : Nat;
    method : { #pagoMovil; #transferenciaBs; #divisas; #zelle; #usdt };
    bank : Text;
    holder : Text;
    documentId : Text;
    phone : Text;
    accountNumber : Text;
    active : Bool;
  };

  type PaymentReport = {
    id : Nat;
    clientId : Nat;
    accountId : Nat;
    reference : Text;
    amountUsd : Nat;
    amountBs : Nat;
    paidAt : Int;
    method : { #pagoMovil; #transferenciaBs; #divisas; #zelle; #usdt };
    status : { #pendiente; #aprobado; #rechazado };
    createdAt : Int;
  };

  type Invoice = {
    id : Nat;
    number : Text;
    clientId : Nat;
    period : Text;
    planName : Text;
    contractedMegabits : Nat;
    amountUsd : Nat;
    amountBs : Nat;
    bcvRate : Nat;
    status : { #emitida; #pagada; #anulada };
    issuedAt : Int;
  };

  type InstallRequest = {
    id : Nat;
    reference : Text;
    fullName : Text;
    cedula : Text;
    phone : Text;
    parishId : Nat;
    townId : Nat;
    sectorId : Nat;
    status : { #pendiente; #aprobada; #rechazada };
    createdAt : Int;
  };

  type SupportTicket = {
    id : Nat;
    clientId : Nat;
    category : { #sinServicio; #luzRojaLos; #lentitud; #cambioClaveWifi; #otro };
    description : Text;
    status : { #abierto; #enProceso; #resuelto };
    adminReply : ?Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type AdminNotice = {
    id : Nat;
    title : Text;
    body : Text;
    clientId : ?Nat;
    createdAt : Int;
  };

  type BcvRate = {
    value : Nat;
    valueDate : Text;
    manual : Bool;
    updatedAt : Int;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    clients : Map.Map<Nat, Client>;
    coverageEntries : Map.Map<Nat, CoverageEntry>;
    paymentAccounts : Map.Map<Nat, PaymentAccount>;
    paymentReports : Map.Map<Nat, PaymentReport>;
    invoices : Map.Map<Nat, Invoice>;
    installRequests : Map.Map<Nat, InstallRequest>;
    supportTickets : Map.Map<Nat, SupportTicket>;
    adminNotices : Map.Map<Nat, AdminNotice>;
    appState : {
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
      var bcvRate : BcvRate;
    };
  };

  /// Seeds the Municipio Cajigal coverage catalog and returns the next free id.
  func seedCoverage(entries : Map.Map<Nat, CoverageEntry>) : Nat {
    var next = 1;
    func add(kind : { #parroquia; #pueblo; #sector }, name : Text, parentId : ?Nat) : Nat {
      let id = next;
      next := id + 1;
      entries.add(id, { id; kind; name; parentId; active = true });
      id;
    };
    let yaguaraparo = add(#parroquia, "Yaguaraparo", null);
    let elPaujil = add(#parroquia, "El Paujil", null);
    let libertad = add(#parroquia, "Libertad", null);
    let yaguaraparoCentro = add(#pueblo, "Yaguaraparo", ?yaguaraparo);
    ignore add(#sector, "Yaguaraparo centro", ?yaguaraparoCentro);
    ignore add(#sector, "Sector La Chivera", ?yaguaraparoCentro);
    ignore add(#pueblo, "El Paujil", ?elPaujil);
    ignore add(#pueblo, "Río Seco", ?libertad);
    next;
  };

  public func migration(_ : OldActor) : NewActor {
    let coverageEntries = Map.empty<Nat, CoverageEntry>();
    let nextCoverageId = seedCoverage(coverageEntries);
    {
      accessControlState = AccessControl.initState();
      clients = Map.empty();
      coverageEntries;
      paymentAccounts = Map.empty();
      paymentReports = Map.empty();
      invoices = Map.empty();
      installRequests = Map.empty();
      supportTickets = Map.empty();
      adminNotices = Map.empty();
      appState = {
        var nextClientId = 1;
        var nextCoverageId;
        var nextAccountId = 1;
        var nextPaymentId = 1;
        var nextInvoiceId = 1;
        var nextInstallRequestId = 1;
        var nextTicketId = 1;
        var nextNoticeId = 1;
        var nextRecoveryCode = 1;
        var nextAdminToken = 1;
        var adminMasterKey = "cajigalnet-admin-2026";
        var bcvRate = { value = 0; valueDate = ""; manual = false; updatedAt = 0 };
      };
    };
  };
};
