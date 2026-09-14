import { getThoughts } from "@/lib/data-thoughts";
import { createThought } from "@/actions/thoughts";
import { formatMonthDay, formatWeekday } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function ThoughtsPage() {
  const thoughts = await getThoughts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl mb-1">Thoughts</h1>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Whatever's on your mind, dated automatically.
        </p>
      </div>

      <form action={createThought} className="mb-10">
        <textarea
          name="content"
          rows={4}
          placeholder="Write a thought..."
          required
          className="w-full rounded-md px-4 py-3 text-sm border leading-relaxed"
          style={{ borderColor: "var(--color-line)" }}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-ink)" }}
          >
            Add thought
          </button>
        </div>
      </form>

      {thoughts.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          No thoughts recorded yet.
        </p>
      ) : (
        <ul className="space-y-5">
          {thoughts.map((t) => (
            <li key={t.id} className="pb-5 border-b" style={{ borderColor: "var(--color-line)" }}>
              <p className="text-xs mb-1.5" style={{ color: "var(--color-ink-faint)" }}>
                {formatMonthDay(t.entry_date)}, {formatWeekday(t.entry_date)}
              </p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{t.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
