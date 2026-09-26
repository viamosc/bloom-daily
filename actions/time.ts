"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { todayStr } from "@/lib/date";

export async function startTimeEntry(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const categoryId = String(formData.get("category_id") || "") || null;
  if (!title) return;

  const sb = supabaseServer();
  await sb.from("time_entries").insert({
    title,
    entry_date: todayStr(),
    start_time: new Date().toISOString(),
    category_id: categoryId,
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


export async function addManualEntry(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const categoryId = String(formData.get("category_id") || "") || null;
  const date = String(formData.get("entry_date") || todayStr());
  const startRaw = String(formData.get("start_time") || "");
  const endRaw = String(formData.get("end_time") || "");

  if (!title || !startRaw || !endRaw) return;

  // Accept either a plain "HH:MM" (from a <input type="time">) or an
  // already-full ISO string, and normalize both to ISO using entry_date.
  const startIso = startRaw.includes("T") ? startRaw : new Date(`${date}T${startRaw}`).toISOString();
  const endIso = endRaw.includes("T") ? endRaw : new Date(`${date}T${endRaw}`).toISOString();

  const startMs = new Date(startIso).getTime();
  const endMs = new Date(endIso).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    console.error("addManualEntry: invalid start/end time", { startRaw, endRaw, date });
    return;
  }

  const duration = Math.max(Math.round((endMs - startMs) / 1000), 0);

  const sb = supabaseServer();
  const { error } = await sb.from("time_entries").insert({
    title,
    entry_date: date,
    start_time: startIso,
    end_time: endIso,
    duration_seconds: duration,
    category_id: categoryId,
  });

  if (error) {
    console.error("Failed to add manual entry:", error);
    return;
  }

  revalidatePath("/time");
}

export async function updateTimeEntry(id: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const categoryId = String(formData.get("category_id") || "") || null;
  const entryDate = String(formData.get("entry_date") || "");
  const startTime = String(formData.get("start_time") || "");
  const endTime = String(formData.get("end_time") || "");

  const patch: Record<string, unknown> = {
    title,
    category_id: categoryId,
  };

  if (entryDate) patch.entry_date = entryDate;
  if (startTime) patch.start_time = startTime;
  if (endTime) patch.end_time = endTime;

  // Recalculate duration if both start and end times are present
  if (startTime && endTime) {
    patch.duration_seconds = Math.max(
      Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000),
      0
    );
  }

  const sb = supabaseServer();
  const { error } = await sb
    .from("time_entries")
    .update(patch) // Must be .update(), targeted by .eq("id", id)
    .eq("id", id);

  if (error) {
    console.error("Failed to update entry:", error);
  }

  revalidatePath("/time");
}

export async function deleteTimeEntry(id: string) {
  const sb = supabaseServer();
  await sb.from("time_entries").delete().eq("id", id);
  revalidatePath("/time");
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const color = String(formData.get("color") || "#888888");
  if (!name) return;
  const sb = supabaseServer();
  await sb.from("categories").insert({ name, color });
  revalidatePath("/time");
}