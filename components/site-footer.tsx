import { Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-xs leading-6 text-muted-foreground">
            Community-powered event discovery, ticketing and mobile check-in
            for organizers and attendees across Bangladesh.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} />
              Bangladesh
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={13} />
              support@cafze.com
            </span>
          </div>
        </div>
        <FooterLinks
          title="Explore"
          links={[
            ["Community", "/community"],
            ["All events", "/events"],
            ["Organizer dashboard", "/dashboard"],
          ]}
        />
        <FooterLinks
          title="Account"
          links={[
            ["Sign in", "/login"],
            ["Create account", "/register"],
            ["My profile", "/community/profile"],
          ]}
        />
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-[11px] text-muted-foreground">
        Cafze community event platform
      </div>
    </footer>
  );
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: Array<[string, string]>;
}) {
  return (
    <div>
      <h2 className="text-xs font-extrabold uppercase">{title}</h2>
      <nav className="mt-4 grid gap-3">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
