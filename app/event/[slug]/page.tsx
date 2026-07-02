"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { eventService } from "@/services/event.service";
import type { Event } from "@/types";
import { formatEventDate, formatMoney, getErrorMessage } from "@/lib/utils";

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1800&q=86";

export default function PublicEventPage() {
  const params = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.slug) return;
    eventService
      .getPublic(params.slug)
      .then(setEvent)
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <>
        <SiteHeader />
        <div className="grid min-h-[65vh] place-items-center">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="animate-spin" size={18} />
            Loading event
          </span>
        </div>
      </>
    );
  }

  if (!event || error) {
    return (
      <>
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-4 py-16">
          <EmptyState
            icon={Ticket}
            title="Event not found"
            description={error || "This event may no longer be available."}
            action={
              <Button asChild variant="outline">
                <Link href="/events">Browse events</Link>
              </Button>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="pb-24 lg:pb-12">
        <section className="bg-[#102f28]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs font-bold text-white/75 hover:text-white"
            >
              <ArrowLeft size={15} />
              All events
            </Link>
          </div>
          <div className="mx-auto max-w-7xl px-4 pb-7 sm:px-6 sm:pb-10">
            <div className="relative aspect-[16/9] max-h-[560px] overflow-hidden rounded-lg bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.bannerUrl || FALLBACK_BANNER}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article>
            <Badge>{event.status || "Published"}</Badge>
            <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight tracking-normal sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>
            <div className="mt-6 grid gap-4 border-y border-border py-6 text-sm sm:grid-cols-2">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 text-primary" size={19} />
                <span>
                  <strong className="block">Date and time</strong>
                  <span className="mt-1 block text-muted-foreground">
                    {formatEventDate(event.startsAt)}
                  </span>
                </span>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 text-primary" size={19} />
                <span>
                  <strong className="block">Location</strong>
                  <span className="mt-1 block text-muted-foreground">
                    {event.location}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-9">
              <h2 className="section-title">About this event</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
                {event.description}
              </p>
            </div>

            <div className="mt-10">
              <h2 className="section-title">Ticket types</h2>
              <div className="mt-4 divide-y divide-border border-y border-border">
                {event.ticketTypes.map((ticket) => {
                  const remaining = Math.max(
                    0,
                    ticket.quantity - (ticket.sold || 0),
                  );
                  return (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div>
                        <strong className="text-sm">{ticket.name}</strong>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {remaining} remaining
                        </p>
                      </div>
                      <strong className="text-sm">
                        {ticket.price === 0
                          ? "Free"
                          : formatMoney(ticket.price)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border border-border bg-background p-5 shadow-soft">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Tickets from
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {event.ticketTypes.length
                  ? formatMoney(
                      Math.min(...event.ticketTypes.map((item) => item.price)),
                    )
                  : "Unavailable"}
              </p>
              <Button
                asChild
                size="lg"
                className="mt-5 w-full"
                disabled={!event.ticketTypes.length}
              >
                <Link href={`/event/${event.slug}/book`}>
                  <Ticket size={17} />
                  Get ticket
                </Link>
              </Button>
              <div className="mt-5 grid gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-primary" />
                  Secure booking
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 size={15} className="text-primary" />
                  Instant ticket delivery
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-primary" />
                  QR entry at the venue
                </span>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background p-3 shadow-[0_-8px_24px_rgba(20,46,39,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">
              Tickets from
            </p>
            <strong className="text-sm">
              {event.ticketTypes.length
                ? formatMoney(
                    Math.min(...event.ticketTypes.map((item) => item.price)),
                  )
                : "Unavailable"}
            </strong>
          </div>
          <Button asChild disabled={!event.ticketTypes.length}>
            <Link href={`/event/${event.slug}/book`}>
              <Ticket size={16} />
              Get ticket
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

