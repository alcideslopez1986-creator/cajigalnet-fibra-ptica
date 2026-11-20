import Common "common";

module {
  public type Timestamp = Common.Timestamp;

  /// Current BCV dollar rate in Bolívares.
  public type BcvRate = {
    /// Bolívares per US dollar.
    value : Nat;
    /// Value date of the rate.
    valueDate : Text;
    /// `true` when the administrator set the rate manually.
    manual : Bool;
    updatedAt : Timestamp;
  };
};
