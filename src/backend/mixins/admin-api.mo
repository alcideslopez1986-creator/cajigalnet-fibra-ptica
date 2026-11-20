import Map "mo:core/Map";
import Types "../types/admin";
import Clients "../types/clients";
import Billing "../types/billing";
import AdminLib "../lib/admin";
import AccessLib "../lib/access";

mixin (
  clients : Map.Map<Nat, Clients.Client>,
  payments : Map.Map<Nat, Billing.PaymentReport>,
  state : { var adminMasterKey : Text; var nextAdminToken : Nat },
) {
  /// Administrative: dashboard indicators.
  public query func getDashboardMetrics(adminToken : Text) : async Types.DashboardMetrics {
    AccessLib.requireAdmin(state, adminToken);
    AdminLib.metrics(clients, payments);
  };
};
