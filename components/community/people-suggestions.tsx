"use client";

import { LoaderCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { communityService } from "@/services/community.service";
import type { CommunityMember } from "@/types/community";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "../ui/button";

export function PeopleSuggestions() {
  const [people, setPeople] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    communityService
      .suggestions(5)
      .then(setPeople)
      .catch(() => setPeople([]))
      .finally(() => setLoading(false));
  }, []);

  async function follow(member: CommunityMember) {
    if (busyId) return;
    setBusyId(member.id);
    try {
      await communityService.toggleFollow(member.id);
      setPeople((items) => items.filter((item) => item.id !== member.id));
      toast.success(`Following ${member.name}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyId("");
    }
  }

  return (
    <section>
      <h2 className="text-sm font-extrabold">People to meet</h2>
      <div className="mt-3 divide-y divide-border border-y border-border">
        {loading ? (
          <div className="flex items-center gap-2 py-5 text-xs text-muted-foreground">
            <LoaderCircle className="animate-spin" size={14} />
            Finding people
          </div>
        ) : people.length ? (
          people.map((member) => (
            <div key={member.id} className="flex items-center gap-2 py-3">
              <Link
                href={`/community/profile/${member.id}`}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                {member.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.image}
                    alt=""
                    className="h-9 w-9 rounded-md object-cover"
                  />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-xs font-extrabold text-primary">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0">
                  <strong className="block truncate text-xs">
                    {member.name}
                  </strong>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {member.bio || "Community member"}
                  </span>
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={busyId === member.id}
                onClick={() => follow(member)}
                aria-label={`Follow ${member.name}`}
              >
                {busyId === member.id ? (
                  <LoaderCircle className="animate-spin" size={15} />
                ) : (
                  <UserPlus size={15} />
                )}
              </Button>
            </div>
          ))
        ) : (
          <p className="py-4 text-xs text-muted-foreground">
            You are connected with everyone suggested right now.
          </p>
        )}
      </div>
    </section>
  );
}

