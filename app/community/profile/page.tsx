"use client";

import { LoaderCircle } from "lucide-react";
import { CommunityProfileView } from "@/components/community/community-profile-view";
import { useAuth } from "@/hooks/use-auth";

export default function MyCommunityProfilePage() {
  const { user, loading } = useAuth();
  if (loading || !user?.id) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <LoaderCircle className="animate-spin text-primary" size={22} />
      </div>
    );
  }
  return <CommunityProfileView userId={user.id} />;
}
