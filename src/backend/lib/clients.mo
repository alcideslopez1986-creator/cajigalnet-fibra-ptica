import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Types "../types/clients";

module {
  public type Client = Types.Client;
  public type ClientView = Types.ClientView;
  public type ClientInput = Types.ClientInput;

  public func toView(client : Client) : ClientView {
    {
      id = client.id;
      fullName = client.fullName;
      cedula = client.cedula;
      phone = client.phone;
      username = client.username;
      planName = client.planName;
      contractedMegabits = client.contractedMegabits;
      monthlyPriceUsd = client.monthlyPriceUsd;
      cutOffDay = client.cutOffDay;
      graceDays = client.graceDays;
      status = client.status;
      statusChangedAt = client.statusChangedAt;
      parishId = client.parishId;
      townId = client.townId;
      sectorId = client.sectorId;
      periodTrafficMb = client.periodTrafficMb;
    };
  };

  public func create(
    clients : Map.Map<Nat, Client>,
    state : { var nextClientId : Nat },
    input : ClientInput,
  ) : Client {
    let id = state.nextClientId;
    state.nextClientId := id + 1;
    let now = Time.now();
    let client : Client = {
      id;
      fullName = input.fullName;
      cedula = input.cedula;
      phone = input.phone;
      username = input.username;
      passwordHash = input.password;
      planName = input.planName;
      contractedMegabits = input.contractedMegabits;
      monthlyPriceUsd = input.monthlyPriceUsd;
      cutOffDay = input.cutOffDay;
      graceDays = input.graceDays;
      status = #activo;
      statusChangedAt = now;
      parishId = input.parishId;
      townId = input.townId;
      sectorId = input.sectorId;
      periodTrafficMb = 0;
      owner = null;
      createdAt = now;
    };
    clients.add(id, client);
    client;
  };

  public func update(
    clients : Map.Map<Nat, Client>,
    id : Nat,
    input : ClientInput,
  ) : ?Client {
    switch (clients.get(id)) {
      case null { null };
      case (?existing) {
        let updated : Client = {
          id = existing.id;
          fullName = input.fullName;
          cedula = input.cedula;
          phone = input.phone;
          username = input.username;
          passwordHash = input.password;
          planName = input.planName;
          contractedMegabits = input.contractedMegabits;
          monthlyPriceUsd = input.monthlyPriceUsd;
          cutOffDay = input.cutOffDay;
          graceDays = input.graceDays;
          status = existing.status;
          statusChangedAt = existing.statusChangedAt;
          parishId = input.parishId;
          townId = input.townId;
          sectorId = input.sectorId;
          periodTrafficMb = existing.periodTrafficMb;
          owner = existing.owner;
          createdAt = existing.createdAt;
        };
        clients.add(id, updated);
        ?updated;
      };
    };
  };

  public func remove(clients : Map.Map<Nat, Client>, id : Nat) : Bool {
    switch (clients.get(id)) {
      case null { false };
      case (?_) { clients.remove(id); true };
    };
  };

  public func get(clients : Map.Map<Nat, Client>, id : Nat) : ?Client {
    clients.get(id);
  };

  public func list(clients : Map.Map<Nat, Client>) : [ClientView] {
    clients.values().map(func c = toView(c)).toArray();
  };

  /// Matches by name, cédula, town or sector identifier.
  public func search(
    clients : Map.Map<Nat, Client>,
    term : Text,
  ) : [ClientView] {
    let needle = term.toLower();
    clients.values().filter(
      func c {
        c.fullName.toLower().contains(#text needle)
        or c.cedula.toLower().contains(#text needle)
        or c.username.toLower().contains(#text needle)
        or c.phone.toLower().contains(#text needle)
        or c.townId.toText().contains(#text needle)
        or c.sectorId.toText().contains(#text needle)
      }
    ).map(func c = toView(c)).toArray();
  };

  /// Changes the service status and records when the change happened.
  public func setStatus(
    clients : Map.Map<Nat, Client>,
    id : Nat,
    status : Types.ServiceStatus,
  ) : ?Client {
    switch (clients.get(id)) {
      case null { null };
      case (?existing) {
        let updated : Client = {
          id = existing.id;
          fullName = existing.fullName;
          cedula = existing.cedula;
          phone = existing.phone;
          username = existing.username;
          passwordHash = existing.passwordHash;
          planName = existing.planName;
          contractedMegabits = existing.contractedMegabits;
          monthlyPriceUsd = existing.monthlyPriceUsd;
          cutOffDay = existing.cutOffDay;
          graceDays = existing.graceDays;
          status;
          statusChangedAt = Time.now();
          parishId = existing.parishId;
          townId = existing.townId;
          sectorId = existing.sectorId;
          periodTrafficMb = existing.periodTrafficMb;
          owner = existing.owner;
          createdAt = existing.createdAt;
        };
        clients.add(id, updated);
        ?updated;
      };
    };
  };
};
