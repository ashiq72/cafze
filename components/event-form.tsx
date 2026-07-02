"use client";

import {
  AlertCircle,
  CalendarClock,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Plus,
  Ticket,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Event, EventInput, EventStatus } from "@/types";
import { eventService } from "@/services/event.service";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

type TicketDraft = {
  key: string;
  name: string;
  price: string;
  quantity: string;
};

export function EventForm({ event }: { event?: Event }) {
  const router = useRouter();
  const previewUrlRef = useRef<string | null>(null);
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [startsAt, setStartsAt] = useState(
    event?.startsAt ? toLocalInput(event.startsAt) : "",
  );
  const [location, setLocation] = useState(event?.location || "");
  const [bannerPreview, setBannerPreview] = useState(event?.bannerUrl || "");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [status, setStatus] = useState<EventStatus>(
    event?.status || "published",
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [tickets, setTickets] = useState<TicketDraft[]>(
    event?.ticketTypes.length
      ? event.ticketTypes.map((ticket) => ({
          key: ticket.id,
          name: ticket.name,
          price: String(ticket.price),
          quantity: String(ticket.quantity),
        }))
      : [{ key: "ticket-initial", name: "Regular", price: "", quantity: "" }],
  );

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  function updateTicket(
    key: string,
    field: "name" | "price" | "quantity",
    value: string,
  ) {
    setTickets((items) =>
      items.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  }

  function handleBanner(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      const message = "Choose a JPG, PNG or WebP image.";
      setFormError(message);
      toast.error(message);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      const message = "Banner images must be 5 MB or smaller.";
      setFormError(message);
      toast.error(message);
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setBannerFile(file);
    setBannerPreview(url);
  }

  async function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (submitting) return;

    const validationError = validateEvent({
      title,
      description,
      startsAt,
      location,
      tickets,
      editing: Boolean(event),
    });
    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
      return;
    }

    const input: EventInput = {
      title: title.trim(),
      description: description.trim(),
      startsAt: new Date(startsAt).toISOString(),
      location: location.trim(),
      status,
      ticketTypes: tickets.map((ticket) => ({
        name: ticket.name.trim(),
        price: Number(ticket.price),
        quantity: Number(ticket.quantity),
      })),
    };

    setFormError("");
    setSubmitting(true);
    try {
      const saved = event
        ? await eventService.update(event.id, input)
        : await eventService.create(input);
      if (bannerFile) {
        try {
          await eventService.uploadBanner(saved.id, bannerFile);
        } catch (error) {
          toast.warning(
            `${event ? "Event updated" : "Event created"}, but the banner could not be uploaded: ${getErrorMessage(error)}`,
          );
          router.push(`/dashboard/events/${saved.id}`);
          return;
        }
      }
      toast.success(event ? "Event updated" : "Event created");
      router.push(`/dashboard/events/${saved.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-8" onSubmit={handleSubmit}>
      {formError && (
        <div
          className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          <AlertCircle className="mt-0.5 shrink-0" size={17} />
          <span>{formError}</span>
        </div>
      )}
      <section className="border-y border-border bg-background py-6 sm:rounded-lg sm:border sm:p-6">
        <div className="mb-6">
          <h2 className="text-base font-extrabold">Event information</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            The information guests will see on the public event page.
          </p>
        </div>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="title">Event title</Label>
            <Input
              id="title"
              placeholder="Dhaka Product Meetup 2026"
              value={title}
              onChange={(inputEvent) => setTitle(inputEvent.target.value)}
              minLength={3}
              maxLength={120}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell guests what to expect, who should attend and what is included."
              value={description}
              onChange={(inputEvent) => setDescription(inputEvent.target.value)}
              minLength={20}
              maxLength={5000}
              required
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startsAt">Date and time</Label>
              <div className="relative">
                <CalendarClock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <Input
                  id="startsAt"
                  className="pl-10"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(inputEvent) => setStartsAt(inputEvent.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <Input
                  id="location"
                  className="pl-10"
                  placeholder="Bangladesh Shilpakala Academy, Dhaka"
                  value={location}
                  onChange={(inputEvent) => setLocation(inputEvent.target.value)}
                  minLength={3}
                  maxLength={200}
                  required
                />
              </div>
            </div>
          </div>
          <div className="grid max-w-sm gap-2">
            <Label htmlFor="status">Visibility and status</Label>
            <select
              id="status"
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={status}
              onChange={(inputEvent) =>
                setStatus(inputEvent.target.value as EventStatus)
              }
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              {event && <option value="cancelled">Cancelled</option>}
              {event && <option value="completed">Completed</option>}
            </select>
            <p className="text-xs leading-5 text-muted-foreground">
              Draft events stay private. Cancelled and completed events stop
              accepting bookings.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background py-6 sm:rounded-lg sm:border sm:p-6">
        <div className="mb-5">
          <h2 className="text-base font-extrabold">Event banner</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG or WebP up to 5 MB. The banner appears on event and
            community pages.
          </p>
        </div>
        <label className="relative flex aspect-[16/6] min-h-44 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-input bg-muted transition hover:border-primary">
          {bannerPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerPreview}
              alt="Banner preview"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="grid justify-items-center gap-2 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-background text-primary shadow-sm">
                <ImagePlus size={20} />
              </span>
              <span className="text-sm font-bold">Choose banner image</span>
              <small className="text-muted-foreground">
                JPG, PNG or WebP, 16:6 recommended
              </small>
            </span>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(inputEvent) => handleBanner(inputEvent.target.files?.[0])}
          />
        </label>
      </section>

      <section className="border-y border-border bg-background py-6 sm:rounded-lg sm:border sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold">Ticket types</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Add Regular, VIP or any custom admission tier.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setTickets((items) => [
                ...items,
                {
                  key: cryptoKey(),
                  name: "",
                  price: "",
                  quantity: "",
                },
              ])
            }
            disabled={tickets.length >= 10}
          >
            <Plus size={15} />
            Add type
          </Button>
        </div>

        <div className="grid gap-3">
          {tickets.map((ticket, index) => (
            <div
              key={ticket.key}
              className="grid gap-3 rounded-md border border-border bg-muted/45 p-3 sm:grid-cols-[minmax(140px,1fr)_130px_130px_40px]"
            >
              <div className="grid gap-1.5">
                <Label className="text-xs" htmlFor={`ticket-name-${ticket.key}`}>
                  Ticket name
                </Label>
                <Input
                  id={`ticket-name-${ticket.key}`}
                  placeholder={index === 0 ? "Regular" : "VIP"}
                  value={ticket.name}
                  onChange={(inputEvent) =>
                    updateTicket(ticket.key, "name", inputEvent.target.value)
                  }
                  maxLength={50}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label
                  className="text-xs"
                  htmlFor={`ticket-price-${ticket.key}`}
                >
                  Price (BDT)
                </Label>
                <Input
                  id={`ticket-price-${ticket.key}`}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="500"
                  value={ticket.price}
                  onChange={(inputEvent) =>
                    updateTicket(ticket.key, "price", inputEvent.target.value)
                  }
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label
                  className="text-xs"
                  htmlFor={`ticket-quantity-${ticket.key}`}
                >
                  Quantity
                </Label>
                <Input
                  id={`ticket-quantity-${ticket.key}`}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="100"
                  value={ticket.quantity}
                  onChange={(inputEvent) =>
                    updateTicket(
                      ticket.key,
                      "quantity",
                      inputEvent.target.value,
                    )
                  }
                  required
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove ticket type"
                  disabled={tickets.length === 1}
                  onClick={() =>
                    setTickets((items) =>
                      items.filter((item) => item.key !== ticket.key),
                    )
                  }
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : (
            <Ticket size={16} />
          )}
          {submitting
            ? "Saving event"
            : event
              ? "Save changes"
              : "Create event"}
        </Button>
      </div>
    </form>
  );
}

function toLocalInput(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function cryptoKey() {
  return crypto.randomUUID?.() || `ticket-${Date.now()}`;
}

function validateEvent({
  title,
  description,
  startsAt,
  location,
  tickets,
  editing,
}: {
  title: string;
  description: string;
  startsAt: string;
  location: string;
  tickets: TicketDraft[];
  editing: boolean;
}) {
  if (title.trim().length < 3) {
    return "Event title must contain at least 3 characters.";
  }
  if (description.trim().length < 20) {
    return "Description must contain at least 20 characters.";
  }
  if (location.trim().length < 3) {
    return "Add a valid event location.";
  }

  const eventTime = new Date(startsAt).getTime();
  if (!startsAt || Number.isNaN(eventTime)) {
    return "Choose a valid event date and time.";
  }
  if (!editing && eventTime <= Date.now()) {
    return "New events must start in the future.";
  }
  if (!tickets.length || tickets.length > 10) {
    return "Add between 1 and 10 ticket types.";
  }

  const normalizedNames = tickets.map((ticket) =>
    ticket.name.trim().toLowerCase(),
  );
  if (normalizedNames.some((name) => !name)) {
    return "Every ticket type needs a name.";
  }
  if (new Set(normalizedNames).size !== normalizedNames.length) {
    return "Ticket type names must be unique.";
  }

  for (const ticket of tickets) {
    const price = Number(ticket.price);
    const quantity = Number(ticket.quantity);
    if (!Number.isFinite(price) || price < 0) {
      return `${ticket.name.trim() || "Ticket"} needs a valid non-negative price.`;
    }
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100_000
    ) {
      return `${ticket.name.trim() || "Ticket"} quantity must be between 1 and 100,000.`;
    }
  }

  return "";
}
