import { EventForm } from "@/components/event-form";

export default function CreateEventPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-7">
        <p className="text-xs font-extrabold uppercase text-primary">
          New event
        </p>
        <h1 className="mt-1 page-title">Create an event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add the essential details now. You can update them later.
        </p>
      </div>
      <EventForm />
    </div>
  );
}
