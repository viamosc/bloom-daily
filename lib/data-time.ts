import { supabaseServer } from "./supabase";

export type Category = { id: string; name: string; color: string };

export type TimeEntry = {
  id: string;
  title: string;
  entry_date: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  category_id: string | null;
};

export async function getRunningEntries(): Promise<TimeEntry[]> {
  const sb = supabaseServer();
  const { data } = await sb
    .from("time_entries")
    .select("id, title, entry_date, start_time, end_time, duration_seconds, category_id")
    .is("end_time", null)
    .order("start_time", { ascending: false });

  return (data as TimeEntry[]) ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const sb = supabaseServer();
  const { data } = await sb
    .from("categories")
    .select("id, name, color")
    .order("name");

  return (data as Category[]) ?? [];
}

export async function getTimeEntriesByDate(): Promise<
  { date: string; entries: TimeEntry[] }[]
> {
  const sb = supabaseServer();
  const { data } = await sb
    .from("time_entries")
    .select("id, title, entry_date, start_time, end_time, duration_seconds, category_id")
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