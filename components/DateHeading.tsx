import { formatMonthDay, formatWeekday } from "@/lib/date";

export function DateHeading({ date, size = "sm" }: { date: string; size?: "sm" | "lg" }) {
  if (size === "lg") {
    return (
      <div>
        <p className="font-display text-2xl leading-tight">{formatMonthDay(date)}</p>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          {formatWeekday(date)}
        </p>
      </div>
    );
  }

  return (
    <div className="text-right shrink-0">
      <p className="text-sm font-medium leading-tight">{formatMonthDay(date)}</p>
      <p className="text-xs" style={{ color: "var(--color-ink-faint)" }}>
        {formatWeekday(date)}
      </p>
    </div>
  );
}
