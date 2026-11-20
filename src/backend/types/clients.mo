import Common "common";

module {
  public type ClientId = Common.ClientId;
  public type Timestamp = Common.Timestamp;
  public type ServiceStatus = Common.ServiceStatus;

  /// A Cajigalnet subscriber.
  public type Client = {
    id : ClientId;
    fullName : Text;
    cedula : Text;
    phone : Text;
    username : Text;
    /// Hashed password credential; never the plain password.
    passwordHash : Text;
    planName : Text;
    contractedMegabits : Nat;
    monthlyPriceUsd : Nat;
    /// Day of the month the service is cut off (1..31).
    cutOffDay : Nat;
    graceDays : Nat;
    status : ServiceStatus;
    /// When the service status last changed (suspension or reactivation).
    statusChangedAt : Timestamp;
    parishId : Common.CoverageId;
    townId : Common.CoverageId;
    sectorId : Common.CoverageId;
    /// Traffic consumed in the current billing period, in megabytes.
    periodTrafficMb : Nat;
    /// Principal that owns this client record once signed in.
    owner : ?Principal;
    createdAt : Timestamp;
  };

  /// Client-facing view without the credential.
  public type ClientView = {
    id : ClientId;
    fullName : Text;
    cedula : Text;
    phone : Text;
    username : Text;
    planName : Text;
    contractedMegabits : Nat;
    monthlyPriceUsd : Nat;
    cutOffDay : Nat;
    graceDays : Nat;
    status : ServiceStatus;
    statusChangedAt : Timestamp;
    parishId : Common.CoverageId;
    townId : Common.CoverageId;
    sectorId : Common.CoverageId;
    periodTrafficMb : Nat;
  };

  /// Input used by the administrator to create or update a client.
  public type ClientInput = {
    fullName : Text;
    cedula : Text;
    phone : Text;
    username : Text;
    password : Text;
    planName : Text;
    contractedMegabits : Nat;
    monthlyPriceUsd : Nat;
    cutOffDay : Nat;
    graceDays : Nat;
    parishId : Common.CoverageId;
    townId : Common.CoverageId;
    sectorId : Common.CoverageId;
  };
};
