import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Types "../types/support";

module {
  public type InstallRequest = Types.InstallRequest;
  public type InstallRequestInput = Types.InstallRequestInput;
  public type SupportTicket = Types.SupportTicket;
  public type TicketInput = Types.TicketInput;
  public type AdminNotice = Types.AdminNotice;
  public type NoticeInput = Types.NoticeInput;

  /// Builds the human-readable reference of an installation request.
  public func installReference(id : Nat) : Text {
    "SOL-" # id.toText();
  };

  public func createInstallRequest(
    requests : Map.Map<Nat, InstallRequest>,
    state : { var nextInstallRequestId : Nat },
    input : InstallRequestInput,
  ) : InstallRequest {
    let id = state.nextInstallRequestId;
    state.nextInstallRequestId := id + 1;
    let request : InstallRequest = {
      id;
      reference = installReference(id);
      fullName = input.fullName;
      cedula = input.cedula;
      phone = input.phone;
      parishId = input.parishId;
      townId = input.townId;
      sectorId = input.sectorId;
      status = #pendiente;
      createdAt = Time.now();
    };
    requests.add(id, request);
    request;
  };

  public func listInstallRequests(
    requests : Map.Map<Nat, InstallRequest>,
  ) : [InstallRequest] {
    let all = requests.values().toArray();
    all.sort(func (a, b) = Nat.compare(b.id, a.id));
  };

  public func setInstallRequestStatus(
    requests : Map.Map<Nat, InstallRequest>,
    id : Nat,
    status : Types.InstallRequestStatus,
  ) : ?InstallRequest {
    switch (requests.get(id)) {
      case (?request) {
        let updated : InstallRequest = { request with status };
        requests.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  public func createTicket(
    tickets : Map.Map<Nat, SupportTicket>,
    state : { var nextTicketId : Nat },
    clientId : Nat,
    input : TicketInput,
  ) : SupportTicket {
    let id = state.nextTicketId;
    state.nextTicketId := id + 1;
    let now = Time.now();
    let ticket : SupportTicket = {
      id;
      clientId;
      category = input.category;
      description = input.description;
      status = #abierto;
      adminReply = null;
      createdAt = now;
      updatedAt = now;
    };
    tickets.add(id, ticket);
    ticket;
  };

  public func listTickets(
    tickets : Map.Map<Nat, SupportTicket>,
    clientId : Nat,
  ) : [SupportTicket] {
    let mine = tickets.values().toArray().filter(func ticket = ticket.clientId == clientId);
    mine.sort(func (a, b) = Nat.compare(b.id, a.id));
  };

  public func listAllTickets(
    tickets : Map.Map<Nat, SupportTicket>,
  ) : [SupportTicket] {
    let all = tickets.values().toArray();
    all.sort(func (a, b) = Nat.compare(b.id, a.id));
  };

  public func replyTicket(
    tickets : Map.Map<Nat, SupportTicket>,
    id : Nat,
    reply : Text,
    status : Types.TicketStatus,
  ) : ?SupportTicket {
    switch (tickets.get(id)) {
      case (?ticket) {
        let updated : SupportTicket = {
          ticket with
          adminReply = ?reply;
          status;
          updatedAt = Time.now();
        };
        tickets.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  public func createNotice(
    notices : Map.Map<Nat, AdminNotice>,
    state : { var nextNoticeId : Nat },
    input : NoticeInput,
  ) : AdminNotice {
    let id = state.nextNoticeId;
    state.nextNoticeId := id + 1;
    let notice : AdminNotice = {
      id;
      title = input.title;
      body = input.body;
      clientId = input.clientId;
      createdAt = Time.now();
    };
    notices.add(id, notice);
    notice;
  };

  public func listNotices(
    notices : Map.Map<Nat, AdminNotice>,
    clientId : Nat,
  ) : [AdminNotice] {
    let visible = notices.values().toArray().filter(
      func notice = switch (notice.clientId) {
        case null { true };
        case (?target) { target == clientId };
      }
    );
    visible.sort(func (a, b) = Nat.compare(b.id, a.id));
  };
};
