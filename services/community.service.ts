import type {
  CommunityComment,
  CommunityEventReference,
  CommunityFeedPage,
  CommunityMember,
  CommunityNotification,
  CommunityPost,
  CommunityProfile,
  CommunitySearchResult,
} from "@/types/community";
import { api, normalizeId, unwrapCollection, unwrapEntity } from "./api";

const ROOT = "/api/v1/social";

function member(value: CommunityMember | string): CommunityMember | string {
  if (typeof value === "string") return value;
  return {
    ...normalizeId(value),
    name: value.name || "Community member",
    image: value.image || value.profileImage,
  };
}

function comment(value: CommunityComment): CommunityComment {
  return {
    ...normalizeId(value),
    user: member(value.user),
    text: value.text || "",
    likes: Array.isArray(value.likes) ? value.likes.map(String) : [],
  };
}

function post(value: CommunityPost): CommunityPost {
  return {
    ...normalizeId(value),
    user: member(value.user),
    text: value.text || "",
    likes: Array.isArray(value.likes) ? value.likes.map(String) : [],
    comments: Array.isArray(value.comments)
      ? value.comments.map(comment)
      : [],
  };
}

export const communityService = {
  async feed(input?: {
    limit?: number;
    cursor?: string;
    feed?: "all" | "following";
    eventOnly?: boolean;
  }) {
    const { data } = await api.get(`${ROOT}/posts`, { params: input });
    const envelope = data as {
      meta?: { hasMore?: boolean; nextCursor?: string | null };
      data?: unknown;
    };
    const posts = unwrapCollection<CommunityPost>(data, [
      "posts",
      "result",
      "items",
    ]).map(post);

    return {
      posts,
      hasMore: Boolean(envelope.meta?.hasMore),
      nextCursor: envelope.meta?.nextCursor || null,
    } satisfies CommunityFeedPage;
  },

  async getPost(postId: string) {
    const { data } = await api.get(
      `${ROOT}/posts/${encodeURIComponent(postId)}`,
    );
    return post(
      unwrapEntity<CommunityPost>(data, ["post", "result", "item"]),
    );
  },

  async userPosts(userId: string, input?: { limit?: number; cursor?: string }) {
    const { data } = await api.get(
      `${ROOT}/posts/user/${encodeURIComponent(userId)}`,
      { params: input },
    );
    const envelope = data as {
      meta?: { hasMore?: boolean; nextCursor?: string | null };
    };
    return {
      posts: unwrapCollection<CommunityPost>(data, [
        "posts",
        "result",
        "items",
      ]).map(post),
      hasMore: Boolean(envelope.meta?.hasMore),
      nextCursor: envelope.meta?.nextCursor || null,
    } satisfies CommunityFeedPage;
  },

  async create(input: {
    text: string;
    file?: File | null;
    event?: CommunityEventReference | null;
  }) {
    const body = new FormData();
    body.append("text", input.text.trim());
    if (input.file) body.append("file", input.file);
    if (input.event) {
      body.append(
        "event",
        JSON.stringify({
          eventId: input.event.id,
          title: input.event.title,
          slug: input.event.slug,
          startsAt: input.event.startsAt,
          location: input.event.location,
          bannerUrl: input.event.bannerUrl,
        }),
      );
    }
    const { data } = await api.post(`${ROOT}/posts/create-post`, body);
    return post(
      unwrapEntity<CommunityPost>(data, ["post", "result", "item"]),
    );
  },

  async toggleLike(postId: string) {
    const { data } = await api.patch(
      `${ROOT}/posts/${encodeURIComponent(postId)}/toggle-like`,
    );
    return post(
      unwrapEntity<CommunityPost>(data, ["post", "result", "item"]),
    );
  },

  async addComment(postId: string, text: string) {
    const { data } = await api.post(
      `${ROOT}/posts/${encodeURIComponent(postId)}/comments`,
      { text: text.trim() },
    );
    return post(
      unwrapEntity<CommunityPost>(data, ["post", "result", "item"]),
    );
  },

  async remove(postId: string) {
    await api.delete(`${ROOT}/posts/${encodeURIComponent(postId)}`);
  },

  async profile(userId: string) {
    const { data } = await api.get(
      `${ROOT}/profiles/${encodeURIComponent(userId)}`,
    );
    const result = unwrapEntity<{
      user: CommunityProfile;
      followStats?: {
        followers?: number;
        following?: number;
        isFollowing?: boolean;
      };
    }>(data, ["profile", "result", "item"]);
    const profile = normalizeId(
      result.user || (result as unknown as CommunityProfile),
    );
    return {
      ...profile,
      image: profile.image || profile.profileImage,
      followStats: {
        followers: Number(result.followStats?.followers) || 0,
        following: Number(result.followStats?.following) || 0,
      },
      isFollowing: Boolean(result.followStats?.isFollowing),
    };
  },

  async followStats(userId: string) {
    const { data } = await api.get(
      `${ROOT}/follows/stats/${encodeURIComponent(userId)}`,
    );
    return unwrapEntity<{
      followers?: number;
      following?: number;
      isFollowing?: boolean;
    }>(data, ["stats", "result"]);
  },

  async toggleFollow(userId: string) {
    const { data } = await api.patch(
      `${ROOT}/follows/${encodeURIComponent(userId)}/toggle`,
    );
    return unwrapEntity<{ following?: boolean; isFollowing?: boolean }>(
      data,
      ["result"],
    );
  },

  async suggestions(limit = 5) {
    const { data } = await api.get(`${ROOT}/follows/suggestions/me`, {
      params: { limit },
    });
    return unwrapCollection<CommunityMember>(data, [
      "users",
      "result",
      "items",
    ]).map((item) => {
      const normalized = normalizeId(item);
      return {
        ...normalized,
        name: normalized.name || "Community member",
        image: normalized.image || normalized.profileImage,
      };
    });
  },

  async search(query: string): Promise<CommunitySearchResult> {
    const { data } = await api.get(`${ROOT}/search`, {
      params: { q: query.trim(), limitUsers: 6, limitPosts: 6 },
    });
    const result = unwrapEntity<{
      users?: CommunityMember[];
      posts?: CommunityPost[];
    }>(data, ["result"]);
    return {
      users: (result.users || []).map((item) => {
        const normalized = normalizeId(item);
        return {
          ...normalized,
          name: normalized.name || "Community member",
          image: normalized.image || normalized.profileImage,
        };
      }),
      posts: (result.posts || []).map(post),
    };
  },

  async notifications(input?: {
    limit?: number;
    cursor?: string;
    filter?: "all" | "unread";
  }) {
    const { data } = await api.get(`${ROOT}/notifications`, {
      params: input,
    });
    const envelope = data as {
      meta?: {
        hasMore?: boolean;
        nextCursor?: string | null;
        unreadCount?: number;
      };
    };
    const items = unwrapCollection<CommunityNotification>(data, [
      "notifications",
      "result",
      "items",
    ]).map((item) => {
      const normalized = normalizeId(item);
      const actor = normalizeId(item.actor);
      const attachedPost = item.post
        ? normalizeId(item.post as CommunityPost)
        : undefined;
      return {
        ...normalized,
        actor: {
          ...actor,
          name: actor.name || "Community member",
          image: actor.image || actor.profileImage,
        },
        post: attachedPost,
      };
    });
    return {
      items,
      hasMore: Boolean(envelope.meta?.hasMore),
      nextCursor: envelope.meta?.nextCursor || null,
      unreadCount: Number(envelope.meta?.unreadCount) || 0,
    };
  },

  async unreadCount() {
    const { data } = await api.get(`${ROOT}/notifications/unread-count`);
    const result = unwrapEntity<{ unreadCount?: number }>(data, ["result"]);
    return Number(result.unreadCount) || 0;
  },

  async markNotificationRead(notificationId: string) {
    await api.patch(
      `${ROOT}/notifications/${encodeURIComponent(notificationId)}/read`,
    );
  },

  async markAllNotificationsRead() {
    await api.patch(`${ROOT}/notifications/mark-all-read`);
  },
};
