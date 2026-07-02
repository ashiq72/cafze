"use client";

import { useParams } from "next/navigation";
import { CommunityProfileView } from "@/components/community/community-profile-view";

export default function CommunityMemberProfilePage() {
  const params = useParams<{ id: string }>();
  return <CommunityProfileView userId={params.id} />;
}

