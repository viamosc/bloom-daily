import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import {
  getJournalDays,
  getJournalSettings,
  getJournalStreak,
} from "@/lib/data-journal";
import { updateJournalSettings } from "@/actions/journal";
import { StreakStat } from "@/components/StreakStat";
import { DateHeading } from "@/components/DateHeading";
import { todayStr } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const [days, settings, streak] = await Promise.all([
    getJournalDays(),
    getJournalSettings(),
    getJournalStreak(),
  ]);

  const today = todayStr();
  const hasToday = days.some((d) => d.date === today);
  const allDays = hasToday
    ? days
    : [{ date: today, morning: null, evening: null }, ...days];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl mb-1">Journal</h1>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Two sessions a day. Both count toward the streak.
        </p>
      </div>

      <div className="mb-8">
        <StreakStat streak={streak} label="day streak" />
      </div>

      <details className="mb-8 text-sm">
        <summary style={{ color: "var(--color-ink-muted)" }} className="cursor-pointer">
          Session times
        </summary>
        <form
          action={updateJournalSettings}
          className="flex flex-wrap items-center gap-3 mt-3"
        >
          <label className="flex items-center gap-2">
            <Sun size={14} style={{ color: "var(--color-ink-faint)" }} />
            <input
              type="time"
              name="morning_time"
              defaultValue={settings.morning_time}
              className="rounded-md px-2 py-1.5 text-sm border"
              style={{ borderColor: "var(--color-line)" }}
            />
          </label>
          <label className="flex items-center gap-2">
            <Moon size={14} style={{ color: "var(--color-ink-faint)" }} />
            <input
              type="time"
              name="evening_time"
              defaultValue={settings.evening_time}
              className="rounded-md px-2 py-1.5 text-sm border"
              style={{ borderColor: "var(--color-line)" }}
            />
          </label>
          <button
            type="submit"
            className="text-sm rounded-md px-3 py-1.5"
            style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}
          >
            Save
          </button>
        </form>
      </details>

      <ul>
        {allDays.map((day) => (
          <li
            key={day.date}
            className="flex flex-wrap items-center justify-between gap-3 py-3.5 border-b"
            style={{ borderColor: "var(--color-line)" }}
          >
            <DateHeading date={day.date} size="lg" />
            <div className="flex items-center gap-2">
              <SessionPill date={day.date} session="morning" filled={!!day.morning?.content?.trim()} />
              <SessionPill date={day.date} session="evening" filled={!!day.evening?.content?.trim()} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SessionPill({
  date,
  session,
  filled,
}: {
  date: string;
  session: "morning" | "evening";
  filled: boolean;
}) {
  const Icon = session === "morning" ? Sun : Moon;
  return (
    <Link
      href={`/journal/${date}/${session}`}
      className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border"
      style={{
        borderColor: filled ? "var(--color-accent)" : "var(--color-line)",
        background: filled ? "var(--color-accent-soft)" : "transparent",
        color: filled ? "var(--color-accent)" : "var(--color-ink-muted)",
      }}
    >
      <Icon size={12} />
      {session === "morning" ? "Morning" : "Evening"}
    </Link>
  );
}