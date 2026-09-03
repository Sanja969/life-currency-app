import { Activity } from "@/types/activity";

type ActivityInterval = Pick<
  Activity,
  "activityDate" | "durationMinutes"
>;

export function getActivityEndTime(
  activityDate: Date,
  durationMinutes: number,
): Date {
  return new Date(
    activityDate.getTime() + durationMinutes * 60_000,
  );

}

export function activitiesOverlap(
  first: ActivityInterval,
  second: ActivityInterval,
): boolean {
  const firstStart = first.activityDate;
  const firstEnd = getActivityEndTime(
    first.activityDate,
    first.durationMinutes,
  );

  const secondStart = second.activityDate;
  const secondEnd = getActivityEndTime(
    second.activityDate,
    second.durationMinutes,
  );

  return (
    firstStart.getTime() < secondEnd.getTime() &&
    firstEnd.getTime() > secondStart.getTime()
  );
}