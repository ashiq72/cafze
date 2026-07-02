import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { SiteHeader } from "@/components/site-header";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <AuthGuard>{children}</AuthGuard>
    </>
  );
}

