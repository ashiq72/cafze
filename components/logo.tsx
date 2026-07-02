import { Ticket } from "lucide-react";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 font-extrabold">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
        <Ticket size={19} />
      </span>
      {!compact && (
        <span className="text-[17px] tracking-normal text-foreground">
          Cafze
        </span>
      )}
    </Link>
  );
}

