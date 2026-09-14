import { Plus } from "lucide-react";
import { getTodos } from "@/lib/data-todos";
import { createTodo } from "@/actions/todos";
import { TodoList } from "@/components/TodoList";

export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const todos = await getTodos();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl mb-1">Tasks</h1>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          One-off work with a deadline. No streak here.
        </p>
      </div>

      <TodoList todos={todos} />

      <form action={createTodo} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-5">
        <input
          type="text"
          name="title"
          placeholder="Add a task"
          required
          className="flex-1 rounded-md px-3 py-2 text-sm border"
          style={{ borderColor: "var(--color-line)" }}
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            name="deadline"
            className="flex-1 sm:flex-none rounded-md px-3 py-2 text-sm border"
            style={{ borderColor: "var(--color-line)" }}
          />
          <button
            type="submit"
            className="rounded-md p-2 shrink-0"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-ink)" }}
            aria-label="Add task"
          >
            <Plus size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}