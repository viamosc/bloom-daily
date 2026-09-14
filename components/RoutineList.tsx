"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toggleRoutine } from "@/actions/routines";
import { DisabledDelete } from "./DisabledDelete";
import type { RoutineWithStatus } from "@/lib/data-routines";

export function RoutineList({ routines }: { routines: RoutineWithStatus[] }) {
  const [items, setItems] = useState(routines);
  const [, startTransition] = useTransition();

  function toggle(id: string, current: boolean) {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !current } : r))
    );
    startTransition(async () => {
      await toggleRoutine(id, !current);
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-sm py-6" style={{ color: "var(--color-ink-muted)" }}>
        No routines yet. Add the first one you want to repeat every day.
      </p>
    );
  }

  return (
    <ul>
      {items.map((r) => (
        <li
          key={r.id}
          className="flex items-center gap-3 py-3 border-b"
          style={{ borderColor: "var(--color-line)" }}
        >
          <button
            type="button"
            onClick={() => toggle(r.id, r.completed)}
            aria-pressed={r.completed}
            className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors"
            style={{
              borderColor: r.completed ? "var(--color-accent)" : "var(--color-line)",
              background: r.completed ? "var(--color-accent)" : "transparent",
            }}
          >
            {r.completed && <Check size={12} color="var(--color-accent-ink)" strokeWidth={3} />}
          </button>
          <span
            className="text-sm flex-1"
            style={{
              color: r.completed ? "var(--color-ink-muted)" : "var(--color-ink)",
              textDecoration: r.completed ? "line-through" : "none",
            }}
          >
            {r.title}
          </span>
          <DisabledDelete />
        </li>
      ))}
    </ul>
  );
}
