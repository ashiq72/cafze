"use client";

import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleDashed,
  Download,
  LoaderCircle,
  Mail,
  MapPin,
  Pencil,
  ScanLine,
  Search,
  Ticket,
  Trash2,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { eventService } from "@/services/event.service";
import { ticketService } from "@/services/ticket.service";
import type { Attendee, Event, Ticket as TicketRecord } from "@/types";
import {
  formatEventDate,
  formatMoney,
  getErrorMessage,
} from "@/lib/utils";

export default function OrganizerEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [attendeeQuery, setAttendeeQuery] = useState("");
  const [arrivalFilter, setArrivalFilter] = useState<
    "all" | "checked-in" | "not-arrived"
  >("all");

  useEffect(() => {
    if (!params.id) return;
    Promise.allSettled([
      eventService.get(params.id),
      ticketService.attendees(params.id),
      ticketService.list(params.id),
    ])
      .then(([eventResult, attendeeResult, ticketResult]) => {
        if (eventResult.status === "rejected") {
          toast.error(getErrorMessage(eventResult.reason));
          return;
        }

        setEvent(eventResult.value);
        if (attendeeResult.status === "fulfilled") {
          setAttendees(attendeeResult.value);
        } else {
          toast.warning("Event loaded, but attendees are temporarily unavailable.");
        }
        if (ticketResult.status === "fulfilled") {
          setTickets(ticketResult.value);
        } else {
          toast.warning("Event loaded, but ticket records are temporarily unavailable.");
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const checkedIn = useMemo(
    () => attendees.filter((attendee) => attendee.checkedIn).length,
    [attendees],
  );

  const visibleAttendees = useMemo(() => {
    const query = attendeeQuery.trim().toLowerCase();
    return attendees.filter((attendee) => {
      const matchesQuery =
        !query ||
        [
          attendee.name,
          attendee.email,
          typeof attendee.ticketType === "string"
            ? attendee.ticketType
            : attendee.ticketType?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesArrival =
        arrivalFilter === "all" ||
        (arrivalFilter === "checked-in" && attendee.checkedIn) ||
        (arrivalFilter === "not-arrived" && !attendee.checkedIn);
      return matchesQuery && matchesArrival;
    });
  }, [arrivalFilter, attendeeQuery, attendees]);

  function exportAttendees() {
    if (!event || !visibleAttendees.length) return;
    const rows = [
      ["Name", "Email", "Ticket", "Status", "Check-in time"],
      ...visibleAttendees.map((attendee) => [
        attendee.name,
        attendee.email,
        typeof attendee.ticketType === "string"
          ? attendee.ticketType
          : attendee.ticketType?.name || "Standard",
        attendee.checkedIn ? "Checked in" : "Not arrived",
        attendee.checkedInAt || "",
      ]),
    ];
    const csv = rows
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${event.slug}-attendees.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function removeEvent() {
    if (
      !event ||
      !window.confirm(
        "Delete this event? Events with issued tickets must be cancelled instead.",
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await eventService.remove(event.id);
      toast.success("Event deleted");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="animate-spin" size={18} />
        Loading event
      </div>
    );
  }

  if (!event) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Event not found"
        description="This event may have been removed or is not available to your account."
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <Badge>{event.status || "Published"}</Badge>
            <span className="text-xs text-muted-foreground">
              {tickets.length} ticket records
            </span>
          </div>
          <h1 className="mt-3 page-title">{event.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              {formatEventDate(event.startsAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {event.location}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href="/community"
              onClick={() =>
                window.sessionStorage.setItem(
                  "cafze_community_event_attachment",
                  event.id,
                )
              }
            >
              <UsersRound size={15} />
              Share
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/event/${event.slug}`} target="_blank">
              Public page
              <ArrowUpRight size={15} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/events/${event.id}/edit`}>
              <Pencil size={15} />
              Edit
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/check-in">
              <ScanLine size={15} />
              Check-in
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <Summary icon={Ticket} label="Tickets issued" value={tickets.length} />
        <Summary icon={Users} label="Attendees" value={attendees.length} />
        <Summary icon={Check} label="Checked in" value={checkedIn} accent />
      </div>

      <div className="mt-9 grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside>
          <h2 className="section-title">Ticket types</h2>
          <div className="mt-4 divide-y divide-border border-y border-border">
            {event.ticketTypes.map((ticketType) => (
              <div key={ticketType.id} className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <strong className="text-sm">{ticketType.name}</strong>
                  <strong className="text-sm">
                    {formatMoney(ticketType.price)}
                  </strong>
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{ticketType.sold || 0} sold</span>
                  <span>{ticketType.quantity} capacity</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.min(
                        100,
                        ((ticketType.sold || 0) /
                          Math.max(1, ticketType.quantity)) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            className="mt-6 w-full"
            variant="destructive"
            size="sm"
            onClick={removeEvent}
            disabled={deleting}
          >
            {deleting ? (
              <LoaderCircle className="animate-spin" size={15} />
            ) : (
              <Trash2 size={15} />
            )}
            Delete event
          </Button>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="section-title">Attendees</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Guest list and live entry status
              </p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {checkedIn}/{attendees.length} checked in
            </span>
          </div>

          {attendees.length ? (
            <>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={15}
                  />
                  <Input
                    className="h-9 bg-background pl-9"
                    placeholder="Search name, email or ticket"
                    value={attendeeQuery}
                    onChange={(inputEvent) =>
                      setAttendeeQuery(inputEvent.target.value)
                    }
                  />
                </div>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-xs font-semibold outline-none focus:border-primary"
                  value={arrivalFilter}
                  onChange={(inputEvent) =>
                    setArrivalFilter(
                      inputEvent.target.value as typeof arrivalFilter,
                    )
                  }
                  aria-label="Filter attendee status"
                >
                  <option value="all">All guests</option>
                  <option value="checked-in">Checked in</option>
                  <option value="not-arrived">Not arrived</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!visibleAttendees.length}
                  onClick={exportAttendees}
                >
                  <Download size={15} />
                  Export CSV
                </Button>
              </div>
              {visibleAttendees.length ? (
                <div className="overflow-x-auto rounded-lg border border-border bg-background">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-muted/70 text-[11px] uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-bold">Guest</th>
                    <th className="px-4 py-3 font-bold">Ticket</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Check-in time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleAttendees.map((attendee) => (
                    <tr key={attendee.id}>
                      <td className="px-4 py-3">
                        <strong className="block text-xs">
                          {attendee.name}
                        </strong>
                        <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Mail size={11} />
                          {attendee.email}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {typeof attendee.ticketType === "string"
                          ? attendee.ticketType
                          : attendee.ticketType?.name || "Standard"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${
                            attendee.checkedIn
                              ? "bg-secondary text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {attendee.checkedIn ? (
                            <Check size={12} />
                          ) : (
                            <CircleDashed size={12} />
                          )}
                          {attendee.checkedIn ? "Checked in" : "Not arrived"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {attendee.checkedInAt
                          ? formatEventDate(attendee.checkedInAt)
                          : "Not yet"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
              ) : (
                <EmptyState
                  icon={Search}
                  title="No matching attendees"
                  description="Try a different search or arrival filter."
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Users}
              title="No attendees yet"
              description="Guests will appear here after they book a ticket."
            />
          )}
        </section>
      </div>
    </div>
  );
}

function csvCell(value: string) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function Summary({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof Ticket;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
      <span
        className={`grid h-9 w-9 place-items-center rounded-md ${
          accent ? "bg-primary text-white" : "bg-secondary text-primary"
        }`}
      >
        <Icon size={17} />
      </span>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-extrabold">{value}</p>
      </div>
    </div>
  );
}
