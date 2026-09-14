"use client";

import { useState } from "react";
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
  Menu,
  X,
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
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar (below md) */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30"
        style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}
      >
        <p className="font-display text-lg">Bloom Daily</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 rounded-md"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer + backdrop */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(32, 30, 26, 0.4)" }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="relative w-64 max-w-[80%] h-full flex flex-col justify-between overflow-y-auto"
            style={{ background: "var(--color-paper)" }}
          >
            <div>
              <div className="flex items-center justify-between px-5 pt-6 pb-4">
                <p className="font-display text-xl">Bloom Daily</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-md"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="px-3 space-y-0.5">
                {NAV.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
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
        </div>
      )}

      {/* Desktop sidebar (md and up) */}
      <aside
        className="hidden md:flex w-56 shrink-0 border-r flex-col justify-between h-screen sticky top-0"
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
    </>
  );
}