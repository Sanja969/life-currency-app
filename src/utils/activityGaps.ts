import type { Activity } from "@/types/activity";

export type ActivityGap = {
    id: string;
    start: Date;
    end: Date;
    durationMinutes: number;
};

const MIN_GAP_MINUTES = 15;
const MINUTE_MS = 60_000;

export function getActivityGaps(
    activities: Activity[],
    minGapMinutes = MIN_GAP_MINUTES,
): ActivityGap[] {
    if (activities.length < 2) {
        return [];
    }

    const sorted = [...activities]
        .filter(
            (activity) =>
                Number.isFinite(new Date(activity.activityDate).getTime()) &&
                Number.isFinite(activity.durationMinutes) &&
                activity.durationMinutes > 0,
        )
        .sort(
            (a, b) =>
                new Date(a.activityDate).getTime() -
                new Date(b.activityDate).getTime(),
        );

    const gaps: ActivityGap[] = [];

    let previousEnd: number | null = null;

    for (const activity of sorted) {
        const start = new Date(activity.activityDate).getTime();
        const end = start + activity.durationMinutes * MINUTE_MS;

        if (previousEnd !== null) {
            const durationMinutes = (start - previousEnd) / MINUTE_MS;

            if (durationMinutes >= minGapMinutes) {
                gaps.push({
                    id: `${previousEnd}-${start}`,
                    start: new Date(previousEnd),
                    end: new Date(start),
                    durationMinutes,
                });
            }
        }

        previousEnd = Math.max(previousEnd ?? end, end);
    }

    return gaps;
}