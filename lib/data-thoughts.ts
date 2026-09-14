import { supabaseServer } from "./supabase";

export type Thought = {
  id: string;
  content: string;
  entry_date: string;
  created_at: string;
};

export async function getThoughts(): Promise<Thought[]> {
  const sb = supabaseServer();
  const { data } = await sb
    .from("thoughts")
    .select("id, content, entry_date, created_at")
    .order("created_at", { ascending: false });

  return (data as Thought[]) ?? [];
}
