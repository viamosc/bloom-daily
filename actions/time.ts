"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { todayStr } from "@/lib/date";

export async function startTimeEntry(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  const sb = supabaseServer();

  // The lookup for a stray running entry and the insert of the new entry
  // are independent — run them in parallel instead of one after another.
  const [{ data: running }] = await Promise.all([
    sb
      .from("time_entries")
      .select("id, start_time")
      .is("end_time", null)
      .maybeSingle(),
    sb.from("time_entries").insert({
      title,
      entry_date: todayStr(),
      start_time: new Date().toISOString(),
    }),
  ]);

  // Only pay for a third round trip when there was actually something to close.
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