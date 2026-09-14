import { supabaseServer } from "./supabase";

export type TimeEntry = {
  id: string;
  title: string;
  entry_date: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
};

export async function getRunningEntry(): Promise<TimeEntry | null> {
  const sb = supabaseServer();
  const { data } = await sb
    .from("time_entries")
    .select("id, title, entry_date, start_time, end_time, duration_seconds")
    .is("end_time", null)
    .order("start_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as TimeEntry) ?? null;
}

export async function getTimeEntriesByDate(): Promise<
  { date: string; entries: TimeEntry[] }[]
> {
  const sb = supabaseServer();
  const { data } = await sb
    .from("time_entries")
    .select("id, title, entry_date, start_time, end_time, duration_seconds")
    .not("end_time", "is", null)
    .order("entry_date", { ascending: false })
    .order("start_time", { ascending: true });

  const byDate = new Map<string, TimeEntry[]>();
  for (const entry of (data as TimeEntry[]) ?? []) {
    if (!byDate.has(entry.entry_date)) byDate.set(entry.entry_date, []);
    byDate.get(entry.entry_date)!.push(entry);
  }

  return Array.from(byDate.entries()).map(([date, entries]) => ({ date, entries }));
}
