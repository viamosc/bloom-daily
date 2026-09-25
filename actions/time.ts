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
  const start = String(formData.get("start_time") || "");
  const end = String(formData.get("end_time") || "");
  if (!title || !start || !end) return;

  const startIso = new Date(`${date}T${start}`).toISOString();
  const endIso = new Date(`${date}T${end}`).toISOString();
  const duration = Math.max(
    Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000),
    0
  );

  const sb = supabaseServer();
  await sb.from("time_entries").insert({
    title,
    entry_date: date,
    start_time: startIso,
    end_time: endIso,
    duration_seconds: duration,
    category_id: categoryId,
  });
  revalidatePath("/time");
}

export async function updateTimeEntry(id: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const categoryId = String(formData.get("category_id") || "") || null;
  const date = String(formData.get("entry_date") || "");
  const start = String(formData.get("start_time") || "");
  const end = String(formData.get("end_time") || "");

  const patch: Record<string, unknown> = { title, category_id: categoryId };
  if (date && start) patch.start_time = new Date(`${date}T${start}`).toISOString();
  if (date && end) {
    const endIso = new Date(`${date}T${end}`).toISOString();
    patch.end_time = endIso;
    patch.duration_seconds = Math.max(
      Math.round((new Date(endIso).getTime() - new Date(patch.start_time as string).getTime()) / 1000),
      0
    );
  }

  const sb = supabaseServer();
  await sb.from("time_entries").update(patch).eq("id", id);
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