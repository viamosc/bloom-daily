"use client";

import { useEffect, useState, useTransition } from "react";
import { Square, Play, Plus } from "lucide-react";
import { startTimeEntry, endTimeEntry, addManualEntry } from "@/actions/time";
import type { TimeEntry, Category } from "@/lib/data-time";
import { todayStr } from "@/lib/date";

function elapsedLabel(startIso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(startIso).getTime()) / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function CategorySelect({ categories, name }: { categories: Category[]; name: string }) {
  return (
    <select
      name={name}
      className="rounded-md px-2.5 py-2.5 text-sm border"
      style={{ borderColor: "var(--color-line)" }}
      defaultValue=""
    >
      <option value="">No category</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

export function TimerControl({
  running,
  categories,
}: {
  running: TimeEntry[];
  categories: Category[];
}) {
  const [title, setTitle] = useState("");
  const [tick, setTick] = useState(0);
  const [showManual, setShowManual] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (running.length === 0) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running.length]);

  const catById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="mb-8 space-y-3">
      {running.map((entry) => {
        const cat = entry.category_id ? catById.get(entry.category_id) : null;
        const color = cat?.color ?? "var(--color-accent)";
        return (
          <div
            key={entry.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md px-4 py-3.5"
            style={{ background: color + "22" }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color }}>
                {cat ? `${entry.title} · ${cat.name}` : entry.title}
              </p>
              <p className="font-display text-2xl tabular-nums" style={{ color }}>
                {elapsedLabel(entry.start_time)}
                <span className="hidden">{tick}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => startTransition(() => endTimeEntry(entry.id))}
              className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium shrink-0"
              style={{ background: color, color: "var(--color-accent-ink)" }}
            >
              <Square size={13} fill="currentColor" />
              End
            </button>
          </div>
        );
      })}

      <form
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          const fd = new FormData(e.currentTarget);
          fd.set("title", title);
          startTransition(() => startTimeEntry(fd));
          setTitle("");
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What are you about to do?"
          required
          className="flex-1 rounded-md px-3 py-2.5 text-sm border"
          style={{ borderColor: "var(--color-line)" }}
        />
        <CategorySelect categories={categories} name="category_id" />
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2.5 text-sm font-medium shrink-0"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-ink)" }}
        >
          <Play size={13} fill="currentColor" />
          Start
        </button>
      </form>

      <button
        type="button"
        onClick={() => setShowManual((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <Plus size={12} />
        {showManual ? "Cancel" : "Add a past entry"}
      </button>

      {showManual && (
        <form
          className="grid grid-cols-2 sm:grid-cols-5 gap-2 rounded-md p-3 border"
          style={{ borderColor: "var(--color-line)" }}
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(() => addManualEntry(fd));
            (e.target as HTMLFormElement).reset();
            setShowManual(false);
          }}
        >
          <input
            type="text"
            name="title"
            placeholder="Title"
            required
            className="col-span-2 sm:col-span-1 rounded-md px-2.5 py-2 text-sm border"
            style={{ borderColor: "var(--color-line)" }}
          />
          <input
            type="date"
            name="entry_date"
            defaultValue={todayStr()}
            required
            className="rounded-md px-2.5 py-2 text-sm border"
            style={{ borderColor: "var(--color-line)" }}
          />
          <input
            type="time"
            name="start_time"
            required
            className="rounded-md px-2.5 py-2 text-sm border"
            style={{ borderColor: "var(--color-line)" }}
          />
          <input
            type="time"
            name="end_time"
            required
            className="rounded-md px-2.5 py-2 text-sm border"
            style={{ borderColor: "var(--color-line)" }}
          />
          <CategorySelect categories={categories} name="category_id" />
          <button
            type="submit"
            className="col-span-2 sm:col-span-5 rounded-md px-3.5 py-2 text-sm font-medium"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-ink)" }}
          >
            Add entry
          </button>
        </form>
      )}
    </div>
  );
}