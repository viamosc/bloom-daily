import { supabaseServer } from "./supabase";
import { todayStr } from "./date";
import { computeStreak } from "./streak";

export type Routine = {
  id: string;
  title: string;
  sort_order: number;
};

export type RoutineWithStatus = Routine & { completed: boolean };

export async function getTodayRoutines(): Promise<{
  routines: RoutineWithStatus[];
  streak: number;
  date: string;
}> {
  const sb = supabaseServer();
  const date = todayStr();

  const { data: routines } = await sb
    .from("routines")
    .select("id, title, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const routineList = routines ?? [];
  const ids = routineList.map((r) => r.id);

  const { data: todayLogs } = ids.length
    ? await sb
        .from("routine_logs")
        .select("routine_id, completed")
        .eq("log_date", date)
        .in("routine_id", ids)
    : { data: [] as { routine_id: string; completed: boolean }[] };

  const completedSet = new Set(
    (todayLogs ?? []).filter((l) => l.completed).map((l) => l.routine_id)
  );

  const withStatus: RoutineWithStatus[] = routineList.map((r) => ({
    ...r,
    completed: completedSet.has(r.id),
  }));

  const streak = await getRoutineStreak(ids);

  return { routines: withStatus, streak, date };
}

async function getRoutineStreak(activeIds: string[]): Promise<number> {
  if (activeIds.length === 0) return 0;
  const sb = supabaseServer();
  const since = new Date();
  since.setDate(since.getDate() - 400);

  const { data: logs } = await sb
    .from("routine_logs")
    .select("routine_id, log_date, completed")
    .gte("log_date", since.toISOString().slice(0, 10))
    .in("routine_id", activeIds);

  const byDate = new Map<string, Set<string>>();
  for (const log of logs ?? []) {
    if (!log.completed) continue;
    if (!byDate.has(log.log_date)) byDate.set(log.log_date, new Set());
    byDate.get(log.log_date)!.add(log.routine_id);
  }

  const isDayFull = (dateStr: string) => {
    const set = byDate.get(dateStr);
    if (!set) return false;
    return activeIds.every((id) => set.has(id));
  };

  return computeStreak(todayStr(), isDayFull);
}
