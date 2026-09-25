import { getRunningEntries, getTimeEntriesByDate, getCategories } from "@/lib/data-time";
import { TimerControl } from "@/components/TimerControl";
import { DateHeading } from "@/components/DateHeading";
import { DayTimetable } from "@/components/Daytimetable";
import { formatDuration, todayStr } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function TimePage() {
  const [running, days, categories] = await Promise.all([
    getRunningEntries(),
    getTimeEntriesByDate(),
    getCategories(),
  ]);
  const today = todayStr();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl mb-1">Time</h1>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Name what you're doing, start it, end it. It lands on the timetable below.
        </p>
      </div>

      <TimerControl running={running} categories={categories} />

      {days.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          No sessions logged yet.
        </p>
      ) : (
        <div className="space-y-10">
          {days.map((day) => {
            const totalSeconds = day.entries.reduce(
              (sum, e) => sum + (e.duration_seconds ?? 0),
              0
            );
            return (
              <div key={day.date}>
                <div className="flex items-end justify-between mb-3">
                  <DateHeading date={day.date} size="lg" />
                  {totalSeconds > 0 && (
                    <span className="text-xs font-medium" style={{ color: "var(--color-ink-faint)" }}>
                      {formatDuration(totalSeconds)} total
                    </span>
                  )}
                </div>
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="min-w-[420px]">
                    <DayTimetable
                      entries={day.entries}
                      isToday={day.date === today}
                      categories={categories}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}