import type { Event, EventInput } from "@/types";
import {
  api,
  normalizeId,
  unwrapCollection,
  unwrapEntity,
} from "./api";

function normalizeEvent(event: Event) {
  const ticketTypes = (event.ticketTypes || []).map((ticket) => ({
    ...normalizeId(ticket),
    price: Number(ticket.price) || 0,
    quantity: Number(ticket.quantity) || 0,
    sold: Number(ticket.sold) || 0,
  }));

  return {
    ...normalizeId(event),
    startsAt: event.startsAt || event.date || "",
    ticketTypes,
    ticketsSold:
      Number(event.ticketsSold) ||
      ticketTypes.reduce((total, ticket) => total + (ticket.sold || 0), 0),
  };
}

export const eventService = {
  async list() {
    const { data } = await api.get("/api/events");
    return unwrapCollection<Event>(data, ["events", "result", "items"]).map(
      normalizeEvent,
    );
  },

  async listPublic() {
    const { data } = await api.get("/api/public/events");
    return unwrapCollection<Event>(data, [
      "events",
      "result",
      "items",
    ]).map(normalizeEvent);
  },

  async get(id: string) {
    const { data } = await api.get(`/api/events/${id}`);
    return normalizeEvent(
      unwrapEntity<Event>(data, ["event", "result", "item"]),
    );
  },

  async getPublic(slug: string) {
    const { data } = await api.get(`/api/public/events/${slug}`);
    return normalizeEvent(
      unwrapEntity<Event>(data, ["event", "result", "item"]),
    );
  },

  async create(input: EventInput) {
    const { data } = await api.post("/api/events", input);
    return normalizeEvent(
      unwrapEntity<Event>(data, ["event", "result", "item"]),
    );
  },

  async update(id: string, input: Partial<EventInput>) {
    const { data } = await api.put(`/api/events/${id}`, input);
    return normalizeEvent(
      unwrapEntity<Event>(data, ["event", "result", "item"]),
    );
  },

  async remove(id: string) {
    await api.delete(`/api/events/${id}`);
  },

  async uploadBanner(id: string, file: File) {
    const body = new FormData();
    body.append("file", file);
    const { data } = await api.patch(`/api/events/${id}/banner`, body);
    return normalizeEvent(
      unwrapEntity<Event>(data, ["event", "result", "item"]),
    );
  },
};
