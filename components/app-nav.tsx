"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, Timer, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/breakdown", label: "Break down", icon: ListChecks },
  { href: "/app/focus", label: "Focus", icon: Timer },
  { href: "/app/coach", label: "Coach", icon: MessageCircle },
];

export function AppNavTop() {
  const pathname = usePathname();
  return (
    <header className="hidden md:block sticky top-0 z-20 border-b border-cream-200/80 bg-cream-50/80 backdrop-blur">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rust-500" />
          <span className="font-display text-xl tracking-tight">Unstuck</span>
        </Link>
        <nav className="flex items-center gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/app" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                  active
                    ? "bg-ink text-cream-50"
                    : "text-ink-muted hover:bg-cream-100 hover:text-ink",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function AppNavBottom() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t border-cream-200/80 bg-cream-50/95 backdrop-blur">
      <ul className="flex items-stretch">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/app" && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-3 text-[11px] tracking-wide transition-colors",
                  active ? "text-rust-600" : "text-ink-light",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-rust-500")} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
