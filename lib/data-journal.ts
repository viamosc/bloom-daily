import { supabaseServer } from "./supabase";
import { todayStr } from "./date";
import { computeStreak } from "./streak";

export type JournalSession = "morning" | "evening";

export type JournalEntry = {
  id: string;
  entry_date: string;
  session: JournalSession;
  content: string;
  updated_at: string;
};

export type JournalSettings = {
  morning_time: string;
  evening_time: string;
};

export async function getJournalSettings(): Promise<JournalSettings> {
  const sb = supabaseServer();
  const { data } = await sb
    .from("journal_settings")
    .select("morning_time, evening_time")
    .eq("id", 1)
    .maybeSingle();

  return {
    morning_time: data?.morning_time?.slice(0, 5) ?? "08:00",
    evening_time: data?.evening_time?.slice(0, 5) ?? "21:00",
  };
}

// Returns entries grouped by date, most recent first.
export async function getJournalDays(): Promise<
  { date: string; morning: JournalEntry | null; evening: JournalEntry | null }[]
> {
  const sb = supabaseServer();
  const { data } = await sb
    .from("journal_entries")
    .select("id, entry_date, session, content, updated_at")
    .order("entry_date", { ascending: false });

  const byDate = new Map<
    string,
    { date: string; morning: JournalEntry | null; evening: JournalEntry | null }
  >();

  for (const entry of data ?? []) {
    if (!byDate.has(entry.entry_date)) {
      byDate.set(entry.entry_date, { date: entry.entry_date, morning: null, evening: null });
    }
    const day = byDate.get(entry.entry_date)!;
    if (entry.session === "morning") day.morning = entry as JournalEntry;
    else day.evening = entry as JournalEntry;
  }

  return Array.from(byDate.values());
}

export async function getJournalEntry(
  date: string,
  session: JournalSession
): Promise<JournalEntry | null> {
  const sb = supabaseServer();
  const { data } = await sb
    .from("journal_entries")
    .select("id, entry_date, session, content, updated_at")
    .eq("entry_date", date)
    .eq("session", session)
    .maybeSingle();

  return (data as JournalEntry) ?? null;
}

export async function getJournalStreak(): Promise<number> {
  const sb = supabaseServer();
  const since = new Date();
  since.setDate(since.getDate() - 400);

  const { data } = await sb
    .from("journal_entries")
    .select("entry_date, session, content")
    .gte("entry_date", since.toISOString().slice(0, 10));

  const byDate = new Map<string, Set<JournalSession>>();
  for (const entry of data ?? []) {
    if (!entry.content || !entry.content.trim()) continue;
    if (!byDate.has(entry.entry_date)) byDate.set(entry.entry_date, new Set());
    byDate.get(entry.entry_date)!.add(entry.session);
  }

  const isDayFull = (dateStr: string) => {
    const set = byDate.get(dateStr);
    if (!set) return false;
    return set.has("morning") && set.has("evening");
  };

  return computeStreak(todayStr(), isDayFull);
}
