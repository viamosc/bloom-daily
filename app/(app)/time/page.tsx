import { getRunningEntry, getTimeEntriesByDate } from "@/lib/data-time";
import { TimerControl } from "@/components/TimerControl";
import { DateHeading } from "@/components/DateHeading";
import { formatTime, formatDuration } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function TimePage() {
  const [running, days] = await Promise.all([getRunningEntry(), getTimeEntriesByDate()]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl mb-1">Time</h1>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Name what you're doing, start it, end it. It lands in the table below.
        </p>
      </div>

      <TimerControl running={running} />

      {days.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          No sessions logged yet.
        </p>
      ) : (
        <div className="space-y-8">
          {days.map((day) => (
            <div key={day.date}>
              <div className="mb-3">
                <DateHeading date={day.date} size="lg" />
              </div>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-sm min-w-[420px]">
                  <tbody>
                    {day.entries.map((entry) => (
                      <tr key={entry.id} className="border-b" style={{ borderColor: "var(--color-line)" }}>
                        <td className="py-2.5 pr-3">{entry.title}</td>
                        <td
                          className="py-2.5 pr-3 text-right whitespace-nowrap"
                          style={{ color: "var(--color-ink-muted)" }}
                        >
                          {formatTime(entry.start_time)} – {entry.end_time ? formatTime(entry.end_time) : "–"}
                        </td>
                        <td
                          className="py-2.5 text-right whitespace-nowrap font-medium"
                          style={{ color: "var(--color-accent)" }}
                        >
                          {entry.duration_seconds != null ? formatDuration(entry.duration_seconds) : "–"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}