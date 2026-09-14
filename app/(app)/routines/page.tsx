import { Plus } from "lucide-react";
import { getTodayRoutines } from "@/lib/data-routines";
import { createRoutine } from "@/actions/routines";
import { DateHeading } from "@/components/DateHeading";
import { StreakStat } from "@/components/StreakStat";
import { RoutineList } from "@/components/RoutineList";

export const dynamic = "force-dynamic";

export default async function RoutinesPage() {
  const { routines, streak, date } = await getTodayRoutines();

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl mb-1">Routines</h1>
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            One streak for everything below. Miss one, and it resets.
          </p>
        </div>
        <DateHeading date={date} />
      </div>

      <div className="mb-8">
        <StreakStat streak={streak} label="day streak" />
      </div>

      <RoutineList routines={routines} />

      <form action={createRoutine} className="flex items-center gap-2 mt-5">
        <input
          type="text"
          name="title"
          placeholder="Add a routine, e.g. Stretch"
          required
          className="flex-1 rounded-md px-3 py-2 text-sm border"
          style={{ borderColor: "var(--color-line)" }}
        />
        <button
          type="submit"
          className="rounded-md p-2 shrink-0"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-ink)" }}
          aria-label="Add routine"
        >
          <Plus size={16} />
        </button>
      </form>
    </div>
  );
}
