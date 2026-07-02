"use client";

import {
  CalendarPlus,
  ImagePlus,
  LoaderCircle,
  Send,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { communityService } from "@/services/community.service";
import type { Event } from "@/types";
import type { CommunityPost } from "@/types/community";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function CommunityComposer({
  events,
  onCreated,
}: {
  events: Event[];
  onCreated: (post: CommunityPost) => void;
}) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [eventId, setEventId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const pendingEvent = window.sessionStorage.getItem(
      "cafze_community_event_attachment",
    );
    if (pendingEvent) {
      setEventId(pendingEvent);
      window.sessionStorage.removeItem("cafze_community_event_attachment");
    }
  }, []);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  function chooseImage(next?: File) {
    if (!next) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(next.type)) {
      toast.error("Choose a JPG, PNG or WebP image.");
      return;
    }
    if (next.size > MAX_IMAGE_SIZE) {
      toast.error("Community images must be 5 MB or smaller.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  function clearImage() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function publish() {
    const value = text.trim();
    if (!value || submitting) return;
    setSubmitting(true);
    try {
      const created = await communityService.create({
        text: value,
        file,
        event: events.find((event) => event.id === eventId) || null,
      });
      onCreated(created);
      setText("");
      setEventId("");
      clearImage();
      toast.success("Shared with the community");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const initial = user?.name?.trim().charAt(0).toUpperCase() || "C";

  return (
    <section className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {user?.image || user?.profileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image || user.profileImage}
            alt=""
            className="h-10 w-10 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-sm font-extrabold text-white">
            {initial}
          </span>
        )}
        <Textarea
          className="min-h-24 resize-none border-0 bg-muted/60 px-3 py-3 focus:ring-0"
          maxLength={2000}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Share an update, ${user?.name?.split(" ")[0] || "friend"}...`}
        />
      </div>

      {preview && (
        <div className="relative mt-3 overflow-hidden rounded-md border border-border bg-[#101815]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Selected post preview"
            className="max-h-96 w-full object-contain"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2"
            onClick={clearImage}
            aria-label="Remove image"
          >
            <X size={16} />
          </Button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus size={16} />
          Photo
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => chooseImage(event.target.files?.[0])}
        />

        <label className="relative flex min-w-0 flex-1 items-center sm:max-w-72">
          <CalendarPlus
            className="pointer-events-none absolute left-2.5 text-primary"
            size={15}
          />
          <select
            className="h-9 w-full appearance-none rounded-md border border-border bg-background pl-8 pr-7 text-xs font-semibold outline-none focus:border-primary"
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            aria-label="Attach an event"
          >
            <option value="">Attach an event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>

        <span className="ml-auto text-[10px] font-semibold text-muted-foreground">
          {text.length}/2000
        </span>
        <Button
          type="button"
          size="sm"
          disabled={!text.trim() || submitting}
          onClick={publish}
        >
          {submitting ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : (
            <Send size={16} />
          )}
          Post
        </Button>
      </div>
    </section>
  );
}
