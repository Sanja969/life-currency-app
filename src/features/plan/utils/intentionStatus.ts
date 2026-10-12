import type {
    WeeklyIntentionProgress,
} from "@/types/weeklyIntention";

/**
 * The current status of a weekly intention,
 * based only on recorded activities.
 */
export type IntentionStatus =
    | "reached"
    | "in_progress"
    | "within_limit"
    | "over_limit";

export type IntentionStatusDetails = {
    status: IntentionStatus;
    label: string;
    isOnTrack: boolean;
    differenceMinutes: number;
};

/**
 * Determines the current status of an intention.
 *
 * AT LEAST:
 * - Reached when recorded time >= target.
 * - Otherwise, still in progress.
 *
 * AT MOST:
 * - Over limit when recorded time > target.
 * - Otherwise, currently within limit.
 *
 * Being within a limit does not mean the week
 * is completed or that all time was recorded.
 */
export function getIntentionStatus(
    intention: WeeklyIntentionProgress,
): IntentionStatusDetails {
    const {
        direction,
        actualMinutes,
        targetMinutes,
    } = intention;

    if (direction === "at_most") {
        const isOverLimit =
            actualMinutes > targetMinutes;

        return {
            status: isOverLimit
                ? "over_limit"
                : "within_limit",

            label: isOverLimit
                ? "Over limit"
                : "Within limit",

            isOnTrack: !isOverLimit,

            differenceMinutes: Math.abs(
                targetMinutes - actualMinutes,
            ),
        };
    }

    const isReached =
        actualMinutes >= targetMinutes;

    return {
        status: isReached
            ? "reached"
            : "in_progress",

        label: isReached
            ? "Reached"
            : "In progress",

        isOnTrack: isReached,

        differenceMinutes: Math.abs(
            targetMinutes - actualMinutes,
        ),
    };
}

/**
 * Builds a summary of all weekly intentions.
 */
export function getIntentionSummary(
    intentions: WeeklyIntentionProgress[],
) {
    const summary = {
        total: intentions.length,
        onTrack: 0,
        reached: 0,
        inProgress: 0,
        withinLimit: 0,
        overLimit: 0,
    };

    for (const intention of intentions) {
        const result =
            getIntentionStatus(intention);

        if (result.isOnTrack) {
            summary.onTrack += 1;
        }

        switch (result.status) {
            case "reached":
                summary.reached += 1;
                break;

            case "in_progress":
                summary.inProgress += 1;
                break;

            case "within_limit":
                summary.withinLimit += 1;
                break;

            case "over_limit":
                summary.overLimit += 1;
                break;
        }
    }

    return summary;
}