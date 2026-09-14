import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft, Sun, Moon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getJournalEntry } from "@/lib/data-journal";
import { DateHeading } from "@/components/DateHeading";

export const dynamic = "force-dynamic";

export default async function JournalReadPage({
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
        href="/journal"
        className="inline-flex items-center gap-1.5 text-sm mb-6"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <ArrowLeft size={14} />
        Journal
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Icon size={14} style={{ color: "var(--color-ink-faint)" }} />
            <span className="text-sm capitalize" style={{ color: "var(--color-ink-muted)" }}>
              {session}
            </span>
          </div>
          <DateHeading date={date} size="lg" />
        </div>

        <Link
          href={`/journal/${date}/${session}/edit`}
          className="flex items-center gap-1.5 text-sm rounded-md px-3 py-1.5"
          style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}
        >
          <Pencil size={13} />
          Edit
        </Link>
      </div>

      {entry?.content?.trim() ? (
        <article className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.content}</ReactMarkdown>
        </article>
      ) : (
        <div className="py-8 text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Nothing written for this session yet.{" "}
          <Link href={`/journal/${date}/${session}/edit`} style={{ color: "var(--color-accent)" }}>
            Write it now
          </Link>
        </div>
      )}
    </div>
  );
}
