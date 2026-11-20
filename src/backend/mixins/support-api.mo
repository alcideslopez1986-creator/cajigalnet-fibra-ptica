import Map "mo:core/Map";
import Types "../types/support";
import Clients "../types/clients";
import SupportLib "../lib/support";
import AccessLib "../lib/access";

mixin (
  installRequests : Map.Map<Nat, Types.InstallRequest>,
  tickets : Map.Map<Nat, Types.SupportTicket>,
  notices : Map.Map<Nat, Types.AdminNotice>,
  clients : Map.Map<Nat, Clients.Client>,
  state : {
    var nextInstallRequestId : Nat;
    var nextTicketId : Nat;
    var nextNoticeId : Nat;
    var adminMasterKey : Text;
    var nextAdminToken : Nat;
  },
) {
  /// Public: a visitor requests an installation.
  public shared func createInstallRequest(input : Types.InstallRequestInput) : async Types.InstallRequest {
    SupportLib.createInstallRequest(installRequests, state, input);
  };

  /// Administrative: lists installation requests.
  public query func listInstallRequests(adminToken : Text) : async [Types.InstallRequest] {
    AccessLib.requireAdmin(state, adminToken);
    SupportLib.listInstallRequests(installRequests);
  };

  /// Administrative: approves or rejects an installation request.
  public shared func setInstallRequestStatus(adminToken : Text, id : Nat, status : Types.InstallRequestStatus) : async ?Types.InstallRequest {
    AccessLib.requireAdmin(state, adminToken);
    SupportLib.setInstallRequestStatus(installRequests, id, status);
  };

  /// Client: opens a support ticket for the caller's own record.
  public shared func createTicket(clientToken : Text, input : Types.TicketInput) : async Types.SupportTicket {
    let client = AccessLib.requireClient(clients, clientToken);
    SupportLib.createTicket(tickets, state, client.id, input);
  };

  /// Client: lists the caller's own tickets.
  public query func listClientTickets(clientToken : Text) : async [Types.SupportTicket] {
    let client = AccessLib.requireClient(clients, clientToken);
    SupportLib.listTickets(tickets, client.id);
  };

  /// Administrative: lists every support ticket.
  public query func listAllTickets(adminToken : Text) : async [Types.SupportTicket] {
    AccessLib.requireAdmin(state, adminToken);
    SupportLib.listAllTickets(tickets);
  };

  /// Administrative: replies to a ticket and updates its status.
  public shared func replyTicket(adminToken : Text, id : Nat, adminReply : Text, status : Types.TicketStatus) : async ?Types.SupportTicket {
    AccessLib.requireAdmin(state, adminToken);
    SupportLib.replyTicket(tickets, id, adminReply, status);
  };

  /// Administrative: publishes a notice.
  public shared func createNotice(adminToken : Text, input : Types.NoticeInput) : async Types.AdminNotice {
    AccessLib.requireAdmin(state, adminToken);
    SupportLib.createNotice(notices, state, input);
  };

  /// Client: lists the caller's own notices.
  public query func listClientNotices(clientToken : Text) : async [Types.AdminNotice] {
    let client = AccessLib.requireClient(clients, clientToken);
    SupportLib.listNotices(notices, client.id);
  };
};
