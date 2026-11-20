import Map "mo:core/Map";
import Types "../types/admin";
import Clients "../types/clients";
import Billing "../types/billing";

module {
  public type DashboardMetrics = Types.DashboardMetrics;

  /// Aggregates the dashboard indicators from the live client and payment state.
  public func metrics(
    clients : Map.Map<Nat, Clients.Client>,
    payments : Map.Map<Nat, Billing.PaymentReport>,
  ) : DashboardMetrics {
    var activeClients = 0;
    var dueSoonClients = 0;
    var suspendedClients = 0;
    for (client in clients.values()) {
      switch (client.status) {
        case (#activo) { activeClients += 1 };
        case (#porVencer) { dueSoonClients += 1 };
        case (#suspendido) { suspendedClients += 1 };
      };
    };

    var pendingPayments = 0;
    var monthlyIncomeBs = 0;
    var monthlyIncomeUsd = 0;
    for (report in payments.values()) {
      switch (report.status) {
        case (#pendiente) { pendingPayments += 1 };
        case (#aprobado) {
          monthlyIncomeBs += report.amountBs;
          monthlyIncomeUsd += report.amountUsd;
        };
        case (#rechazado) {};
      };
    };

    {
      activeClients;
      dueSoonClients;
      suspendedClients;
      pendingPayments;
      monthlyIncomeBs;
      monthlyIncomeUsd;
    };
  };
};
