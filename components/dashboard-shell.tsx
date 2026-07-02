"use client";

import {
  CalendarRange,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ScanLine,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "./logo";
import { Button } from "./ui/button";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/events/new", label: "Create event", icon: Plus },
  { href: "/dashboard/check-in", label: "Check-in", icon: ScanLine },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Logo />
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        >
          <X size={19} />
        </Button>
      </div>
      <div className="flex-1 px-3 py-5">
        <p className="px-2 pb-2 text-[10px] font-extrabold uppercase text-muted-foreground">
          Organizer
        </p>
        <nav className="grid gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  active && "bg-secondary text-primary",
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-border p-3">
        <div className="mb-2 px-2 py-1">
          <p className="truncate text-xs font-bold">
            {user?.name || "Organizer"}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {user?.email}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-destructive"
        >
          <LogOut size={16} />
          Sign out
        </button>
        <Link
          href="/community"
          className="mt-1 flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <UsersRound size={16} />
          Community
        </Link>
        <Link
          href="/events"
          className="mt-1 flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft size={16} />
          Public events
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f7f9f8]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-background lg:flex">
        {sidebar}
      </aside>
      {open && (
        <>
          <button
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(280px,86vw)] flex-col bg-background shadow-2xl lg:hidden">
            {sidebar}
          </aside>
        </>
      )}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </Button>
            <div>
              <p className="text-sm font-extrabold">Event workspace</p>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Create, sell and welcome guests
              </p>
            </div>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/events/new">
              <CalendarRange size={15} />
              <span className="hidden sm:inline">Create event</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </Button>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
