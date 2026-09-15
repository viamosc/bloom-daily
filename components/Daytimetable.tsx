"use client";

import { useEffect, useState } from "react";
import type { TimeEntry } from "@/lib/data-time";
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

export function DayTimetable({ entries, isToday }: { entries: TimeEntry[]; isToday: boolean }) {
  // Re-render periodically so today's "now" line and any in-progress block stay current.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [isToday]);

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const laidOut = layout(entries, nowMin);

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
    <div className="flex">
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
          return (
            <div
              key={e.id}
              className="absolute rounded-md px-2 py-1 overflow-hidden text-left"
              style={{
                top,
                height,
                left: `calc(${leftPct}% + 2px)`,
                width: `calc(${widthPct}% - 4px)`,
                background: e.ongoing ? "var(--color-accent-soft)" : "var(--color-surface)",
                border: `1px solid ${e.ongoing ? "var(--color-accent)" : "var(--color-line)"}`,
                zIndex: 10,
              }}
            >
              <p
                className="text-xs font-medium leading-tight truncate"
                style={{ color: e.ongoing ? "var(--color-accent)" : "var(--color-ink)" }}
              >
                {e.title}
              </p>
              {height > 32 && (
                <p className="text-xs leading-tight truncate" style={{ color: "var(--color-ink-muted)" }}>
                  {formatTime(e.start_time)} – {e.ongoing ? "now" : formatTime(e.end_time as string)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}