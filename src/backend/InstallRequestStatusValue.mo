import OQL "mo:caffeineai-oql";

module {
  /// Installation request status variant → tag text.
  public func _toRow(self : { #pendiente; #aprobada; #rechazada }) : OQL.Value =
    #text(
      switch (self) {
        case (#pendiente) { "pendiente" };
        case (#aprobada) { "aprobada" };
        case (#rechazada) { "rechazada" };
      }
    );
};
