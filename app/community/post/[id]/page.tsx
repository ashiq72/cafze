"use client";

import { ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CommunityPostCard } from "@/components/community/community-post-card";
import { communityService } from "@/services/community.service";
import type { CommunityPost } from "@/types/community";
import { getErrorMessage } from "@/lib/utils";

export default function CommunityPostPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    communityService
      .getPost(params.id)
      .then(setPost)
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <LoaderCircle className="animate-spin text-primary" size={22} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-extrabold">Post unavailable</h1>
        <Link
          href="/community"
          className="mt-4 inline-block text-sm font-bold text-primary"
        >
          Return to community
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5f8f6] px-4 py-7">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/community"
          className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Community
        </Link>
        <CommunityPostCard
          post={post}
          busy={busy}
          onLike={async (value) => {
            if (busy) return;
            setBusy(true);
            try {
              setPost(await communityService.toggleLike(value.id));
            } catch (error) {
              toast.error(getErrorMessage(error));
            } finally {
              setBusy(false);
            }
          }}
          onComment={async (value, text) => {
            try {
              setPost(await communityService.addComment(value.id, text));
            } catch (error) {
              toast.error(getErrorMessage(error));
            }
          }}
          onDelete={async (value) => {
            if (!window.confirm("Delete this community post?")) return;
            try {
              await communityService.remove(value.id);
              window.location.assign("/community");
            } catch (error) {
              toast.error(getErrorMessage(error));
            }
          }}
        />
      </div>
    </main>
  );
}

