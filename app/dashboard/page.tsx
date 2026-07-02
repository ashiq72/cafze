"use client";

import {
  ArrowRight,
  CalendarCheck2,
  CalendarRange,
  LoaderCircle,
  Plus,
  TicketCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import { eventService } from "@/services/event.service";
import type { Event } from "@/types";
import { getErrorMessage } from "@/lib/utils";

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    eventService
      .list()
      .then(setEvents)
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const now = Date.now();
    return {
      total: events.length,
      sold: events.reduce((sum, event) => sum + (event.ticketsSold || 0), 0),
      upcoming: events.filter(
        (event) => new Date(event.startsAt).getTime() > now,
      ).length,
    };
  }, [events]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase text-primary">
            Overview
          </p>
          <h1 className="mt-1 page-title">Your events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A clear view of events, ticket sales and what is coming up.
          </p>
        </div>
        <Button asChild variant="outline" className="hidden sm:inline-flex">
          <Link href="/events">
            Public listing
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <Metric
          icon={CalendarRange}
          label="Total events"
          value={loading ? "..." : metrics.total.toString()}
        />
        <Metric
          icon={TicketCheck}
          label="Tickets sold"
          value={loading ? "..." : metrics.sold.toLocaleString("en-BD")}
          accent
        />
        <Metric
          icon={CalendarCheck2}
          label="Upcoming"
          value={loading ? "..." : metrics.upcoming.toString()}
        />
      </div>

      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="section-title">All events</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/events/new">
              <Plus size={15} />
              New event
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="animate-spin" size={18} />
            Loading workspace
          </div>
        ) : error ? (
          <EmptyState
            icon={CalendarRange}
            title="Could not load events"
            description={error}
          />
        ) : events.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} organizer />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarRange}
            title="Create your first event"
            description="Add event details and ticket types, then share the public booking page."
            action={
              <Button asChild>
                <Link href="/dashboard/events/new">
                  <Plus size={16} />
                  Create event
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof CalendarRange;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex min-h-28 items-center justify-between rounded-lg border p-4 ${
        accent
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background"
      }`}
    >
      <div>
        <p
          className={`text-xs font-semibold ${
            accent ? "text-white/70" : "text-muted-foreground"
          }`}
        >
          {label}
        </p>
        <p className="mt-2 text-2xl font-extrabold">{value}</p>
      </div>
      <span
        className={`grid h-10 w-10 place-items-center rounded-md ${
          accent ? "bg-white/[0.12]" : "bg-secondary text-primary"
        }`}
      >
        <Icon size={20} />
      </span>
    </div>
  );
}
