import Common "common";

module {
  public type Timestamp = Common.Timestamp;

  /// Aggregate indicators shown on the administrative dashboard.
  public type DashboardMetrics = {
    activeClients : Nat;
    dueSoonClients : Nat;
    suspendedClients : Nat;
    pendingPayments : Nat;
    monthlyIncomeBs : Nat;
    monthlyIncomeUsd : Nat;
  };

  /// Administrative session opened with the master key.
  public type AdminSession = {
    token : Text;
    expiresAt : Timestamp;
  };
};
