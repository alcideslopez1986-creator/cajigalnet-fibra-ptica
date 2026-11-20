import OQL "mo:caffeineai-oql";

module {
  /// Coverage kind variant → tag text.
  public func _toRow(self : { #parroquia; #pueblo; #sector }) : OQL.Value =
    #text(
      switch (self) {
        case (#parroquia) { "parroquia" };
        case (#pueblo) { "pueblo" };
        case (#sector) { "sector" };
      }
    );
};
