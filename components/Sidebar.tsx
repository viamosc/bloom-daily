"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  ListTodo,
  NotebookPen,
  Clock,
  Feather,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { logout } from "@/actions/auth";

const NAV = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/routines", label: "Routines", icon: CalendarCheck },
  { href: "/todos", label: "Tasks", icon: ListTodo },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/time", label: "Time", icon: Clock },
  { href: "/thoughts", label: "Thoughts", icon: Feather },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 shrink-0 border-r flex flex-col justify-between h-screen sticky top-0"
      style={{ borderColor: "var(--color-line)" }}
    >
      <div>
        <div className="px-5 pt-6 pb-4">
          <p className="font-display text-xl">Bloom Daily</p>
        </div>
        <nav className="px-3 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
                style={{
                  background: active ? "var(--color-accent-soft)" : "transparent",
                  color: active ? "var(--color-accent)" : "var(--color-ink-muted)",
                  fontWeight: active ? 500 : 400,
                }}
              >
                <Icon size={16} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <form action={logout} className="px-3 pb-5">
        <button
          type="submit"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full"
          style={{ color: "var(--color-ink-faint)" }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </form>
    </aside>
  );
}
