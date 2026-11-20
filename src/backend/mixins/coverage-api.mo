import Map "mo:core/Map";
import Types "../types/coverage";
import CoverageLib "../lib/coverage";
import AccessLib "../lib/access";

mixin (
  entries : Map.Map<Nat, Types.CoverageEntry>,
  state : {
    var nextCoverageId : Nat;
    var adminMasterKey : Text;
    var nextAdminToken : Nat;
  },
) {
  public query func listCoverage() : async [Types.CoverageEntry] {
    CoverageLib.list(entries);
  };

  public query func listCoverageByKind(kind : Types.CoverageKind) : async [Types.CoverageEntry] {
    CoverageLib.listByKind(entries, kind);
  };

  public query func listCoverageChildren(parentId : Nat) : async [Types.CoverageEntry] {
    CoverageLib.listChildren(entries, parentId);
  };

  /// Administrative: creates a parish, town or sector.
  public shared func createCoverage(adminToken : Text, input : Types.CoverageInput) : async Types.CoverageEntry {
    AccessLib.requireAdmin(state, adminToken);
    CoverageLib.create(entries, state, input);
  };

  /// Administrative: updates a coverage entry.
  public shared func updateCoverage(adminToken : Text, id : Nat, input : Types.CoverageInput) : async ?Types.CoverageEntry {
    AccessLib.requireAdmin(state, adminToken);
    CoverageLib.update(entries, id, input);
  };

  /// Administrative: deletes a coverage entry.
  public shared func deleteCoverage(adminToken : Text, id : Nat) : async Bool {
    AccessLib.requireAdmin(state, adminToken);
    CoverageLib.remove(entries, id);
  };

  /// Idempotently seeds the Municipio Cajigal catalog when empty.
  public shared func seedCoverage() : async [Types.CoverageEntry] {
    CoverageLib.seed(entries, state);
    CoverageLib.list(entries);
  };
};
