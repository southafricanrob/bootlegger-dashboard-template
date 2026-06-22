"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; match: string };

export function TopNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const links: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", match: "/dashboard" },
    ...(isAdmin
      ? [{ href: "/settings/users", label: "Settings", match: "/settings" }]
      : []),
  ];

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => {
        const active = pathname.startsWith(link.match);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
