"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { todayStr } from "@/lib/date";

export async function startTimeEntry(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  const sb = supabaseServer();

  // Only one timer runs at a time; close any stray running entry first.
  const { data: running } = await sb
    .from("time_entries")
    .select("id, start_time")
    .is("end_time", null)
    .maybeSingle();

  if (running) {
    const end = new Date();
    const duration = Math.round(
      (end.getTime() - new Date(running.start_time).getTime()) / 1000
    );
    await sb
      .from("time_entries")
      .update({ end_time: end.toISOString(), duration_seconds: Math.max(duration, 0) })
      .eq("id", running.id);
  }

  await sb.from("time_entries").insert({
    title,
    entry_date: todayStr(),
    start_time: new Date().toISOString(),
  });

  revalidatePath("/time");
}

export async function endTimeEntry(id: string) {
  const sb = supabaseServer();
  const { data: entry } = await sb
    .from("time_entries")
    .select("start_time")
    .eq("id", id)
    .maybeSingle();

  if (!entry) return;

  const end = new Date();
  const duration = Math.round(
    (end.getTime() - new Date(entry.start_time).getTime()) / 1000
  );

  await sb
    .from("time_entries")
    .update({ end_time: end.toISOString(), duration_seconds: Math.max(duration, 0) })
    .eq("id", id);

  revalidatePath("/time");
}
