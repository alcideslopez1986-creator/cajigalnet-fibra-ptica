import Types "../types/rates";
import RatesLib "../lib/rates";
import OutCall "mo:caffeineai-http-outcalls/outcall";

mixin (
  state : { var bcvRate : Types.BcvRate },
  transform : OutCall.Transform,
) {
  public query func getBcvRate() : async Types.BcvRate {
    RatesLib.current(state);
  };

  /// Fetches the official BCV rate from bcv.today and stores it as automatic.
  public shared func refreshBcvRate() : async Types.BcvRate {
    await RatesLib.refresh(state, transform);
  };

  public shared func setBcvRateManual(value : Nat, valueDate : Text) : async Types.BcvRate {
    RatesLib.setManual(state, value, valueDate);
  };

  public shared func setBcvRateAutomatic(value : Nat, valueDate : Text) : async Types.BcvRate {
    RatesLib.setAutomatic(state, value, valueDate);
  };
};
