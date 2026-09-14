const TZ = process.env.APP_TIMEZONE || "Asia/Manila";

// Returns today's date as YYYY-MM-DD in the app's timezone.
export function todayStr(): string {
  return dateToStr(new Date());
}

export function dateToStr(d: Date): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d); // en-CA gives YYYY-MM-DD
}

// "YYYY-MM-DD" -> "September 14"
export function formatMonthDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}

// "YYYY-MM-DD" -> "Monday"
export function formatWeekday(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(d);
}

// "YYYY-MM-DD" -> "September 14 · Monday"
export function formatDateWithDay(dateStr: string): string {
  return `${formatMonthDay(dateStr)} · ${formatWeekday(dateStr)}`;
}

export function addDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function yesterdayOf(dateStr: string): string {
  return addDays(dateStr, -1);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(iso));
}

export { TZ };
