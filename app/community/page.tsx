"use client";

import {
  Bell,
  CalendarDays,
  Compass,
  LayoutDashboard,
  LoaderCircle,
  RefreshCw,
  Ticket,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CommunityComposer } from "@/components/community/community-composer";
import { CommunityPostCard } from "@/components/community/community-post-card";
import { CommunitySearch } from "@/components/community/community-search";
import { PeopleSuggestions } from "@/components/community/people-suggestions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { communityService } from "@/services/community.service";
import { eventService } from "@/services/event.service";
import type { Event } from "@/types";
import type { CommunityPost } from "@/types/community";
import { formatEventDate, getErrorMessage } from "@/lib/utils";

type FeedMode = "all" | "following" | "events";

export default function CommunityPage() {
  const { user } = useAuth();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [mode, setMode] = useState<FeedMode>("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyPostId, setBusyPostId] = useState("");
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    eventService
      .listPublic()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setPosts([]);
    setCursor(null);
    setHasMore(false);
    communityService
      .feed({ limit: 10, ...feedQuery(mode) })
      .then((page) => {
        if (!active) return;
        setPosts(page.posts);
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
      })
      .catch((reason) => {
        if (active) setError(getErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mode]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore || !cursor) return;
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore();
      },
      { rootMargin: "500px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  });

  function replace(updated: CommunityPost) {
    setPosts((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  async function like(post: CommunityPost) {
    if (busyPostId) return;
    const liked = Boolean(user?.id && post.likes.includes(user.id));
    const optimistic = {
      ...post,
      likes: user?.id
        ? liked
          ? post.likes.filter((id) => id !== user.id)
          : [...post.likes, user.id]
        : post.likes,
    };
    replace(optimistic);
    setBusyPostId(post.id);
    try {
      replace(await communityService.toggleLike(post.id));
    } catch (reason) {
      replace(post);
      toast.error(getErrorMessage(reason));
    } finally {
      setBusyPostId("");
    }
  }

  async function comment(post: CommunityPost, text: string) {
    try {
      replace(await communityService.addComment(post.id, text));
    } catch (reason) {
      toast.error(getErrorMessage(reason));
    }
  }

  async function remove(post: CommunityPost) {
    if (!window.confirm("Delete this community post?")) return;
    try {
      await communityService.remove(post.id);
      setPosts((items) => items.filter((item) => item.id !== post.id));
      toast.success("Post deleted");
    } catch (reason) {
      toast.error(getErrorMessage(reason));
    }
  }

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await communityService.feed({
        limit: 10,
        cursor,
        ...feedQuery(mode),
      });
      setPosts((items) => {
        const seen = new Set(items.map((item) => item.id));
        return [...items, ...page.posts.filter((item) => !seen.has(item.id))];
      });
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (reason) {
      toast.error(getErrorMessage(reason));
    } finally {
      setLoadingMore(false);
    }
  }

  const upcoming = events
    .filter((event) => new Date(event.startsAt).getTime() > Date.now())
    .slice(0, 4);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5f8f6]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[200px_minmax(0,680px)] xl:grid-cols-[200px_minmax(0,680px)_280px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 grid gap-1">
            <CommunityNav
              href="/community"
              icon={UsersRound}
              label="Community"
              active
            />
            <CommunityNav
              href="/community/notifications"
              icon={Bell}
              label="Notifications"
            />
            <CommunityNav href="/events" icon={Compass} label="Discover" />
            <CommunityNav
              href="/community/profile"
              icon={UserRound}
              label="My profile"
            />
            <CommunityNav
              href="/dashboard"
              icon={LayoutDashboard}
              label="Organizer"
            />
            <div className="mt-5 border-t border-border pt-5">
              <p className="px-3 text-[10px] font-extrabold uppercase text-muted-foreground">
                Signed in as
              </p>
              <p className="mt-2 truncate px-3 text-xs font-bold">
                {user?.name || user?.email}
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="mb-5">
            <p className="text-xs font-extrabold uppercase text-primary">
              Community pulse
            </p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              Events start with people
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Share updates, discover gatherings and meet the people attending.
            </p>
            <div className="mt-5">
              <CommunitySearch />
            </div>
          </header>

          <CommunityComposer
            events={events}
            onCreated={(post) => setPosts((items) => [post, ...items])}
          />

          <div
            className="mt-5 grid grid-cols-3 border-b border-border"
            role="tablist"
            aria-label="Community feed"
          >
            {(
              [
                ["all", "For you"],
                ["following", "Following"],
                ["events", "Events"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                className={`h-10 border-b-2 text-xs font-bold transition ${
                  mode === value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMode(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4">
            {loading ? (
              <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="animate-spin" size={18} />
                Loading community
              </div>
            ) : error ? (
              <EmptyState
                icon={UsersRound}
                title="Community is unavailable"
                description={error}
                action={
                  <Button onClick={() => window.location.reload()}>
                    <RefreshCw size={15} />
                    Try again
                  </Button>
                }
              />
            ) : posts.length ? (
              <>
                {posts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    busy={busyPostId === post.id}
                    onLike={like}
                    onComment={comment}
                    onDelete={remove}
                  />
                ))}
                <div
                  ref={loadMoreRef}
                  className="flex h-12 items-center justify-center"
                >
                  {hasMore && loadingMore && (
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <LoaderCircle className="animate-spin" size={15} />
                      Loading more
                    </span>
                  )}
                </div>
              </>
            ) : (
              <EmptyState
                icon={UsersRound}
                title="Start the conversation"
                description="Share an event, ask a question or post an update for the community."
              />
            )}
          </div>
        </section>

        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <PeopleSuggestions />
            <div className="mt-7 flex items-center justify-between">
              <h2 className="text-sm font-extrabold">Coming up</h2>
              <Link
                href="/events"
                className="text-[11px] font-bold text-primary hover:underline"
              >
                See all
              </Link>
            </div>
            <div className="mt-3 divide-y divide-border border-y border-border">
              {upcoming.length ? (
                upcoming.map((event) => (
                  <Link
                    key={event.id}
                    href={`/event/${event.slug}`}
                    className="group flex gap-3 py-3"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                      <CalendarDays size={17} />
                    </span>
                    <span className="min-w-0">
                      <strong className="line-clamp-2 text-xs leading-5 group-hover:text-primary">
                        {event.title}
                      </strong>
                      <span className="mt-1 block text-[10px] text-muted-foreground">
                        {formatEventDate(event.startsAt)}
                      </span>
                    </span>
                  </Link>
                ))
              ) : (
                <p className="py-5 text-xs text-muted-foreground">
                  No upcoming events yet.
                </p>
              )}
            </div>
            <Link
              href="/dashboard/events/new"
              className="mt-5 flex items-center gap-3 rounded-md bg-primary p-4 text-white"
            >
              <Ticket size={19} />
              <span>
                <strong className="block text-xs">Host something</strong>
                <span className="text-[10px] text-white/70">
                  Create an event
                </span>
              </span>
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

function feedQuery(mode: FeedMode) {
  if (mode === "following") {
    return { feed: "following" as const };
  }
  if (mode === "events") {
    return { eventOnly: true };
  }
  return {};
}

function CommunityNav({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href: string;
  icon: typeof UsersRound;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-bold ${
        active
          ? "bg-secondary text-primary"
          : "text-muted-foreground hover:bg-background hover:text-foreground"
      }`}
    >
      <Icon size={17} />
      {label}
    </Link>
  );
}
