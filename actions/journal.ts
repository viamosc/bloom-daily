"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";

export async function saveJournalEntry(formData: FormData) {
  const date = String(formData.get("date") || "");
  const session = String(formData.get("session") || "");
  const content = String(formData.get("content") || "");

  if (!date || (session !== "morning" && session !== "evening")) return;

  const sb = supabaseServer();
  await sb.from("journal_entries").upsert(
    {
      entry_date: date,
      session,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "entry_date,session" }
  );

  revalidatePath("/journal");
  revalidatePath(`/journal/${date}/${session}`);
  redirect(`/journal/${date}/${session}`);
}

export async function updateJournalSettings(formData: FormData) {
  const morning_time = String(formData.get("morning_time") || "08:00");
  const evening_time = String(formData.get("evening_time") || "21:00");

  const sb = supabaseServer();
  await sb
    .from("journal_settings")
    .update({ morning_time, evening_time })
    .eq("id", 1);

  revalidatePath("/journal");
}
