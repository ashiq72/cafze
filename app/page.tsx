"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  UsersRound,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { EventCard } from "@/components/event-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { eventService } from "@/services/event.service";
import type { Event } from "@/types";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=2000&q=88";
const COMMUNITY_IMAGE =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=84";
const ORGANIZER_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=84";

export default function HomePage() {
  const router = useRouter();
  const { signedIn } = useAuth();
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService
      .listPublic()
      .then((items) => {
        const upcoming = items
          .filter((event) => new Date(event.startsAt).getTime() > Date.now())
          .slice(0, 3);
        setEvents(upcoming);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/events?search=${encodeURIComponent(query)}` : "/events");
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative flex min-h-[620px] max-h-[780px] items-end overflow-hidden bg-[#102f28] sm:min-h-[680px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt="A large live event with an engaged audience"
            className="hero-image absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="hero-content relative mx-auto w-full max-w-7xl px-4 pb-16 pt-28 text-white sm:px-6 sm:pb-24">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase text-orange-300">
              <Sparkles size={15} />
              Discover, gather, belong
            </p>
            <h1 className="mt-4 max-w-4xl text-[34px] font-extrabold leading-[1.08] tracking-normal sm:text-5xl lg:text-[64px]">
              Community events in Bangladesh
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-lg">
              Find people around shared interests, join meaningful events, or
              host your own with ticketing and mobile QR check-in built in.
            </p>

            <form
              onSubmit={submitSearch}
              className="mt-8 flex max-w-3xl flex-col gap-2 rounded-lg border border-white/50 bg-white p-2 shadow-2xl sm:flex-row"
            >
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7c76]"
                  size={18}
                />
                <input
                  className="h-12 w-full rounded-md border-0 bg-white pl-11 pr-3 text-sm text-[#18342c] outline-none"
                  placeholder="Search concerts, workshops, meetups..."
                  value={search}
                  onChange={(inputEvent) => setSearch(inputEvent.target.value)}
                  aria-label="Search events"
                />
              </div>
              <Button className="h-12 px-6" type="submit">
                Explore events
                <ArrowRight size={17} />
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {["Dhaka", "Chattogram", "Workshops", "Music", "Tech"].map(
                (item) => (
                  <Link
                    key={item}
                    href={`/events?search=${encodeURIComponent(item)}`}
                    className="rounded-full border border-white/35 bg-black/15 px-3 py-1.5 font-semibold text-white/85 backdrop-blur hover:bg-white hover:text-[#173f35]"
                  >
                    {item}
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-7xl divide-y divide-border px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
            <Value
              icon={UsersRound}
              title="One community"
              text="Meet attendees before and after an event."
              tone="coral"
            />
            <Value
              icon={Ticket}
              title="Simple tickets"
              text="Clear ticket tiers and instant QR confirmation."
              tone="gold"
            />
            <Value
              icon={QrCode}
              title="Fast entry"
              text="Mobile scanning keeps venue queues moving."
              tone="green"
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase text-primary">
                Happening soon
              </p>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                Find your next gathering
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Explore upcoming experiences created by independent organizers
                and communities.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/events">
                View all events
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index}>
                    <Skeleton className="aspect-[16/9] w-full" />
                    <Skeleton className="mt-4 h-5 w-4/5" />
                    <Skeleton className="mt-3 h-4 w-2/3" />
                  </div>
                ))
              : events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
          </div>

          {!loading && !events.length && (
            <div className="mt-8 flex min-h-48 flex-col items-center justify-center border-y border-border text-center">
              <CalendarDays size={24} className="text-primary" />
              <h3 className="mt-3 text-base font-extrabold">
                New events are on the way
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first organizer to publish an event.
              </p>
              <Button asChild className="mt-5" size="sm">
                <Link href={signedIn ? "/dashboard/events/new" : "/register"}>
                  Create an event
                </Link>
              </Button>
            </div>
          )}
        </section>

        <section className="border-y border-border bg-[#f7f9f8]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase text-primary">
                Explore your kind of crowd
              </p>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                Every interest has a place here
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Browse lively nights, practical workshops, professional
                gatherings and local community experiences.
              </p>
            </div>
            <div className="mt-8 grid auto-rows-[190px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DiscoveryTile
                title="Live music"
                label="Concerts and culture"
                search="Music"
                image="https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=84"
                className="sm:row-span-2 lg:col-span-2"
              />
              <DiscoveryTile
                title="Tech and ideas"
                label="Meetups and conferences"
                search="Tech"
                image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=84"
              />
              <DiscoveryTile
                title="Workshops"
                label="Learn by doing"
                search="Workshops"
                image="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=84"
              />
              <DiscoveryTile
                title="Community"
                label="People and shared interests"
                search="Community"
                image="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=84"
                className="sm:col-span-2"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#eff5f1]">
          <div className="mx-auto grid max-w-7xl items-center gap-9 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
            <div className="group relative overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={COMMUNITY_IMAGE}
                alt="Friends connecting at a community gathering"
                className="aspect-[4/3] h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-md bg-white/95 px-3 py-2 text-[#173f35] shadow-soft backdrop-blur">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-primary">
                  <UsersRound size={16} />
                </span>
                <span>
                  <strong className="block text-xs">Built around people</strong>
                  <span className="text-[10px] text-[#657970]">
                    Before, during and after
                  </span>
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase text-primary">
                More than a booking page
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                Join the conversation around every event
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                Cafze combines Free4Mood-style community interaction with event
                discovery. Share updates, follow interesting people, discuss
                upcoming gatherings, and move from a post directly into booking.
              </p>
              <div className="mt-6 grid gap-3 text-sm">
                <Feature text="Community posts with photos and event attachments" />
                <Feature text="Likes, comments, follows and notifications" />
                <Feature text="Profiles that keep the relationship going" />
              </div>
              <Button asChild className="mt-7">
                <Link href={signedIn ? "/community" : "/register"}>
                  {signedIn ? "Open community" : "Join the community"}
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase text-primary">
              For organizers
            </p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              From idea to full room
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              A focused workflow for small teams, independent hosts and local
              communities.
            </p>
          </div>
          <div className="mt-9 grid overflow-hidden rounded-lg border border-border bg-background shadow-sm md:grid-cols-3 md:divide-x md:divide-y-0">
            <Step
              number="01"
              icon={CalendarDays}
              title="Publish"
              text="Create the event, schedule it and define Regular, VIP or custom ticket tiers."
            />
            <Step
              number="02"
              icon={UsersRound}
              title="Build momentum"
              text="Attach the event to a community post and turn conversation into attendance."
            />
            <Step
              number="03"
              icon={Zap}
              title="Welcome guests"
              text="Track attendees and scan QR tickets from a phone at the entrance."
            />
          </div>
        </section>

        <section className="bg-[#173f35] text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-9 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="text-xs font-extrabold uppercase text-orange-300">
                Door operations
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                Check in guests without the clipboard chaos
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
                Use a mobile camera to scan each QR ticket. Cafze immediately
                shows valid, already-used or invalid status and updates the
                attendee record.
              </p>
              <div className="mt-6 flex flex-wrap gap-5 text-xs text-white/80">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-orange-300" />
                  Duplicate-entry protection
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-orange-300" />
                  Manual ID fallback
                </span>
              </div>
              <Button
                asChild
                className="mt-7 bg-white text-[#173f35] hover:bg-white/90"
              >
                <Link href={signedIn ? "/dashboard/check-in" : "/login"}>
                  Open check-in
                  <QrCode size={17} />
                </Link>
              </Button>
            </div>
            <div className="group overflow-hidden rounded-lg border border-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ORGANIZER_IMAGE}
                alt="A professionally produced live event"
                className="aspect-[16/10] h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
              />
            </div>
          </div>
        </section>

        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Bring your community together
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Create an account, publish an event and start the conversation.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/events">Explore events</Link>
              </Button>
              <Button
                asChild
                className="bg-white text-primary hover:bg-white/90"
              >
                <Link href={signedIn ? "/dashboard/events/new" : "/register"}>
                  Start organizing
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Value({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: typeof UsersRound;
  title: string;
  text: string;
  tone: "coral" | "gold" | "green";
}) {
  const toneClass = {
    coral: "bg-secondary text-primary",
    gold: "bg-[#fff1c6] text-[#8a6416]",
    green: "bg-[#e5f4ef] text-[#16705b]",
  }[tone];

  return (
    <div className="flex gap-3 py-5 sm:px-6 sm:py-6 first:pl-0">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${toneClass}`}
      >
        <Icon size={17} />
      </span>
      <span>
        <strong className="block text-sm">{title}</strong>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {text}
        </span>
      </span>
    </div>
  );
}

function DiscoveryTile({
  title,
  label,
  search,
  image,
  className = "",
}: {
  title: string;
  label: string;
  search: string;
  image: string;
  className?: string;
}) {
  return (
    <Link
      href={`/events?search=${encodeURIComponent(search)}`}
      className={`group relative min-h-0 overflow-hidden rounded-lg bg-[#173f35] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-black/45 transition group-hover:bg-black/55" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
        <span>
          <span className="text-[10px] font-extrabold uppercase text-orange-300">
            {label}
          </span>
          <strong className="mt-1 block text-lg">{title}</strong>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/35 bg-black/20 transition group-hover:bg-white group-hover:text-[#173f35]">
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-3">
      <CheckCircle2 className="shrink-0 text-primary" size={17} />
      {text}
    </span>
  );
}

function Step({
  number,
  icon: Icon,
  title,
  text,
}: {
  number: string;
  icon: typeof CalendarDays;
  title: string;
  text: string;
}) {
  return (
    <div className="group relative border-b border-border p-7 last:border-b-0 md:border-b-0">
      <span className="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-secondary text-primary">
          <Icon size={19} />
        </span>
        <span className="text-xs font-extrabold text-muted-foreground">
          {number}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
