import type { Event } from "./index";

export type CommunityMember = {
  id: string;
  _id?: string;
  name: string;
  image?: string;
  profileImage?: string;
  bio?: string;
  location?: string;
};

export type CommunityComment = {
  id: string;
  _id?: string;
  user: CommunityMember | string;
  text: string;
  likes?: string[];
  createdAt?: string;
};

export type CommunityEventReference = Pick<
  Event,
  "id" | "title" | "slug" | "startsAt" | "location" | "bannerUrl"
>;

export type CommunityPost = {
  id: string;
  _id?: string;
  text: string;
  user: CommunityMember | string;
  image?: string;
  event?: {
    eventId: string;
    title: string;
    slug: string;
    startsAt: string;
    location: string;
    bannerUrl?: string;
  };
  likes: string[];
  comments: CommunityComment[];
  createdAt?: string;
  updatedAt?: string;
};

export type CommunityFeedPage = {
  posts: CommunityPost[];
  hasMore: boolean;
  nextCursor: string | null;
};

export type CommunityProfile = CommunityMember & {
  coverImage?: string;
  about?: string;
  website?: string;
  followStats?: {
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
};

export type CommunitySearchResult = {
  users: CommunityMember[];
  posts: CommunityPost[];
};

export type CommunityNotification = {
  id: string;
  _id?: string;
  type: "like" | "comment" | "follow";
  actor: CommunityMember;
  post?: Pick<CommunityPost, "id" | "text" | "image">;
  commentText?: string;
  isRead: boolean;
  createdAt?: string;
};
