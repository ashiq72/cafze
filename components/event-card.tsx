import { ArrowUpRight, CalendarDays, MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import type { Event } from "@/types";
import { formatEventDate, formatMoney } from "@/lib/utils";
import { Badge } from "./ui/badge";

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=82";

export function EventCard({
  event,
  organizer = false,
}: {
  event: Event;
  organizer?: boolean;
}) {
  const lowestPrice = event.ticketTypes.length
    ? Math.min(...event.ticketTypes.map((ticket) => Number(ticket.price) || 0))
    : 0;
  const href = organizer
    ? `/dashboard/events/${event.id}`
    : `/event/${event.slug}`;

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-lg border border-border bg-background transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.bannerUrl || FALLBACK_BANNER}
          alt=""
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur">
          {event.status || "Published"}
        </Badge>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-extrabold leading-6">
            {event.title}
          </h3>
          <ArrowUpRight
            className="mt-0.5 shrink-0 text-muted-foreground transition group-hover:text-primary"
            size={18}
          />
        </div>
        <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays size={14} className="text-primary" />
            {formatEventDate(event.startsAt)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={14} className="text-primary" />
            <span className="truncate">{event.location}</span>
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Ticket size={14} />
            {event.ticketsSold || 0} sold
          </span>
          <strong className="text-sm text-foreground">
            {lowestPrice === 0 ? "Free" : `From ${formatMoney(lowestPrice)}`}
          </strong>
        </div>
      </div>
    </Link>
  );
}
