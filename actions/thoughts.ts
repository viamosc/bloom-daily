"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { todayStr } from "@/lib/date";

export async function createThought(formData: FormData) {
  const content = String(formData.get("content") || "").trim();
  if (!content) return;

  const sb = supabaseServer();
  await sb.from("thoughts").insert({
    content,
    entry_date: todayStr(),
  });

  revalidatePath("/thoughts");
}
