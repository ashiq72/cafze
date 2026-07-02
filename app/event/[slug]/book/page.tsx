"use client";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  Mail,
  MapPin,
  Ticket,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { eventService } from "@/services/event.service";
import { ticketService } from "@/services/ticket.service";
import type { BookingResult, Event } from "@/types";
import {
  formatEventDate,
  formatMoney,
  getErrorMessage,
} from "@/lib/utils";

export default function BookingPage() {
  const params = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [formError, setFormError] = useState("");
  const requestKeyRef = useRef("");

  useEffect(() => {
    if (!params.slug) return;
    eventService
      .getPublic(params.slug)
      .then((value) => {
        setEvent(value);
        const firstAvailable = value.ticketTypes.find(
          (ticket) => ticket.quantity - (ticket.sold || 0) > 0,
        );
        setTicketTypeId(firstAvailable?.id || "");
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const selectedTicket = useMemo(
    () => event?.ticketTypes.find((ticket) => ticket.id === ticketTypeId),
    [event, ticketTypeId],
  );

  async function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (submitting || !event || !ticketTypeId) return;

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedName.length < 2) {
      setFormError("Enter the attendee's full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (
      !selectedTicket ||
      selectedTicket.quantity - (selectedTicket.sold || 0) <= 0
    ) {
      setFormError("This ticket type is sold out. Choose another ticket.");
      return;
    }

    setFormError("");
    setSubmitting(true);
    requestKeyRef.current ||= crypto.randomUUID();

    try {
      const booking = await ticketService.book({
        eventId: event.id,
        name: normalizedName,
        email: normalizedEmail,
        ticketTypeId,
      }, requestKeyRef.current);
      setResult(booking);
      toast.success("Your ticket is ready");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoaderCircle className="animate-spin text-primary" size={22} />
      </div>
    );
  }

  if (!event) {
    return (
      <>
        <SiteHeader />
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-xl font-extrabold">Event unavailable</h1>
          <Button asChild className="mt-5" variant="outline">
            <Link href="/events">Browse other events</Link>
          </Button>
        </div>
      </>
    );
  }

  if (result) {
    const qrValue =
      result.ticket.qrCode ||
      result.ticket.qrCodeUrl ||
      result.ticket.id;
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-xl px-4 py-10 sm:py-16">
          <div className="border-y border-border py-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary">
              <CheckCircle2 size={24} />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold">
              You&apos;re on the guest list
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Present this QR code at the entrance for check-in.
            </p>

            <div className="mx-auto mt-7 w-fit rounded-lg border border-border bg-white p-4">
              {result.ticket.qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.ticket.qrCodeUrl}
                  alt="Ticket QR code"
                  className="h-52 w-52"
                />
              ) : (
                <QRCodeSVG value={qrValue} size={208} level="M" />
              )}
            </div>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              Ticket {result.ticket.id}
            </p>
          </div>

          <div className="grid gap-3 py-7 text-sm">
            <div className="flex justify-between gap-5">
              <span className="text-muted-foreground">Event</span>
              <strong className="text-right">{event.title}</strong>
            </div>
            <div className="flex justify-between gap-5">
              <span className="text-muted-foreground">Guest</span>
              <strong>{result.attendee.name}</strong>
            </div>
            <div className="flex justify-between gap-5">
              <span className="text-muted-foreground">Ticket</span>
              <strong>{selectedTicket?.name}</strong>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/events">Explore more events</Link>
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-12">
        <Link
          href={`/event/${event.slug}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Back to event
        </Link>

        <div className="mt-6 grid gap-9 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section>
            <p className="text-xs font-extrabold uppercase text-primary">
              Ticket booking
            </p>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Complete your details
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your ticket and QR code will be created immediately.
            </p>

            <form
              className="mt-8 grid max-w-xl gap-5"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div
                  className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 shrink-0" size={15} />
                  {formError}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <Input
                    id="name"
                    className="pl-10"
                    value={name}
                    onChange={(inputEvent) => setName(inputEvent.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <Input
                    id="email"
                    className="pl-10"
                    type="email"
                    value={email}
                    onChange={(inputEvent) => setEmail(inputEvent.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <fieldset className="grid gap-2">
                <legend className="mb-2 text-sm font-semibold">
                  Select ticket
                </legend>
                {event.ticketTypes.map((ticket) => {
                  const remaining = Math.max(
                    0,
                    ticket.quantity - (ticket.sold || 0),
                  );
                  const soldOut = remaining === 0;

                  return (
                    <label
                      key={ticket.id}
                      className={`flex items-center justify-between gap-4 rounded-md border p-4 transition ${
                        soldOut
                          ? "cursor-not-allowed bg-muted opacity-60"
                          : "cursor-pointer"
                      } ${
                        ticketTypeId === ticket.id
                          ? "border-primary bg-secondary/60 ring-1 ring-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="ticketType"
                          value={ticket.id}
                          checked={ticketTypeId === ticket.id}
                          onChange={() => setTicketTypeId(ticket.id)}
                          disabled={soldOut}
                          className="h-4 w-4 accent-[hsl(var(--primary))]"
                        />
                        <span>
                          <strong className="block text-sm">
                            {ticket.name}
                          </strong>
                          <small className="text-muted-foreground">
                            {soldOut ? "Sold out" : `${remaining} available`}
                          </small>
                        </span>
                      </span>
                      <strong className="text-sm">
                        {ticket.price === 0
                          ? "Free"
                          : formatMoney(ticket.price)}
                      </strong>
                    </label>
                  );
                })}
              </fieldset>
              <Button size="lg" disabled={submitting || !ticketTypeId}>
                {submitting ? (
                  <LoaderCircle className="animate-spin" size={17} />
                ) : (
                  <Ticket size={17} />
                )}
                {submitting ? "Creating ticket" : "Confirm booking"}
              </Button>
            </form>
          </section>

          <aside>
            <div className="rounded-lg border border-border bg-[#f7f9f8] p-5 lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Booking summary
              </p>
              <h2 className="mt-3 text-lg font-extrabold">{event.title}</h2>
              <div className="mt-5 grid gap-3 text-xs text-muted-foreground">
                <span className="flex gap-2">
                  <CalendarDays size={15} className="shrink-0 text-primary" />
                  {formatEventDate(event.startsAt)}
                </span>
                <span className="flex gap-2">
                  <MapPin size={15} className="shrink-0 text-primary" />
                  {event.location}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <strong className="text-xl">
                  {selectedTicket
                    ? formatMoney(selectedTicket.price)
                    : formatMoney(0)}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
