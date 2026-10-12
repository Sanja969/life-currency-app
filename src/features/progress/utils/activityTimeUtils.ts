import type { Activity } from "@/types/activity";

export type TimeRange = {
  start: Date;
  end: Date;
};

/**
 * Returns the number of minutes of an activity
 * that overlap with a time range.
 *
 * Both intervals are treated as [start, end).
 */
export function getActivityMinutesInRange(
  activity: Activity,
  range: TimeRange,
): number {
  const activityStart = new Date(
    activity.activityDate,
  ).getTime();

  const activityEnd =
    activityStart + activity.durationMinutes * 60_000;

  const rangeStart = range.start.getTime();
  const rangeEnd = range.end.getTime();

  if (
    !Number.isFinite(activityStart) ||
    !Number.isFinite(activityEnd) ||
    !Number.isFinite(rangeStart) ||
    !Number.isFinite(rangeEnd) ||
    rangeEnd <= rangeStart ||
    activity.durationMinutes <= 0
  ) {
    return 0;
  }

  const overlapStart = Math.max(
    activityStart,
    rangeStart,
  );

  const overlapEnd = Math.min(
    activityEnd,
    rangeEnd,
  );

  return Math.max(
    0,
    (overlapEnd - overlapStart) / 60_000,
  );
}

/**
 * Returns activities that overlap a time range,
 * including activities that started before it.
 */
export function filterOverlappingActivities(
  activities: Activity[],
  range: TimeRange,
): Activity[] {
  return activities.filter(
    (activity) =>
      getActivityMinutesInRange(activity, range) > 0,
  );
}

/**
 * Returns activity copies whose durations represent
 * only the portion inside the requested range.
 *
 * Original database records remain unchanged.
 */
export function clipActivitiesToRange(
    activities: Activity[],
    range: TimeRange,
  ): Activity[] {
    return activities.flatMap((activity) => {
      const durationMinutes = getActivityMinutesInRange(
        activity,
        range,
      );
  
      if (durationMinutes <= 0) {
        return [];
      }
  
      const originalStart = new Date(
        activity.activityDate,
      ).getTime();
  
      const clippedStart = Math.max(
        originalStart,
        range.start.getTime(),
      );
  
      return [
        {
          ...activity,
          activityDate: new Date(clippedStart),
          durationMinutes,
        },
      ];
    });
  }