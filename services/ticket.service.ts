import type {
  Attendee,
  BookingResult,
  CheckinResult,
  Ticket,
} from "@/types";
import {
  api,
  normalizeId,
  unwrapCollection,
  unwrapEntity,
} from "./api";

export const ticketService = {
  async list(eventId: string) {
    const { data } = await api.get(`/api/tickets/${eventId}`);
    return unwrapCollection<Ticket>(data, [
      "tickets",
      "result",
      "items",
    ]).map(normalizeId);
  },

  async attendees(eventId: string) {
    const { data } = await api.get(`/api/attendees/${eventId}`);
    return unwrapCollection<Attendee>(data, [
      "attendees",
      "result",
      "items",
    ]).map(normalizeId);
  },

  async book(input: {
    eventId: string;
    name: string;
    email: string;
    ticketTypeId: string;
  }, requestKey?: string): Promise<BookingResult> {
    const idempotencyKey = requestKey || crypto.randomUUID();
    const attendeeResponse = await api.post(
      "/api/attendees",
      {
        eventId: input.eventId,
        name: input.name,
        email: input.email,
      },
      { headers: { "Idempotency-Key": idempotencyKey } },
    );
    const attendee = normalizeId(
      unwrapEntity<Attendee>(attendeeResponse.data, [
        "attendee",
        "result",
        "item",
      ]),
    );
    if (!attendee.id) {
      throw new Error("The server created no attendee identifier.");
    }

    const ticketResponse = await api.post(
      "/api/tickets",
      {
        eventId: input.eventId,
        attendeeId: attendee.id,
        ticketTypeId: input.ticketTypeId,
        name: input.name,
        email: input.email,
      },
      { headers: { "Idempotency-Key": idempotencyKey } },
    );
    const ticket = normalizeId(
      unwrapEntity<Ticket>(ticketResponse.data, [
        "ticket",
        "result",
        "item",
      ]),
    );
    if (!ticket.id) {
      throw new Error("The server created no ticket identifier.");
    }

    return { attendee, ticket };
  },

  async checkin(ticketId: string): Promise<CheckinResult> {
    try {
      const { data } = await api.post("/api/checkin", { ticketId });
      const result = unwrapEntity<
        Partial<CheckinResult> & { valid?: boolean; alreadyUsed?: boolean }
      >(data, ["checkin", "result"]);

      if (result.alreadyUsed || result.status === "already-used") {
        return {
          status: "already-used",
          message: result.message || "This ticket has already been used.",
          attendee: result.attendee,
        };
      }

      return {
        status: result.valid === false ? "invalid" : "valid",
        message: result.message || "Ticket checked in successfully.",
        attendee: result.attendee,
      };
    } catch (error) {
      const response = (
        error as {
          response?: { status?: number; data?: { message?: string } };
        }
      ).response;
      const status = response?.status;
      if (!response || status === undefined || status === 401 || status >= 500) {
        throw error;
      }
      const message = response.data?.message || "This ticket is invalid.";
      const used = /already|used|checked in/i.test(message);
      return {
        status: used ? "already-used" : "invalid",
        message,
      };
    }
  },
};
