import type { Activity } from "@/types/activity";

export type ActivityDaySegment = {
  date: Date;
  durationMinutes: number;
};

export function splitActivityByDay(
  activity: Activity,
): ActivityDaySegment[] {
  const start = new Date(activity.activityDate);

  const durationMinutes = activity.durationMinutes;

  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(durationMinutes) ||
    durationMinutes <= 0
  ) {
    return [];
  }

  const end = new Date(
    start.getTime() + durationMinutes * 60_000,
  );

  const segments: ActivityDaySegment[] = [];

  let cursor = new Date(start);

  while (cursor < end) {
    const nextMidnight = new Date(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate() + 1,
    );

    const segmentEnd = new Date(
      Math.min(nextMidnight.getTime(), end.getTime()),
    );

    const segmentMinutes =
      (segmentEnd.getTime() - cursor.getTime()) / 60_000;

    segments.push({
      date: new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
      ),
      durationMinutes: segmentMinutes,
    });

    cursor = segmentEnd;
  }

  return segments;
}