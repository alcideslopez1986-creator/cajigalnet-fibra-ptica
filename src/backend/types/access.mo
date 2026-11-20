import Common "common";
import Clients "clients";

module {
  public type ClientView = Clients.ClientView;
  public type AppError = Common.AppError;

  /// Credential accepted at sign-in: cédula, phone or username.
  public type LoginInput = {
    identifier : Text;
    password : Text;
  };

  /// Password recovery request by phone and/or cédula.
  public type RecoveryInput = {
    phone : Text;
    cedula : Text;
  };

  /// Recovery instructions returned to the client for WhatsApp delivery.
  public type RecoveryTicket = {
    code : Text;
    whatsappUrl : Text;
    message : Text;
  };

  public type ResetInput = {
    phone : Text;
    code : Text;
    newPassword : Text;
  };

  /// Administrative session opened with the master key.
  public type AdminSession = {
    token : Text;
    expiresAt : Common.Timestamp;
  };
};
