"use client";

import {
  Bell,
  ChevronDown,
  Compass,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ScanLine,
  Settings,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { NotificationButton } from "./community/notification-button";

export function SiteHeader() {
  const { user, signedIn, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const navClass = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-bold transition hover:bg-muted",
      active ? "bg-secondary text-primary" : "text-muted-foreground",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-7">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/community"
              className={navClass(pathname.startsWith("/community"))}
            >
              <UsersRound size={15} />
              Community
            </Link>
            <Link
              href="/events"
              className={navClass(
                pathname === "/events" || pathname.startsWith("/event/"),
              )}
            >
              <Compass size={15} />
              Events
            </Link>
            {signedIn && (
              <Link
                href="/dashboard"
                className={navClass(pathname.startsWith("/dashboard"))}
              >
                <LayoutDashboard size={15} />
                Organizer
              </Link>
            )}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {signedIn ? (
            <>
              <NotificationButton />
              <Button asChild size="sm">
                <Link href="/dashboard/check-in">
                  <ScanLine size={15} />
                  Scan
                </Link>
              </Button>
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-xs font-bold hover:bg-muted"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountOpen((value) => !value)}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-secondary text-[10px] font-extrabold text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "C"}
                  </span>
                  <span className="max-w-24 truncate">
                    {user?.name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown size={13} className="text-muted-foreground" />
                </button>
                {accountOpen && (
                  <div
                    className="absolute right-0 top-11 w-56 overflow-hidden rounded-lg border border-border bg-background p-1.5 shadow-soft"
                    role="menu"
                  >
                    <div className="border-b border-border px-2.5 py-2">
                      <strong className="block truncate text-xs">
                        {user?.name || "Community member"}
                      </strong>
                      <span className="block truncate text-[10px] text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                    <Link
                      href="/community/profile"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="mt-1 flex h-9 items-center gap-2 rounded-md px-2.5 text-xs font-semibold hover:bg-muted"
                    >
                      <UserRound size={15} />
                      Community profile
                    </Link>
                    <Link
                      href="/community/settings"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex h-9 items-center gap-2 rounded-md px-2.5 text-xs font-semibold hover:bg-muted"
                    >
                      <Settings size={15} />
                      Profile settings
                    </Link>
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex h-9 items-center gap-2 rounded-md px-2.5 text-xs font-semibold hover:bg-muted"
                    >
                      <LayoutDashboard size={15} />
                      Organizer workspace
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-xs font-semibold text-destructive hover:bg-red-50"
                      onClick={() => {
                        setAccountOpen(false);
                        logout();
                      }}
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">
                <LogIn size={15} />
                Sign in
              </Link>
            </Button>
          )}
        </div>

        <Button
          className="md:hidden"
          variant="ghost"
          size="icon"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {open && (
        <nav className="grid gap-1 border-t border-border p-3 md:hidden">
          <MobileLink href="/community" onClick={() => setOpen(false)}>
            <UsersRound size={16} />
            Community
          </MobileLink>
          <MobileLink href="/events" onClick={() => setOpen(false)}>
            <Compass size={16} />
            Discover events
          </MobileLink>
          {signedIn ? (
            <>
              <MobileLink href="/dashboard" onClick={() => setOpen(false)}>
                <LayoutDashboard size={16} />
                Organizer dashboard
              </MobileLink>
              <MobileLink
                href="/community/profile"
                onClick={() => setOpen(false)}
              >
                <UserRound size={16} />
                My profile
              </MobileLink>
              <MobileLink
                href="/community/settings"
                onClick={() => setOpen(false)}
              >
                <Settings size={16} />
                Settings
              </MobileLink>
              <MobileLink
                href="/community/notifications"
                onClick={() => setOpen(false)}
              >
                <Bell size={16} />
                Notifications
              </MobileLink>
              <MobileLink
                href="/dashboard/check-in"
                onClick={() => setOpen(false)}
                primary
              >
                <ScanLine size={16} />
                Scan ticket
              </MobileLink>
              <button
                type="button"
                className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-destructive hover:bg-red-50"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </>
          ) : (
            <MobileLink href="/login" onClick={() => setOpen(false)} primary>
              <LogIn size={16} />
              Sign in
            </MobileLink>
          )}
        </nav>
      )}
    </header>
  );
}

function MobileLink({
  href,
  onClick,
  children,
  primary = false,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      className={cn(
        "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold hover:bg-muted",
        primary && "bg-primary text-primary-foreground hover:bg-primary/90",
      )}
      href={href}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
