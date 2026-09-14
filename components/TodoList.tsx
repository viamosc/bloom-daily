"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toggleTodo } from "@/actions/todos";
import { DisabledDelete } from "./DisabledDelete";
import { formatMonthDay, formatWeekday, todayStr } from "@/lib/date";
import type { Todo } from "@/lib/data-todos";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [items, setItems] = useState(todos);
  const [, startTransition] = useTransition();
  const today = todayStr();

  function toggle(id: string, current: boolean) {
    setItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !current } : t))
    );
    startTransition(async () => {
      await toggleTodo(id, !current);
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-sm py-6" style={{ color: "var(--color-ink-muted)" }}>
        Nothing on your list. Add a task with a deadline below.
      </p>
    );
  }

  return (
    <ul>
      {items.map((t) => {
        const overdue = !!t.deadline && !t.completed && t.deadline < today;
        return (
          <li
            key={t.id}
            className="flex items-center gap-3 py-3 border-b"
            style={{ borderColor: "var(--color-line)" }}
          >
            <button
              type="button"
              onClick={() => toggle(t.id, t.completed)}
              aria-pressed={t.completed}
              className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
              style={{
                borderColor: t.completed ? "var(--color-accent)" : "var(--color-line)",
                background: t.completed ? "var(--color-accent)" : "transparent",
              }}
            >
              {t.completed && <Check size={12} color="var(--color-accent-ink)" strokeWidth={3} />}
            </button>

            <span
              className="text-sm flex-1"
              style={{
                color: t.completed ? "var(--color-ink-muted)" : "var(--color-ink)",
                textDecoration: t.completed ? "line-through" : "none",
              }}
            >
              {t.title}
            </span>

            {t.deadline && (
              <span
                className="text-xs shrink-0"
                style={{ color: overdue ? "var(--color-rust)" : "var(--color-ink-faint)" }}
              >
                {formatMonthDay(t.deadline)}, {formatWeekday(t.deadline).slice(0, 3)}
              </span>
            )}

            <DisabledDelete />
          </li>
        );
      })}
    </ul>
  );
}
