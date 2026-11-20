import OQL "mo:caffeineai-oql";

module {
  /// Service status variant → tag text.
  public func _toRow(self : { #activo; #porVencer; #suspendido }) : OQL.Value =
    #text(
      switch (self) {
        case (#activo) { "activo" };
        case (#porVencer) { "porVencer" };
        case (#suspendido) { "suspendido" };
      }
    );
};
