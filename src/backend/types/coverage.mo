import Common "common";

module {
  public type CoverageId = Common.CoverageId;

  /// Kind of coverage catalog entry.
  public type CoverageKind = {
    #parroquia;
    #pueblo;
    #sector;
  };

  /// One entry of the Municipio Cajigal coverage hierarchy.
  public type CoverageEntry = {
    id : CoverageId;
    kind : CoverageKind;
    name : Text;
    /// Parent entry; `null` for a parish.
    parentId : ?CoverageId;
    active : Bool;
  };

  /// Input used by the administrator to create or edit a coverage entry.
  public type CoverageInput = {
    kind : CoverageKind;
    name : Text;
    parentId : ?CoverageId;
    active : Bool;
  };
};
