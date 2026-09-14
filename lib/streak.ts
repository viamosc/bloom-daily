import { yesterdayOf } from "./date";

// Given a function that tells us whether a given date was "fully done",
// walk backwards from today to compute the current streak.
// If today is already fully done, it counts; if not, today is simply
// skipped (the day isn't over yet) and we start counting from yesterday.
export function computeStreak(
  todayStr: string,
  isDayFull: (dateStr: string) => boolean
): number {
  let streak = 0;
  let cursor = todayStr;

  if (isDayFull(cursor)) {
    streak += 1;
    cursor = yesterdayOf(cursor);
  } else {
    cursor = yesterdayOf(cursor);
  }

  while (isDayFull(cursor)) {
    streak += 1;
    cursor = yesterdayOf(cursor);
  }

  return streak;
}
