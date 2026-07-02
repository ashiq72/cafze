"use client";

import { CalendarSearch, LoaderCircle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EventCard } from "@/components/event-card";
import { SiteHeader } from "@/components/site-header";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { eventService } from "@/services/event.service";
import type { Event } from "@/types";
import { getErrorMessage } from "@/lib/utils";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initialQuery = new URLSearchParams(window.location.search).get(
      "search",
    );
    if (initialQuery) setQuery(initialQuery);
    eventService
      .listPublic()
      .then(setEvents)
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, []);

  const visibleEvents = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return events;
    return events.filter((event) =>
      [event.title, event.location, event.description]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [events, query]);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-[#f5f8f6]">
          <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase text-primary">
                Events across Bangladesh
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-normal sm:text-4xl">
                Find your next event
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Discover workshops, concerts, conferences and community
                gatherings from independent organizers.
              </p>
            </div>
            <div className="relative mt-7 max-w-xl">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                className="h-12 bg-background pl-11 shadow-sm"
                placeholder="Search by event, venue or topic"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="section-title">Upcoming events</h2>
            {!loading && (
              <span className="text-xs font-semibold text-muted-foreground">
                {visibleEvents.length} events
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-60 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="animate-spin" size={18} />
              Loading events
            </div>
          ) : error ? (
            <EmptyState
              icon={CalendarSearch}
              title="Events are unavailable"
              description={`${error}. Check the API URL and try again.`}
            />
          ) : visibleEvents.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarSearch}
              title={query ? "No matching events" : "No upcoming events"}
              description={
                query
                  ? "Try a different event name, location or topic."
                  : "New events will appear here as organizers publish them."
              }
            />
          )}
        </section>
      </main>
    </>
  );
}
