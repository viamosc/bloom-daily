import Link from "next/link";
import { Sun, Moon, ArrowRight } from "lucide-react";
import { getTodayRoutines } from "@/lib/data-routines";
import { getJournalStreak, getJournalDays } from "@/lib/data-journal";
import { getTodos } from "@/lib/data-todos";
import { getRunningEntries } from "@/lib/data-time";
import { DateHeading } from "@/components/DateHeading";
import { StreakStat } from "@/components/StreakStat";
import { RoutineList } from "@/components/RoutineList";
import { formatMonthDay, todayStr } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const today = todayStr();
  const [routineData, journalStreak, journalDays, todos, running] = await Promise.all([
    getTodayRoutines(),
    getJournalStreak(),
    getJournalDays(),
    getTodos(),
    getRunningEntries(),
  ]);

  const todayJournal = journalDays.find((d) => d.date === today);
  const upcomingTodos = todos.filter((t) => !t.completed).slice(0, 5);

  return (
    <div>
      <div className="mb-10">
        <DateHeading date={today} size="lg" />
      </div>

      {running.length > 0 && (
        <div className="mb-8 space-y-2">
          {running.map((r) => (
            <div
              key={r.id}
              className="rounded-md px-4 py-3 text-sm flex items-center justify-between"
              style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}
            >
              <span>Timing: {r.title}</span>
              <Link href="/time" className="flex items-center gap-1 font-medium">
                Open <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      )}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Routines</h2>
          <StreakStat streak={routineData.streak} label="streak" />
        </div>
        <RoutineList routines={routineData.routines} />
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Journal</h2>
          <StreakStat streak={journalStreak} label="streak" />
        </div>
        <div className="flex items-center gap-2">
          <SessionLink
            filled={!!todayJournal?.morning?.content?.trim()}
            href={`/journal/${today}/morning${todayJournal?.morning?.content?.trim() ? "" : "/edit"}`}
            icon={Sun}
            label="Morning"
          />
          <SessionLink
            filled={!!todayJournal?.evening?.content?.trim()}
            href={`/journal/${today}/evening${todayJournal?.evening?.content?.trim() ? "" : "/edit"}`}
            icon={Moon}
            label="Evening"
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Upcoming tasks</h2>
          <Link href="/todos" className="text-sm flex items-center gap-1" style={{ color: "var(--color-ink-muted)" }}>
            All tasks <ArrowRight size={13} />
          </Link>
        </div>
        {upcomingTodos.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Nothing pending.
          </p>
        ) : (
          <ul>
            {upcomingTodos.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between py-2.5 border-b text-sm"
                style={{ borderColor: "var(--color-line)" }}
              >
                <span>{t.title}</span>
                {t.deadline && (
                  <span style={{ color: "var(--color-ink-faint)" }}>{formatMonthDay(t.deadline)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SessionLink({
  href,
  icon: Icon,
  label,
  filled,
}: {
  href: string;
  icon: typeof Sun;
  label: string;
  filled: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-sm rounded-md px-4 py-2.5 border flex-1"
      style={{
        borderColor: filled ? "var(--color-accent)" : "var(--color-line)",
        background: filled ? "var(--color-accent-soft)" : "transparent",
        color: filled ? "var(--color-accent)" : "var(--color-ink-muted)",
      }}
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}
