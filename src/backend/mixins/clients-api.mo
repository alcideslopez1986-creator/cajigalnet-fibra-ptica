import Map "mo:core/Map";
import Types "../types/clients";
import ClientsLib "../lib/clients";
import AccessLib "../lib/access";

mixin (
  clients : Map.Map<Nat, Types.Client>,
  state : {
    var nextClientId : Nat;
    var adminMasterKey : Text;
    var nextAdminToken : Nat;
  },
) {
  /// Administrative: lists every client.
  public query func listClients(adminToken : Text) : async [Types.ClientView] {
    AccessLib.requireAdmin(state, adminToken);
    ClientsLib.list(clients);
  };

  /// Administrative: reads any client by id.
  public query func getClient(adminToken : Text, id : Nat) : async ?Types.ClientView {
    AccessLib.requireAdmin(state, adminToken);
    switch (ClientsLib.get(clients, id)) {
      case null { null };
      case (?c) { ?ClientsLib.toView(c) };
    };
  };

  /// Administrative: searches clients by name, cédula, town or sector.
  public query func searchClients(adminToken : Text, term : Text) : async [Types.ClientView] {
    AccessLib.requireAdmin(state, adminToken);
    ClientsLib.search(clients, term);
  };

  /// Client: reads only the caller's own record.
  public query func getMyClient(clientToken : Text) : async Types.ClientView {
    ClientsLib.toView(AccessLib.requireClient(clients, clientToken));
  };

  /// Administrative: creates a client.
  public shared func createClient(adminToken : Text, input : Types.ClientInput) : async Types.ClientView {
    AccessLib.requireAdmin(state, adminToken);
    ClientsLib.toView(ClientsLib.create(clients, state, input));
  };

  /// Administrative: updates a client.
  public shared func updateClient(adminToken : Text, id : Nat, input : Types.ClientInput) : async ?Types.ClientView {
    AccessLib.requireAdmin(state, adminToken);
    switch (ClientsLib.update(clients, id, input)) {
      case null { null };
      case (?c) { ?ClientsLib.toView(c) };
    };
  };

  /// Administrative: deletes a client.
  public shared func deleteClient(adminToken : Text, id : Nat) : async Bool {
    AccessLib.requireAdmin(state, adminToken);
    ClientsLib.remove(clients, id);
  };

  /// Administrative: suspends or reactivates a client's service.
  public shared func setClientStatus(adminToken : Text, id : Nat, status : Types.ServiceStatus) : async ?Types.ClientView {
    AccessLib.requireAdmin(state, adminToken);
    switch (ClientsLib.setStatus(clients, id, status)) {
      case null { null };
      case (?c) { ?ClientsLib.toView(c) };
    };
  };
};
