// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, CalendarDays, Home, Settings, TrendingUp, User } from "lucide-react";

export interface NavLabels {
  home: string;
  calendar: string;
  myEvents: string;
  progress: string;
  profile: string;
  badges: string;
  settings: string;
  label: string;
  appName: string;
}

/** Bottom bar on mobile, fixed sidebar from md up. */
export function BottomNav({ labels }: { labels: NavLabels }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: labels.home, Icon: Home },
    { href: "/calendar", label: labels.calendar, Icon: CalendarDays },
    { href: "/progress", label: labels.progress, Icon: TrendingUp },
    { href: "/badges", label: labels.badges, Icon: Award },
    { href: "/profile", label: labels.profile, Icon: User },
    { href: "/settings", label: labels.settings, Icon: Settings },
  ];
  return (
    <nav
      aria-label={labels.label}
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:inset-y-0 md:right-auto md:w-60 md:border-r md:border-t-0 md:pb-0"
    >
      <p className="hidden px-6 pb-2 pt-8 text-lg font-bold md:block">{labels.appName}</p>
      <ul className="flex md:flex-col md:gap-1 md:px-3">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="min-w-0 flex-1 md:flex-none">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-center text-[11px] font-medium leading-tight sm:text-xs md:min-h-12 md:flex-row md:justify-start md:gap-3 md:rounded-2xl md:px-4 md:text-base ${
                  active ? "text-primary md:bg-accent" : "text-muted"
                }`}
              >
                <Icon aria-hidden className="h-6 w-6 shrink-0" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
// __________________________GenAI: Generated code ends here______________________________
