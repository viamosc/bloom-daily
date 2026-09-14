import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { getJournalEntry } from "@/lib/data-journal";
import { saveJournalEntry } from "@/actions/journal";
import { DateHeading } from "@/components/DateHeading";

export const dynamic = "force-dynamic";

export default async function JournalEditPage({
  params,
}: {
  params: Promise<{ date: string; session: string }>;
}) {
  const { date, session } = await params;
  if (session !== "morning" && session !== "evening") notFound();

  const entry = await getJournalEntry(date, session);
  const Icon = session === "morning" ? Sun : Moon;

  return (
    <div>
      <Link
        href={`/journal/${date}/${session}`}
        className="inline-flex items-center gap-1.5 text-sm mb-6"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <ArrowLeft size={14} />
        Cancel
      </Link>

      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} style={{ color: "var(--color-ink-faint)" }} />
        <span className="text-sm capitalize" style={{ color: "var(--color-ink-muted)" }}>
          {session}
        </span>
      </div>
      <div className="mb-6">
        <DateHeading date={date} size="lg" />
      </div>

      <form action={saveJournalEntry}>
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="session" value={session} />
        <textarea
          name="content"
          defaultValue={entry?.content ?? ""}
          autoFocus
          rows={16}
          placeholder="Write in markdown..."
          className="w-full rounded-md px-4 py-3 text-sm border leading-relaxed"
          style={{ borderColor: "var(--color-line)", fontFamily: "var(--font-body)" }}
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-ink)" }}
          >
            Save entry
          </button>
        </div>
      </form>
    </div>
  );
}
