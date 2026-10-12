import { ActivityCategory } from "@/types/activity";

import type {
    SaveWeeklyIntentionInput,
    WeeklyIntentionProgress,
} from "@/types/weeklyIntention";

import { activityService } from "@/services/ActivityService";

import { weeklyIntentionRepository } from "@/repositories/WeeklyIntentionRepository";

import {
    getActivityMinutesInRange,
} from "@/features/progress/utils/activityTimeUtils";
import { shiftWeek } from "@/features/plan/utils/weekUtils";

/*
 * DATE HELPERS
 */

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

    return {
        start,
        end,
    };
}

/*
 * WEEKLY INTENTION SERVICE
 */

export class WeeklyIntentionService {
    /*
     * GET WEEKLY PROGRESS
     *
     * Counts only the recorded minutes
     * that fall within the selected week.
     *
     * Activities crossing week boundaries
     * are split proportionally.
     */

    async getWeeklyProgress(
        weekStart: string,
    ): Promise<WeeklyIntentionProgress[]> {
        const intentions =
            await weeklyIntentionRepository.getByWeek(
                weekStart,
            );
        console.log("[SERVICE] requested week:", weekStart);
        console.log("[SERVICE] found intentions:", intentions);
        if (intentions.length === 0) {
            return [];
        }

        const range = getWeekDateRange(
            weekStart,
        );

        /*
         * LOAD OVERLAPPING ACTIVITIES
         *
         * Includes activities that started
         * before the week but continue into it.
         */

        const activities =
            await activityService.getOverlappingActivities(
                range.start,
                range.end,
            );

        /*
         * CALCULATE MINUTES BY CATEGORY
         *
         * All classifications contribute
         * to the category total.
         *
         * Growing, Restoring and Life Leaks
         * are not filtered here.
         */

        const minutesByCategory =
            new Map<ActivityCategory, number>();

        for (const activity of activities) {
            const minutesInWeek =
                getActivityMinutesInRange(
                    activity,
                    range,
                );

            if (minutesInWeek <= 0) {
                continue;
            }

            const previousMinutes =
                minutesByCategory.get(
                    activity.category,
                ) ?? 0;

            minutesByCategory.set(
                activity.category,
                previousMinutes + minutesInWeek,
            );
        }

        /*
         * BUILD INTENTION PROGRESS
         */

        return intentions.map((intention) => {
            const actualMinutes =
                minutesByCategory.get(
                    intention.category,
                ) ?? 0;

            const progressPercent =
                Math.round(
                    (actualMinutes /
                        intention.targetMinutes) *
                    100,
                );

            const remainingMinutes =
                Math.max(
                    intention.targetMinutes -
                    actualMinutes,
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

    /**
 * Returns intentions from the previous calendar week.
 */
    async getPreviousWeekIntentions(
        currentWeekStart: string,
    ): Promise<WeeklyIntentionProgress[]> {
        const previousWeekStart = shiftWeek(
            currentWeekStart,
            -1,
        );

        return this.getWeeklyProgress(previousWeekStart);
    }

    /**
     * Carries selected intentions into the current week.
     *
     * Existing intentions are preserved.
     */
    async carryForwardIntentions(
        currentWeekStart: string,
        categories: ActivityCategory[],
    ): Promise<void> {
        if (categories.length === 0) {
            return;
        }

        const previousWeekStart = shiftWeek(
            currentWeekStart,
            -1,
        );

        await weeklyIntentionRepository.carryForward(
            previousWeekStart,
            currentWeekStart,
            categories,
        );
    }

    /*
     * SAVE INTENTION
     */

    async saveIntention(
        input: SaveWeeklyIntentionInput,
    ): Promise<void> {
        if (
            !Number.isSafeInteger(
                input.targetMinutes,
            ) ||
            input.targetMinutes <= 0
        ) {
            throw new Error(
                "Target minutes must be a positive integer.",
            );
        }

        if (
            input.direction !== "at_least" &&
            input.direction !== "at_most"
        ) {
            throw new Error(
                "Invalid intention direction.",
            );
        }

        await weeklyIntentionRepository.save(
            input,
        );
    }

    /*
     * DELETE INTENTION
     */

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