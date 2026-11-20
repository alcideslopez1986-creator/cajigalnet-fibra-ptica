import OQL "mo:caffeineai-oql";

module {
  /// Payment method variant → tag text.
  public func _toRow(self : { #pagoMovil; #transferenciaBs; #divisas; #zelle; #usdt }) : OQL.Value =
    #text(
      switch (self) {
        case (#pagoMovil) { "pagoMovil" };
        case (#transferenciaBs) { "transferenciaBs" };
        case (#divisas) { "divisas" };
        case (#zelle) { "zelle" };
        case (#usdt) { "usdt" };
      }
    );
};
