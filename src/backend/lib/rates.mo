import Time "mo:core/Time";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Jayson "mo:jayson";
import Json "mo:jayson/Json";
import FloatJson "mo:jayson/FloatJson";
import TextJson "mo:jayson/TextJson";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Types "../types/rates";

module {
  public type BcvRate = Types.BcvRate;

  /// Public BCV rate endpoint (no key required).
  let bcvUrl = "https://bcv.today/api/v1/rate.json";

  /// Fallback rate used until the administrator sets one.
  public func initial() : BcvRate {
    {
      value = 0;
      valueDate = "";
      manual = false;
      updatedAt = Time.now();
    };
  };

  public func current(state : { var bcvRate : BcvRate }) : BcvRate {
    state.bcvRate;
  };

  public func setManual(
    state : { var bcvRate : BcvRate },
    value : Nat,
    valueDate : Text,
  ) : BcvRate {
    let rate : BcvRate = {
      value;
      valueDate;
      manual = true;
      updatedAt = Time.now();
    };
    state.bcvRate := rate;
    rate;
  };

  public func setAutomatic(
    state : { var bcvRate : BcvRate },
    value : Nat,
    valueDate : Text,
  ) : BcvRate {
    let rate : BcvRate = {
      value;
      valueDate;
      manual = false;
      updatedAt = Time.now();
    };
    state.bcvRate := rate;
    rate;
  };

  /// Reads the USD rate and its value date from the bcv.today document.
  func parseRate(body : Text) : ?(Nat, Text) {
    let ?json = Json.parse(body) else return null;
    let ?fields = Jayson.decodeRecord(json) else return null;
    let ?usd = fields.decodeField<Float>("USD") else return null;
    if (usd <= 0.0) { return null };
    let value = Float.toInt(usd * 100.0);
    if (value <= 0) { return null };
    let valueDate = fields.decodeField<Text>("effective_date") ?? "";
    ?(value.toNat(), valueDate);
  };

  /// Fetches the official rate from bcv.today and stores it as automatic.
  /// Keeps the current rate untouched when the fetch or parse fails.
  public func refresh(
    state : { var bcvRate : BcvRate },
    transform : OutCall.Transform,
  ) : async BcvRate {
    let response = await OutCall.httpRequest({
      url = bcvUrl;
      method = #get;
      headers = [];
      body = null;
      maxResponseBytes = 10_000;
      transform;
    });
    if (response.status != 200) { return state.bcvRate };
    let body = response.body.decodeUtf8() ?? Runtime.trap("BCV response is not UTF-8");
    switch (parseRate(body)) {
      case null { state.bcvRate };
      case (?(value, valueDate)) { setAutomatic(state, value, valueDate) };
    };
  };
};
