import OQL "mo:caffeineai-oql";

module {
  /// Support ticket category variant → tag text.
  public func _toRow(self : { #sinServicio; #luzRojaLos; #lentitud; #cambioClaveWifi; #otro }) : OQL.Value =
    #text(
      switch (self) {
        case (#sinServicio) { "sinServicio" };
        case (#luzRojaLos) { "luzRojaLos" };
        case (#lentitud) { "lentitud" };
        case (#cambioClaveWifi) { "cambioClaveWifi" };
        case (#otro) { "otro" };
      }
    );
};
