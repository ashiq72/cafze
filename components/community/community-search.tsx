"use client";

import { LoaderCircle, Search, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { communityService } from "@/services/community.service";
import type { CommunitySearchResult } from "@/types/community";
import { getErrorMessage } from "@/lib/utils";

const emptyResult: CommunitySearchResult = { users: [], posts: [] };

export function CommunitySearch() {
  const requestRef = useRef(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(emptyResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) {
      setResults(emptyResult);
      setLoading(false);
      setError("");
      return;
    }

    const requestId = ++requestRef.current;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      communityService
        .search(value)
        .then((data) => {
          if (requestRef.current === requestId) setResults(data);
        })
        .catch((reason) => {
          if (requestRef.current === requestId) {
            setError(getErrorMessage(reason));
          }
        })
        .finally(() => {
          if (requestRef.current === requestId) setLoading(false);
        });
    }, 280);

    return () => window.clearTimeout(timer);
  }, [query]);

  const open = query.trim().length >= 2;

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={16}
      />
      <input
        className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
        placeholder="Search people and conversations"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search community"
      />
      {loading ? (
        <LoaderCircle
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
          size={16}
        />
      ) : query ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
          onClick={() => setQuery("")}
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      ) : null}

      {open && (
        <div className="absolute inset-x-0 top-12 z-30 max-h-[65vh] overflow-y-auto rounded-lg border border-border bg-background p-2 shadow-soft">
          {error ? (
            <p className="p-3 text-xs text-destructive">{error}</p>
          ) : !loading &&
            !results.users.length &&
            !results.posts.length ? (
            <p className="p-4 text-center text-xs text-muted-foreground">
              No people or posts match &quot;{query.trim()}&quot;.
            </p>
          ) : (
            <>
              {results.users.length > 0 && (
                <section>
                  <p className="px-2 py-1 text-[10px] font-extrabold uppercase text-muted-foreground">
                    People
                  </p>
                  {results.users.map((member) => (
                    <Link
                      key={member.id}
                      href={`/community/profile/${member.id}`}
                      onClick={() => setQuery("")}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"
                    >
                      {member.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.image}
                          alt=""
                          className="h-8 w-8 rounded-md object-cover"
                        />
                      ) : (
                        <span className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-primary">
                          <UserRound size={15} />
                        </span>
                      )}
                      <span className="min-w-0">
                        <strong className="block truncate text-xs">
                          {member.name}
                        </strong>
                        {member.bio && (
                          <span className="block truncate text-[10px] text-muted-foreground">
                            {member.bio}
                          </span>
                        )}
                      </span>
                    </Link>
                  ))}
                </section>
              )}

              {results.posts.length > 0 && (
                <section className="mt-2 border-t border-border pt-2">
                  <p className="px-2 py-1 text-[10px] font-extrabold uppercase text-muted-foreground">
                    Conversations
                  </p>
                  {results.posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/community/post/${post.id}`}
                      onClick={() => setQuery("")}
                      className="block rounded-md px-2 py-2 hover:bg-muted"
                    >
                      <strong className="text-[11px]">
                        {typeof post.user === "string"
                          ? "Community member"
                          : post.user.name}
                      </strong>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {post.text}
                      </p>
                    </Link>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

