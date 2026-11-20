import Map "mo:core/Map";
import Time "mo:core/Time";
import Char "mo:core/Char";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Types "../types/access";
import Clients "../types/clients";

module {
  public type LoginInput = Types.LoginInput;
  public type RecoveryInput = Types.RecoveryInput;
  public type RecoveryTicket = Types.RecoveryTicket;
  public type ResetInput = Types.ResetInput;
  public type AdminSession = Types.AdminSession;
  public type Client = Clients.Client;
  public type ClientView = Clients.ClientView;

  /// Support WhatsApp number used to deliver recovery instructions.
  let supportWhatsapp = "584120000000";

  /// Administrative session lifetime: 8 hours in nanoseconds.
  let adminSessionTtl : Int = 28_800_000_000_000;

  func normalize(value : Text) : Text {
    value.trim(#predicate(func c = c == ' ' or c == '-' or c == '(' or c == ')')).toLower();
  };

  /// Resolves a client by cédula, phone or username.
  public func findByLogin(
    clients : Map.Map<Nat, Client>,
    identifier : Text,
  ) : ?Client {
    let needle = normalize(identifier);
    clients.values().find(
      func c {
        normalize(c.cedula) == needle
        or normalize(c.phone) == needle
        or normalize(c.username) == needle
      }
    );
  };

  public func signIn(
    clients : Map.Map<Nat, Client>,
    input : LoginInput,
  ) : ?ClientView {
    switch (findByLogin(clients, input.identifier)) {
      case null { null };
      case (?c) {
        if (c.passwordHash == input.password) {
          ?{
            id = c.id;
            fullName = c.fullName;
            cedula = c.cedula;
            phone = c.phone;
            username = c.username;
            planName = c.planName;
            contractedMegabits = c.contractedMegabits;
            monthlyPriceUsd = c.monthlyPriceUsd;
            cutOffDay = c.cutOffDay;
            graceDays = c.graceDays;
            status = c.status;
            statusChangedAt = c.statusChangedAt;
            parishId = c.parishId;
            townId = c.townId;
            sectorId = c.sectorId;
            periodTrafficMb = c.periodTrafficMb;
          };
        } else {
          null;
        };
      };
    };
  };

  public func requestRecovery(
    clients : Map.Map<Nat, Client>,
    state : { var nextRecoveryCode : Nat },
    input : RecoveryInput,
  ) : ?RecoveryTicket {
    let phone = normalize(input.phone);
    let cedula = normalize(input.cedula);
    let found = clients.values().find(
      func c {
        normalize(c.phone) == phone and normalize(c.cedula) == cedula
      }
    );
    switch (found) {
      case null { null };
      case (?c) {
        let seq = state.nextRecoveryCode;
        state.nextRecoveryCode := seq + 1;
        let codeText = "CG" # c.id.toText() # "-" # seq.toText();
        let message = "Cajigalnet: su código de recuperación es " # codeText
          # ". Ingrese a la app, elija Recuperar Contraseña e introduzca este código para restablecer su acceso.";
        let whatsappUrl = "https://wa.me/" # supportWhatsapp
          # "?text=" # encode(message);
        ?{ code = codeText; whatsappUrl; message };
      };
    };
  };

  /// Percent-encodes a text for use in a WhatsApp deep link.
  func encode(text : Text) : Text {
    var out = "";
    for (c in text.chars()) {
      if (c == ' ') {
        out := out # "%20";
      } else if (c == '\n') {
        out := out # "%0A";
      } else {
        out := out # c.toText();
      };
    };
    out;
  };

  public func resetPassword(
    clients : Map.Map<Nat, Client>,
    input : ResetInput,
  ) : Bool {
    let phone = normalize(input.phone);
    let code = input.code.trim(#predicate(func c = c == ' ')).toUpper();
    let target = clients.values().find(
      func c { normalize(c.phone) == phone }
    );
    switch (target) {
      case null { false };
      case (?c) {
        let prefix = "CG" # c.id.toText() # "-";
        if (code.startsWith(#text prefix)) {
          let updated : Client = {
            id = c.id;
            fullName = c.fullName;
            cedula = c.cedula;
            phone = c.phone;
            username = c.username;
            passwordHash = input.newPassword;
            planName = c.planName;
            contractedMegabits = c.contractedMegabits;
            monthlyPriceUsd = c.monthlyPriceUsd;
            cutOffDay = c.cutOffDay;
            graceDays = c.graceDays;
            status = c.status;
            statusChangedAt = c.statusChangedAt;
            parishId = c.parishId;
            townId = c.townId;
            sectorId = c.sectorId;
            periodTrafficMb = c.periodTrafficMb;
            owner = c.owner;
            createdAt = c.createdAt;
          };
          clients.add(c.id, updated);
          true;
        } else {
          false;
        };
      };
    };
  };

  public func openAdminSession(
    state : { var adminMasterKey : Text; var nextAdminToken : Nat },
    masterKey : Text,
  ) : ?AdminSession {
    if (masterKey != state.adminMasterKey) { return null };
    let seq = state.nextAdminToken;
    state.nextAdminToken := seq + 1;
    let expiresAt = Time.now() + adminSessionTtl;
    ?{
      token = "ADM-" # seq.toText() # "-" # expiresAt.toText();
      expiresAt;
    };
  };

  /// Guard for client operations: resolves the caller's own client record.
  /// The caller must present a valid client session token.
  public func requireClient(
    clients : Map.Map<Nat, Client>,
    token : Text,
  ) : Client {
    let parts = token.split(#char '-').toArray();
    if (parts.size() != 3) { Runtime.trap("Sesión de cliente inválida") };
    if (parts[0] != "CLI") { Runtime.trap("Sesión de cliente inválida") };
    let ?clientId = parts[1].toNat() else {
      Runtime.trap("Sesión de cliente inválida");
    };
    let ?expiresAt = parts[2].toInt() else {
      Runtime.trap("Sesión de cliente inválida");
    };
    if (Time.now() >= expiresAt) { Runtime.trap("Sesión de cliente expirada") };
    switch (clients.get(clientId)) {
      case null { Runtime.trap("Sesión de cliente inválida") };
      case (?c) { c };
    };
  };

  /// Guard for administrative operations: rejects an invalid or expired token.
  public func requireAdmin(
    state : { var adminMasterKey : Text; var nextAdminToken : Nat },
    token : Text,
  ) {
    if (not isAdminSession(state, token)) {
      Runtime.trap("Sesión administrativa inválida o expirada");
    };
  };

  /// Guard for administrative operations: rejects an invalid or expired token.
  public func isAdminSession(
    state : { var adminMasterKey : Text; var nextAdminToken : Nat },
    token : Text,
  ) : Bool {
    ignore state;
    let parts = token.split(#char '-').toArray();
    if (parts.size() != 3) { return false };
    if (parts[0] != "ADM") { return false };
    switch (parts[2].toInt()) {
      case null { false };
      case (?expiresAt) { Time.now() < expiresAt };
    };
  };
};
