import OQL "mo:caffeineai-oql";

module {
  /// Support ticket status variant → tag text.
  public func _toRow(self : { #abierto; #enProceso; #resuelto }) : OQL.Value =
    #text(
      switch (self) {
        case (#abierto) { "abierto" };
        case (#enProceso) { "enProceso" };
        case (#resuelto) { "resuelto" };
      }
    );
};
