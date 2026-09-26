"use client";

import { useEffect, useState, useTransition } from "react";
import type { TimeEntry, Category } from "@/lib/data-time";
import { updateTimeEntry, deleteTimeEntry, addManualEntry } from "@/actions/time";
import { formatTime } from "@/lib/date";

const HOUR_HEIGHT = 56; // px per hour
const MIN_SPAN_HOURS = 8;

function minutesOf(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function hourLabel(hour: number) {
  const h = hour % 24;
  const period = h < 12 ? "AM" : "PM";
  let display = h % 12;
  if (display === 0) display = 12;
  return `${display} ${period}`;
}

function hhmm(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

type LaidOutEntry = TimeEntry & {
  startMin: number;
  endMin: number;
  ongoing: boolean;
  col: number;
  totalCols: number;
};

function layout(entries: TimeEntry[], nowMin: number): LaidOutEntry[] {
  const withMinutes = entries.map((e) => {
    const startMin = minutesOf(e.start_time);
    const ongoing = !e.end_time;
    const rawEnd = ongoing ? Math.max(nowMin, startMin + 1) : minutesOf(e.end_time as string);
    return { ...e, startMin, endMin: Math.max(rawEnd, startMin + 1), ongoing };
  });

  const sorted = [...withMinutes].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  const columns: (typeof sorted)[number][][] = [];
  const colOf = new Map<string, number>();

  for (const e of sorted) {
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const last = columns[i][columns[i].length - 1];
      if (last.endMin <= e.startMin) {
        columns[i].push(e);
        colOf.set(e.id, i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([e]);
      colOf.set(e.id, columns.length - 1);
    }
  }

  const totalCols = Math.max(columns.length, 1);
  return sorted.map((e) => ({ ...e, col: colOf.get(e.id) ?? 0, totalCols }));
}

export function DayTimetable({
  entries,
  isToday,
  categories,
}: {
  entries: TimeEntry[];
  isToday: boolean;
  categories: Category[];
}) {
  const [, setTick] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [isToday]);

  const catById = new Map(categories.map((c) => [c.id, c]));

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const laidOut = layout(entries, nowMin);
  const editingEntry = laidOut.find((e) => e.id === editingId) ?? null;

  let rangeStartHour = 8;
  let rangeEndHour = 20;
  if (laidOut.length > 0) {
    const minStart = Math.min(...laidOut.map((e) => e.startMin));
    const maxEnd = Math.max(...laidOut.map((e) => e.endMin));
    rangeStartHour = Math.min(rangeStartHour, Math.floor(minStart / 60));
    rangeEndHour = Math.max(rangeEndHour, Math.ceil(maxEnd / 60));
  }
  if (rangeEndHour - rangeStartHour < MIN_SPAN_HOURS) {
    rangeEndHour = rangeStartHour + MIN_SPAN_HOURS;
  }
  rangeStartHour = Math.max(0, rangeStartHour);
  rangeEndHour = Math.min(24, rangeEndHour);

  const hours: number[] = [];
  for (let h = rangeStartHour; h <= rangeEndHour; h++) hours.push(h);

  const totalMinutes = (rangeEndHour - rangeStartHour) * 60;
  const gridHeight = (rangeEndHour - rangeStartHour) * HOUR_HEIGHT;

  function topFor(min: number) {
    return ((min - rangeStartHour * 60) / totalMinutes) * gridHeight;
  }

  const showNowLine = isToday && nowMin >= rangeStartHour * 60 && nowMin <= rangeEndHour * 60;

  return (
    <div className="flex relative">
      <div className="shrink-0 pr-3" style={{ width: 52 }}>
        {hours.map((h) => (
          <div key={h} style={{ height: HOUR_HEIGHT }} className="relative">
            <span
              className="absolute -top-2 right-0 text-xs"
              style={{ color: "var(--color-ink-faint)" }}
            >
              {hourLabel(h)}
            </span>
          </div>
        ))}
      </div>

      <div
        className="flex-1 relative border-l"
        style={{ borderColor: "var(--color-line)", height: gridHeight }}
      >
        {hours.map((h, i) => (
          <div
            key={h}
            className="absolute left-0 right-0 border-t"
            style={{ top: i * HOUR_HEIGHT, borderColor: "var(--color-line)" }}
          />
        ))}

        {showNowLine && (
          <div
            className="absolute left-0 right-0 flex items-center"
            style={{ top: topFor(nowMin), zIndex: 20 }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full -ml-[3px]"
              style={{ background: "var(--color-rust)" }}
            />
            <div className="flex-1 h-px" style={{ background: "var(--color-rust)" }} />
          </div>
        )}

        {laidOut.map((e) => {
          const top = topFor(e.startMin);
          const height = Math.max(topFor(e.endMin) - top, 20);
          const widthPct = 100 / e.totalCols;
          const leftPct = e.col * widthPct;
          const cat = e.category_id ? catById.get(e.category_id) : null;
          const color = cat?.color ?? "var(--color-accent)";
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setEditingId(e.id)}
              className="absolute rounded-md px-2 py-1 overflow-hidden text-left"
              style={{
                top,
                height,
                left: `calc(${leftPct}% + 2px)`,
                width: `calc(${widthPct}% - 4px)`,
                background: e.ongoing ? color + "22" : "var(--color-surface)",
                border: `1px solid ${e.ongoing ? color : "var(--color-line)"}`,
                borderLeft: `3px solid ${color}`,
                zIndex: 10,
              }}
            >
              <p
                className="text-xs font-medium leading-tight truncate"
                style={{ color: e.ongoing ? color : "var(--color-ink)" }}
              >
                {e.title}
              </p>
              {height > 32 && (
                <p className="text-xs leading-tight truncate" style={{ color: "var(--color-ink-muted)" }}>
                  {formatTime(e.start_time)} – {e.ongoing ? "now" : formatTime(e.end_time as string)}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {editingEntry && (
        <div
          className="absolute inset-0 flex items-center justify-center z-30"
          style={{ background: "rgba(0,0,0,0.25)" }}
          onClick={() => setEditingId(null)}
        >
          <form
            className="rounded-md p-4 w-full max-w-sm space-y-2"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-line)" }}
            onClick={(ev) => ev.stopPropagation()}
onSubmit={(ev) => {
  ev.preventDefault();
  const form = ev.currentTarget;
  const fd = new FormData(form);

  const date = fd.get("entry_date") as string;
  const start = fd.get("start_time") as string;
  const end = fd.get("end_time") as string;

  // Converts local time in the browser to UTC ISO strings
  if (date && start) {
    fd.set("start_time", new Date(`${date}T${start}`).toISOString());
  }
  if (date && end) {
    fd.set("end_time", new Date(`${date}T${end}`).toISOString());
  }

  // Call updateTimeEntry with the entry ID
  startTransition(() => updateTimeEntry(editingEntry.id, fd));
  setEditingId(null);
}}
          >
            <input
              type="text"
              name="title"
              defaultValue={editingEntry.title}
              required
              className="w-full rounded-md px-2.5 py-2 text-sm border"
              style={{ borderColor: "var(--color-line)" }}
            />
            <select
              name="category_id"
              defaultValue={editingEntry.category_id ?? ""}
              className="w-full rounded-md px-2.5 py-2 text-sm border"
              style={{ borderColor: "var(--color-line)" }}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                name="entry_date"
                defaultValue={editingEntry.entry_date}
                className="flex-1 rounded-md px-2.5 py-2 text-sm border"
                style={{ borderColor: "var(--color-line)" }}
              />
              <input
                type="time"
                name="start_time"
                defaultValue={hhmm(editingEntry.start_time)}
                className="flex-1 rounded-md px-2.5 py-2 text-sm border"
                style={{ borderColor: "var(--color-line)" }}
              />
              <input
                type="time"
                name="end_time"
                defaultValue={editingEntry.end_time ? hhmm(editingEntry.end_time) : ""}
                className="flex-1 rounded-md px-2.5 py-2 text-sm border"
                style={{ borderColor: "var(--color-line)" }}
              />
            </div>
            <div className="flex justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  startTransition(() => deleteTimeEntry(editingEntry.id));
                  setEditingId(null);
                }}
                className="text-sm font -medium"
                style={{ color: "var(--color-rust)" }}
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-sm px-3 py-1.5 rounded-md"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-sm font-medium px-3 py-1.5 rounded-md"
                  style={{ background: "var(--color-accent)", color: "var(--color-accent-ink)" }}
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}