import Map "mo:core/Map";
import Types "../types/access";
import Clients "../types/clients";
import AccessLib "../lib/access";

mixin (
  clients : Map.Map<Nat, Clients.Client>,
  state : {
    var nextRecoveryCode : Nat;
    var adminMasterKey : Text;
    var nextAdminToken : Nat;
  },
) {
  public shared func clientSignIn(input : Types.LoginInput) : async ?Types.ClientView {
    AccessLib.signIn(clients, input);
  };

  public shared func requestPasswordRecovery(input : Types.RecoveryInput) : async ?Types.RecoveryTicket {
    AccessLib.requestRecovery(clients, state, input);
  };

  public shared func resetPassword(input : Types.ResetInput) : async Bool {
    AccessLib.resetPassword(clients, input);
  };

  public shared func adminSignIn(masterKey : Text) : async ?Types.AdminSession {
    AccessLib.openAdminSession(state, masterKey);
  };
};
