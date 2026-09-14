"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { todayStr } from "@/lib/date";

export async function createRoutine(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  const sb = supabaseServer();
  const { data: max } = await sb
    .from("routines")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await sb.from("routines").insert({
    title,
    sort_order: (max?.sort_order ?? 0) + 1,
  });

  revalidatePath("/routines");
  revalidatePath("/");
}

export async function toggleRoutine(routineId: string, completed: boolean) {
  const sb = supabaseServer();
  const date = todayStr();

  await sb
    .from("routine_logs")
    .upsert(
      {
        routine_id: routineId,
        log_date: date,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "routine_id,log_date" }
    );

  revalidatePath("/routines");
  revalidatePath("/");
}
