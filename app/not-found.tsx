import { CalendarX2 } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          icon={CalendarX2}
          title="Page not found"
          description="The page may have moved, or the event is no longer available."
          action={
            <Button asChild>
              <Link href="/events">Browse events</Link>
            </Button>
          }
        />
      </main>
    </>
  );
}

