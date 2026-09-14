"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";

export async function createTodo(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const deadline = String(formData.get("deadline") || "").trim();
  if (!title) return;

  const sb = supabaseServer();
  await sb.from("todos").insert({
    title,
    deadline: deadline || null,
  });

  revalidatePath("/todos");
}

export async function toggleTodo(id: string, completed: boolean) {
  const sb = supabaseServer();
  await sb.from("todos").update({ completed }).eq("id", id);
  revalidatePath("/todos");
}
