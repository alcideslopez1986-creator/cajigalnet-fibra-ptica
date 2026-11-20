import OQL "mo:caffeineai-oql";

module {
  /// Payment status variant → tag text.
  public func _toRow(self : { #pendiente; #aprobado; #rechazado }) : OQL.Value =
    #text(
      switch (self) {
        case (#pendiente) { "pendiente" };
        case (#aprobado) { "aprobado" };
        case (#rechazado) { "rechazado" };
      }
    );
};
