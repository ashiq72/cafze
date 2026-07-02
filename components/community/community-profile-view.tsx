"use client";

import {
  CalendarDays,
  LoaderCircle,
  MapPin,
  Settings,
  UserCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { communityService } from "@/services/community.service";
import type {
  CommunityPost,
  CommunityProfile,
} from "@/types/community";
import { getErrorMessage } from "@/lib/utils";
import { CommunityPostCard } from "./community-post-card";
import { Button } from "../ui/button";
import { EmptyState } from "../empty-state";

export function CommunityProfileView({ userId }: { userId: string }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [busyPostId, setBusyPostId] = useState("");

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      communityService.profile(userId),
      communityService.userPosts(userId, { limit: 30 }),
    ])
      .then(([profileResult, postResult]) => {
        setProfile(profileResult);
        setFollowing(Boolean(profileResult.isFollowing));
        setPosts(postResult.posts);
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [userId]);

  function replace(updated: CommunityPost) {
    setPosts((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  async function toggleFollow() {
    if (!profile || followBusy) return;
    setFollowBusy(true);
    try {
      const result = await communityService.toggleFollow(profile.id);
      const next = Boolean(result.isFollowing ?? result.following);
      setFollowing(next);
      setProfile((current) =>
        current
          ? {
              ...current,
              followStats: {
                followers: Math.max(
                  0,
                  (current.followStats?.followers || 0) + (next ? 1 : -1),
                ),
                following: current.followStats?.following || 0,
              },
            }
          : current,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setFollowBusy(false);
    }
  }

  async function like(post: CommunityPost) {
    if (busyPostId) return;
    setBusyPostId(post.id);
    try {
      replace(await communityService.toggleLike(post.id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyPostId("");
    }
  }

  async function comment(post: CommunityPost, text: string) {
    try {
      replace(await communityService.addComment(post.id, text));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function remove(post: CommunityPost) {
    if (!window.confirm("Delete this community post?")) return;
    try {
      await communityService.remove(post.id);
      setPosts((items) => items.filter((item) => item.id !== post.id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <LoaderCircle className="animate-spin text-primary" size={22} />
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        icon={UserPlus}
        title="Profile unavailable"
        description="This community member could not be found."
      />
    );
  }

  const ownProfile = user?.id === profile.id;
  const image = profile.image || profile.profileImage;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5f8f6] pb-12">
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-4xl px-4 pt-5 sm:px-6">
          <div className="relative h-44 overflow-hidden rounded-lg bg-[#173f35] sm:h-56">
            {profile.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.coverImage}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:px-5">
            <div className="-mt-10 shrink-0">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt=""
                  className="h-24 w-24 rounded-lg border-4 border-background object-cover"
                />
              ) : (
                <span className="grid h-24 w-24 place-items-center rounded-lg border-4 border-background bg-primary text-2xl font-extrabold text-white">
                  {profile.name?.charAt(0).toUpperCase() || "C"}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold">{profile.name}</h1>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays size={13} />
                  Community member
                </span>
              </div>
            </div>
            {!ownProfile && (
              <Button
                variant={following ? "outline" : "default"}
                disabled={followBusy}
                onClick={toggleFollow}
              >
                {followBusy ? (
                  <LoaderCircle className="animate-spin" size={16} />
                ) : following ? (
                  <UserCheck size={16} />
                ) : (
                  <UserPlus size={16} />
                )}
                {following ? "Following" : "Follow"}
              </Button>
            )}
            {ownProfile && (
              <Button asChild variant="outline">
                <Link href="/community/settings">
                  <Settings size={16} />
                  Edit profile
                </Link>
              </Button>
            )}
          </div>
          <div className="flex gap-6 border-t border-border py-4 text-xs">
            <span>
              <strong className="text-sm">
                {profile.followStats?.followers || 0}
              </strong>{" "}
              followers
            </span>
            <span>
              <strong className="text-sm">
                {profile.followStats?.following || 0}
              </strong>{" "}
              following
            </span>
            <span>
              <strong className="text-sm">{posts.length}</strong> posts
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-4xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside>
          <div className="border-y border-border py-4">
            <h2 className="text-sm font-extrabold">About</h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              {profile.bio || profile.about || "No community bio added yet."}
            </p>
          </div>
        </aside>
        <section className="grid gap-4">
          {posts.length ? (
            posts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                busy={busyPostId === post.id}
                onLike={like}
                onComment={comment}
                onDelete={remove}
              />
            ))
          ) : (
            <EmptyState
              icon={UserPlus}
              title="No posts yet"
              description="Community updates from this member will appear here."
            />
          )}
        </section>
      </div>
    </main>
  );
}
