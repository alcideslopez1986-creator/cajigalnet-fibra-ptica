import Common "common";

module {
  public type InstallRequestId = Common.InstallRequestId;
  public type TicketId = Common.TicketId;
  public type NoticeId = Common.NoticeId;
  public type ClientId = Common.ClientId;
  public type CoverageId = Common.CoverageId;
  public type Timestamp = Common.Timestamp;

  public type InstallRequestStatus = {
    #pendiente;
    #aprobada;
    #rechazada;
  };

  /// An installation request submitted from the landing page.
  public type InstallRequest = {
    id : InstallRequestId;
    reference : Text;
    fullName : Text;
    cedula : Text;
    phone : Text;
    parishId : CoverageId;
    townId : CoverageId;
    sectorId : CoverageId;
    status : InstallRequestStatus;
    createdAt : Timestamp;
  };

  public type InstallRequestInput = {
    fullName : Text;
    cedula : Text;
    phone : Text;
    parishId : CoverageId;
    townId : CoverageId;
    sectorId : CoverageId;
  };

  public type TicketCategory = {
    #sinServicio;
    #luzRojaLos;
    #lentitud;
    #cambioClaveWifi;
    #otro;
  };

  public type TicketStatus = {
    #abierto;
    #enProceso;
    #resuelto;
  };

  /// A technical support ticket opened by a client.
  public type SupportTicket = {
    id : TicketId;
    clientId : ClientId;
    category : TicketCategory;
    description : Text;
    status : TicketStatus;
    adminReply : ?Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type TicketInput = {
    category : TicketCategory;
    description : Text;
  };

  /// An administrative notice addressed to clients.
  public type AdminNotice = {
    id : NoticeId;
    title : Text;
    body : Text;
    /// `null` broadcasts to every client.
    clientId : ?ClientId;
    createdAt : Timestamp;
  };

  public type NoticeInput = {
    title : Text;
    body : Text;
    clientId : ?ClientId;
  };
};
