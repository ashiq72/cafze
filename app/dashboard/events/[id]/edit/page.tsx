"use client";

import { LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EventForm } from "@/components/event-form";
import { eventService } from "@/services/event.service";
import type { Event } from "@/types";
import { getErrorMessage } from "@/lib/utils";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService
      .get(params.id)
      .then(setEvent)
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <LoaderCircle className="animate-spin text-primary" size={22} />
      </div>
    );
  }

  if (!event) {
    return <p className="text-sm text-muted-foreground">Event not found.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-7">
        <p className="text-xs font-extrabold uppercase text-primary">
          Edit event
        </p>
        <h1 className="mt-1 page-title">{event.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update event details and ticket availability.
        </p>
      </div>
      <EventForm event={event} />
    </div>
  );
}
