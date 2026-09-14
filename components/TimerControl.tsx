"use client";

import { useEffect, useState, useTransition } from "react";
import { Square, Play } from "lucide-react";
import { startTimeEntry, endTimeEntry } from "@/actions/time";
import type { TimeEntry } from "@/lib/data-time";

function elapsedLabel(startIso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(startIso).getTime()) / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function TimerControl({ running }: { running: TimeEntry | null }) {
  const [title, setTitle] = useState("");
  const [tick, setTick] = useState(0);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  if (running) {
    return (
      <div
        className="flex items-center justify-between rounded-md px-4 py-3.5 mb-8"
        style={{ background: "var(--color-accent-soft)" }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-accent)" }}>
            {running.title}
          </p>
          <p className="font-display text-2xl tabular-nums" style={{ color: "var(--color-accent)" }}>
            {elapsedLabel(running.start_time)}
            <span className="hidden">{tick}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => startTransition(() => endTimeEntry(running.id))}
          className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-ink)" }}
        >
          <Square size={13} fill="currentColor" />
          End
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex items-center gap-2 mb-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const fd = new FormData();
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
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-md px-3.5 py-2.5 text-sm font-medium shrink-0"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-ink)" }}
      >
        <Play size={13} fill="currentColor" />
        Start
      </button>
    </form>
  );
}
