import { Flame } from "lucide-react";

export function StreakStat({ streak, label }: { streak: number; label: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="font-display text-4xl leading-none" style={{ color: "var(--color-accent)" }}>
        {streak}
      </span>
      <div className="flex items-center gap-1">
        <Flame size={13} style={{ color: "var(--color-ink-faint)" }} />
        <span className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          {label}
        </span>
      </div>
    </div>
  );
}
