"use client";

import {
  CalendarDays,
  Heart,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Send,
  Share2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import type {
  CommunityComment,
  CommunityMember,
  CommunityPost,
} from "@/types/community";
import { formatEventDate } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function CommunityPostCard({
  post,
  busy,
  onLike,
  onComment,
  onDelete,
}: {
  post: CommunityPost;
  busy?: boolean;
  onLike: (post: CommunityPost) => void;
  onComment: (post: CommunityPost, text: string) => Promise<void>;
  onDelete: (post: CommunityPost) => void;
}) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [commenting, setCommenting] = useState(false);
  const author =
    typeof post.user === "string"
      ? ({ id: post.user, name: "Community member" } as CommunityMember)
      : post.user;
  const ownPost = Boolean(user?.id && author.id === user.id);
  const liked = Boolean(user?.id && post.likes.includes(user.id));

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = comment.trim();
    if (!value || commenting) return;
    setCommenting(true);
    try {
      await onComment(post, value);
      setComment("");
      setShowComments(true);
    } finally {
      setCommenting(false);
    }
  }

  async function share() {
    const url = post.event
      ? `${window.location.origin}/event/${post.event.slug}`
      : `${window.location.origin}/community/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.event?.title || "Cafze", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      // Cancelling a native share is not an error.
    }
  }

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      <header className="flex items-start gap-3 p-4">
        <Avatar member={author} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/community/profile/${author.id}`}
            className="truncate text-sm font-extrabold hover:text-primary"
          >
            {author.name}
          </Link>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {post.createdAt
              ? formatRelative(post.createdAt)
              : "Shared with the community"}
          </p>
        </div>
        {ownPost && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label="Delete post"
            onClick={() => onDelete(post)}
          >
            <Trash2 size={15} />
          </Button>
        )}
      </header>

      <p className="whitespace-pre-wrap px-4 pb-4 text-sm leading-6">
        {post.text}
      </p>

      {post.image && (
        <div className="border-y border-border bg-[#101815]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt="Community post"
            className="max-h-[560px] w-full object-contain"
          />
        </div>
      )}

      {post.event && (
        <Link
          href={`/event/${post.event.slug}`}
          className="group mx-4 mb-4 block overflow-hidden rounded-md border border-border bg-[#f5f8f6] transition hover:border-primary/40"
        >
          {post.event.bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.event.bannerUrl}
              alt=""
              className="aspect-[16/6] w-full object-cover"
            />
          )}
          <div className="p-3">
            <p className="text-[10px] font-extrabold uppercase text-primary">
              Featured event
            </p>
            <h3 className="mt-1 text-sm font-extrabold group-hover:text-primary">
              {post.event.title}
            </h3>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays size={13} />
                {formatEventDate(post.event.startsAt)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {post.event.location}
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="mx-4 flex items-center justify-between border-y border-border py-2 text-[11px] text-muted-foreground">
        <span>{post.likes.length} likes</span>
        <button
          type="button"
          className="hover:text-foreground"
          onClick={() => setShowComments((value) => !value)}
        >
          {post.comments.length} comments
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1 px-3 py-2">
        <Action
          icon={busy ? LoaderCircle : Heart}
          label={liked ? "Liked" : "Like"}
          active={liked}
          disabled={busy}
          spin={busy}
          onClick={() => onLike(post)}
        />
        <Action
          icon={MessageCircle}
          label="Comment"
          onClick={() => setShowComments((value) => !value)}
        />
        <Action icon={Share2} label="Share" onClick={share} />
      </div>

      {showComments && (
        <div className="border-t border-border bg-muted/35 px-4 py-3">
          {post.comments.length > 0 && (
            <div className="mb-3 grid gap-3">
              {post.comments.slice(-5).map((item) => (
                <CommentRow key={item.id} comment={item} />
              ))}
            </div>
          )}
          <form className="flex gap-2" onSubmit={submitComment}>
            <Input
              className="h-9 bg-background"
              maxLength={1000}
              placeholder="Write a comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9"
              disabled={!comment.trim() || commenting}
              aria-label="Post comment"
            >
              {commenting ? (
                <LoaderCircle className="animate-spin" size={15} />
              ) : (
                <Send size={15} />
              )}
            </Button>
          </form>
        </div>
      )}
    </article>
  );
}

function Avatar({ member }: { member: CommunityMember }) {
  const image = member.image || member.profileImage;
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt=""
      className="h-10 w-10 shrink-0 rounded-md object-cover"
    />
  ) : (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-xs font-extrabold text-primary">
      {member.name.trim().charAt(0).toUpperCase() || "C"}
    </span>
  );
}

function CommentRow({ comment }: { comment: CommunityComment }) {
  const commenter =
    typeof comment.user === "string"
      ? "Community member"
      : comment.user.name;
  return (
    <div className="text-xs">
      <strong>{commenter}</strong>
      <p className="mt-0.5 leading-5 text-muted-foreground">{comment.text}</p>
    </div>
  );
}

function Action({
  icon: Icon,
  label,
  active,
  disabled,
  spin,
  onClick,
}: {
  icon: typeof Heart;
  label: string;
  active?: boolean;
  disabled?: boolean;
  spin?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex h-9 items-center justify-center gap-2 rounded-md text-xs font-bold transition hover:bg-muted ${
        active ? "text-[#d74f4f]" : "text-muted-foreground"
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon
        size={16}
        className={`${active ? "fill-current" : ""} ${spin ? "animate-spin" : ""}`}
      />
      {label}
    </button>
  );
}

function formatRelative(value: string) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "Recently";
  const minutes = Math.max(0, Math.floor((Date.now() - time) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : formatEventDate(value);
}
