import OQL "mo:caffeineai-oql";

module {
  /// Invoice status variant → tag text.
  public func _toRow(self : { #emitida; #pagada; #anulada }) : OQL.Value =
    #text(
      switch (self) {
        case (#emitida) { "emitida" };
        case (#pagada) { "pagada" };
        case (#anulada) { "anulada" };
      }
    );
};
