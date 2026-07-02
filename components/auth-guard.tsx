"use client";

import { LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, signedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !signedIn) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, signedIn]);

  if (loading || !signedIn) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="animate-spin" size={18} />
          Checking your account
        </div>
      </div>
    );
  }

  return children;
}

