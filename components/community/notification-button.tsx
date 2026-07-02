"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { communityService } from "@/services/community.service";

export function NotificationButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () => {
      communityService
        .unreadCount()
        .then((value) => {
          if (active) setCount(value);
        })
        .catch(() => undefined);
    };
    load();
    const timer = window.setInterval(load, 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <Link
      href="/community/notifications"
      className="relative grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label={
        count ? `${count} unread notifications` : "Community notifications"
      }
    >
      <Bell size={16} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-destructive px-1 text-center text-[9px] font-extrabold leading-4 text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

