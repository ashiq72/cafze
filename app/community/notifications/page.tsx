"use client";

import {
  Bell,
  CheckCheck,
  Heart,
  LoaderCircle,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { communityService } from "@/services/community.service";
import type { CommunityNotification } from "@/types/community";
import { formatEventDate, getErrorMessage } from "@/lib/utils";

export default function CommunityNotificationsPage() {
  const [items, setItems] = useState<CommunityNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    communityService
      .notifications({ limit: 40 })
      .then((result) => setItems(result.items))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  async function markAll() {
    if (marking) return;
    setMarking(true);
    try {
      await communityService.markAllNotificationsRead();
      setItems((current) =>
        current.map((item) => ({ ...item, isRead: true })),
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setMarking(false);
    }
  }

  async function open(item: CommunityNotification) {
    if (!item.isRead) {
      communityService.markNotificationRead(item.id).catch(() => undefined);
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, isRead: true } : entry,
        ),
      );
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5f8f6] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase text-primary">
              Community
            </p>
            <h1 className="mt-1 text-2xl font-extrabold">Notifications</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={marking || !items.some((item) => !item.isRead)}
            onClick={markAll}
          >
            {marking ? (
              <LoaderCircle className="animate-spin" size={15} />
            ) : (
              <CheckCheck size={15} />
            )}
            Mark all read
          </Button>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-background">
          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="animate-spin" size={18} />
              Loading notifications
            </div>
          ) : items.length ? (
            <div className="divide-y divide-border">
              {items.map((item) => {
                const Icon =
                  item.type === "like"
                    ? Heart
                    : item.type === "comment"
                      ? MessageCircle
                      : UserPlus;
                const href = item.post?.id
                  ? `/community/post/${item.post.id}`
                  : `/community/profile/${item.actor.id}`;
                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => open(item)}
                    className={`flex gap-3 p-4 transition hover:bg-muted ${
                      item.isRead ? "" : "bg-secondary/45"
                    }`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-xs leading-5">
                        <strong>{item.actor.name}</strong>{" "}
                        {item.type === "like"
                          ? "liked your post."
                          : item.type === "comment"
                            ? "commented on your post."
                            : "started following you."}
                      </span>
                      {item.commentText && (
                        <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                          &quot;{item.commentText}&quot;
                        </span>
                      )}
                      <span className="mt-1 block text-[10px] text-muted-foreground">
                        {item.createdAt
                          ? formatEventDate(item.createdAt)
                          : "Recently"}
                      </span>
                    </span>
                    {!item.isRead && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="You're all caught up"
              description="Likes, comments and new followers will appear here."
            />
          )}
        </div>
      </div>
    </main>
  );
}
