import { supabaseServer } from "./supabase";

export type Todo = {
  id: string;
  title: string;
  deadline: string | null;
  completed: boolean;
};

export async function getTodos(): Promise<Todo[]> {
  const sb = supabaseServer();
  const { data } = await sb
    .from("todos")
    .select("id, title, deadline, completed")
    .order("completed", { ascending: true })
    .order("deadline", { ascending: true, nullsFirst: false });

  return data ?? [];
}
