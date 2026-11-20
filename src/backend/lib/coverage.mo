import Map "mo:core/Map";
import Types "../types/coverage";

module {
  public type CoverageEntry = Types.CoverageEntry;
  public type CoverageInput = Types.CoverageInput;

  public func create(
    entries : Map.Map<Nat, CoverageEntry>,
    state : { var nextCoverageId : Nat },
    input : CoverageInput,
  ) : CoverageEntry {
    let id = state.nextCoverageId;
    state.nextCoverageId := id + 1;
    let entry : CoverageEntry = {
      id;
      kind = input.kind;
      name = input.name;
      parentId = input.parentId;
      active = input.active;
    };
    entries.add(id, entry);
    entry;
  };

  public func update(
    entries : Map.Map<Nat, CoverageEntry>,
    id : Nat,
    input : CoverageInput,
  ) : ?CoverageEntry {
    switch (entries.get(id)) {
      case null { null };
      case (?_) {
        let updated : CoverageEntry = {
          id;
          kind = input.kind;
          name = input.name;
          parentId = input.parentId;
          active = input.active;
        };
        entries.add(id, updated);
        ?updated;
      };
    };
  };

  public func remove(entries : Map.Map<Nat, CoverageEntry>, id : Nat) : Bool {
    switch (entries.get(id)) {
      case null { false };
      case (?_) { entries.remove(id); true };
    };
  };

  public func list(entries : Map.Map<Nat, CoverageEntry>) : [CoverageEntry] {
    entries.values().toArray();
  };

  public func listByKind(
    entries : Map.Map<Nat, CoverageEntry>,
    kind : Types.CoverageKind,
  ) : [CoverageEntry] {
    entries.values().filter(func e = e.kind == kind).toArray();
  };

  public func listChildren(
    entries : Map.Map<Nat, CoverageEntry>,
    parentId : Nat,
  ) : [CoverageEntry] {
    entries.values().filter(
      func e {
        switch (e.parentId) {
          case (?p) { p == parentId };
          case null { false };
        };
      }
    ).toArray();
  };

  /// Seeds the initial Municipio Cajigal parishes and sectors.
  public func seed(
    entries : Map.Map<Nat, CoverageEntry>,
    state : { var nextCoverageId : Nat },
  ) : () {
    if (entries.size() > 0) { return };
    let yaguaraparo = create(entries, state, {
      kind = #parroquia;
      name = "Yaguaraparo";
      parentId = null;
      active = true;
    });
    let elPaujil = create(entries, state, {
      kind = #parroquia;
      name = "El Paujil";
      parentId = null;
      active = true;
    });
    let libertad = create(entries, state, {
      kind = #parroquia;
      name = "Libertad";
      parentId = null;
      active = true;
    });
    let yaguaraparoCentro = create(entries, state, {
      kind = #pueblo;
      name = "Yaguaraparo";
      parentId = ?yaguaraparo.id;
      active = true;
    });
    ignore create(entries, state, {
      kind = #sector;
      name = "Yaguaraparo centro";
      parentId = ?yaguaraparoCentro.id;
      active = true;
    });
    ignore create(entries, state, {
      kind = #sector;
      name = "Sector La Chivera";
      parentId = ?yaguaraparoCentro.id;
      active = true;
    });
    ignore create(entries, state, {
      kind = #pueblo;
      name = "El Paujil";
      parentId = ?elPaujil.id;
      active = true;
    });
    ignore create(entries, state, {
      kind = #pueblo;
      name = "Río Seco";
      parentId = ?libertad.id;
      active = true;
    });
  };
};
