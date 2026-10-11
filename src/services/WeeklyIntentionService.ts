import {
    ActivityCategory,
    ActivityClassification,
} from "@/types/activity";

import type {
    SaveWeeklyIntentionInput,
    WeeklyIntentionProgress,
} from "@/types/weeklyIntention";

import { activityService } from "@/services/ActivityService";

import { weeklyIntentionRepository } from "@/repositories/WeeklyIntentionRepository";

function getWeekDateRange(
    weekStart: string,
): {
    start: Date;
    end: Date;
} {
    const [year, month, day] = weekStart
        .split("-")
        .map(Number);

    const start = new Date(
        year,
        month - 1,
        day,
    );

    const end = new Date(
        year,
        month - 1,
        day + 7,
    );

    return { start, end };
}

export class WeeklyIntentionService {
    async getWeeklyProgress(
        weekStart: string,
    ): Promise<WeeklyIntentionProgress[]> {
        const intentions =
            await weeklyIntentionRepository.getByWeek(
                weekStart,
            );

        if (intentions.length === 0) {
            return [];
        }

        const { start, end } =
            getWeekDateRange(weekStart);

        const activities =
            await activityService.getActivitiesByDateRange(
                start,
                end,
            );

        return intentions.map((intention) => {
            /*
             * Only Growing activities contribute
             * to weekly intention progress.
             */

            const actualMinutes = activities
                .filter(
                    (activity) =>
                        activity.category === intention.category &&
                        activity.classification ===
                        ActivityClassification.Serves,
                )
                .reduce(
                    (total, activity) =>
                        total + activity.durationMinutes,
                    0,
                );

            /*
             * Allow progress above 100%.
             * The UI caps the progress bar,
             * but displays the actual percentage.
             */

            const progressPercent = Math.round(
                (actualMinutes / intention.targetMinutes) * 100,
            );

            const remainingMinutes = Math.max(
                intention.targetMinutes - actualMinutes,
                0,
            );

            return {
                ...intention,
                actualMinutes,
                progressPercent,
                remainingMinutes,
            };
        });
    }

    async saveIntention(
        input: SaveWeeklyIntentionInput,
    ): Promise<void> {
        if (
            !Number.isSafeInteger(input.targetMinutes) ||
            input.targetMinutes <= 0
        ) {
            throw new Error(
                "Target minutes must be a positive integer.",
            );
        }

        await weeklyIntentionRepository.save(input);
    }

    async deleteIntention(
        category: ActivityCategory,
        weekStart: string,
    ): Promise<void> {
        await weeklyIntentionRepository.delete(
            category,
            weekStart,
        );
    }
}

export const weeklyIntentionService =
    new WeeklyIntentionService();