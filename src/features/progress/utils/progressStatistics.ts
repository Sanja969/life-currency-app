import {
    Activity,
    ActivityCategory,
    ActivityClassification,
} from "@/types/activity";

import type {
    DailyProgressStat,
    ProgressCategoryStat,
    ProgressCategoryTrend,
    ProgressComparison,
    ProgressPeriod,
    ProgressStatistics,
} from "../hooks/useProgress";

export type PeriodProgressStat = {
    label: string;
    startDate: Date;
    endDate: Date;

    growingMinutes: number;
    restoringMinutes: number;
    leakMinutes: number;

    totalMinutes: number;
};

/*
 * DATE HELPERS
 */

export function getPeriodStart(
    period: ProgressPeriod,
): Date {
    const today = new Date();

    const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    const daysBack = period === "7days" ? 6 : 29;

    start.setDate(start.getDate() - daysBack);

    return start;
}

export function getEndOfToday(): Date {
    const today = new Date();

    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
    );
}

/*
 * CLASSIFICATION HELPERS
 */

type ClassificationMinutes = {
    growingMinutes: number;
    restoringMinutes: number;
    leakMinutes: number;
};

function createEmptyClassificationMinutes(): ClassificationMinutes {
    return {
        growingMinutes: 0,
        restoringMinutes: 0,
        leakMinutes: 0,
    };
}

/**
 * Adds an activity's duration to its classification.
 *
 * Restoring is independent from Growing and Life Leaks.
 */
function addClassificationMinutes(
    target: ClassificationMinutes,
    classification: ActivityClassification,
    duration: number,
): void {
    switch (classification) {
        case ActivityClassification.Serves:
            target.growingMinutes += duration;
            break;

        case ActivityClassification.Restores:
            target.restoringMinutes += duration;
            break;

        case ActivityClassification.DoesNotServe:
            target.leakMinutes += duration;
            break;
    }
}

/*
 * PROGRESS STATISTICS
 */

export function calculateProgressStatistics(
    activities: Activity[],
): ProgressStatistics {
    const totals = createEmptyClassificationMinutes();

    const categoryMap = new Map<
        ActivityCategory,
        ClassificationMinutes & {
            totalMinutes: number;
        }
    >();

    const dailyMap = new Map<
        string,
        DailyProgressStat
    >();

    for (const activity of activities) {
        const duration = activity.durationMinutes;

        // OVERALL CLASSIFICATION TOTALS

        addClassificationMinutes(
            totals,
            activity.classification,
            duration,
        );

        // CATEGORY STATISTICS

        const category = categoryMap.get(
            activity.category,
        ) ?? {
            totalMinutes: 0,
            ...createEmptyClassificationMinutes(),
        };

        category.totalMinutes += duration;

        addClassificationMinutes(
            category,
            activity.classification,
            duration,
        );

        categoryMap.set(activity.category, category);

        // DAILY STATISTICS

        const date = activity.activityDate;

        const dayKey = [
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
        ].join("-");

        const day = dailyMap.get(dayKey) ?? {
            date: new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
            ),
            totalMinutes: 0,
            ...createEmptyClassificationMinutes(),
        };

        day.totalMinutes += duration;

        addClassificationMinutes(
            day,
            activity.classification,
            duration,
        );

        dailyMap.set(dayKey, day);
    }

    // TOTAL TIME

    const {
        growingMinutes,
        restoringMinutes,
        leakMinutes,
    } = totals;

    const totalMinutes =
        growingMinutes +
        restoringMinutes +
        leakMinutes;

    // CLASSIFICATION PERCENTAGES

    const growingPercent =
        totalMinutes > 0
            ? Math.round(
                (growingMinutes / totalMinutes) * 100,
            )
            : 0;

    const restoringPercent =
        totalMinutes > 0
            ? Math.round(
                (restoringMinutes / totalMinutes) * 100,
            )
            : 0;

    const leakPercent =
        totalMinutes > 0
            ? Math.round(
                (leakMinutes / totalMinutes) * 100,
            )
            : 0;

    // CATEGORY BREAKDOWN

    const categoryStats: ProgressCategoryStat[] =
        Array.from(categoryMap.entries())
            .map(([category, stats]) => ({
                category,
                ...stats,
                percentage:
                    totalMinutes > 0
                        ? Math.round(
                            (stats.totalMinutes / totalMinutes) *
                            100,
                        )
                        : 0,
            }))
            .sort(
                (a, b) =>
                    b.totalMinutes - a.totalMinutes,
            );

    // DAILY BREAKDOWN

    const dailyStats = Array.from(
        dailyMap.values(),
    ).sort(
        (a, b) =>
            a.date.getTime() - b.date.getTime(),
    );

    // STRONGEST GROWING CATEGORY

    const strongestInvestment =
        [...categoryStats]
            .filter(
                (item) => item.growingMinutes > 0,
            )
            .sort(
                (a, b) =>
                    b.growingMinutes - a.growingMinutes,
            )[0] ?? null;

    // BIGGEST LIFE LEAK CATEGORY

    const biggestLeak =
        [...categoryStats]
            .filter(
                (item) => item.leakMinutes > 0,
            )
            .sort(
                (a, b) =>
                    b.leakMinutes - a.leakMinutes,
            )[0] ?? null;

    return {
        totalMinutes,

        growingMinutes,
        restoringMinutes,
        leakMinutes,

        growingPercent,
        restoringPercent,
        leakPercent,

        categoryStats,
        dailyStats,

        strongestInvestment,
        biggestLeak,
    };
}

/*
 * LAST 7 DAYS
 */

export function buildLast7DaysStats(
    activities: Activity[],
): DailyProgressStat[] {
    const today = new Date();

    const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 6,
    );

    const days: DailyProgressStat[] = Array.from(
        { length: 7 },
        (_, index) => {
            const date = new Date(start);

            date.setDate(start.getDate() + index);

            return {
                date,
                totalMinutes: 0,
                ...createEmptyClassificationMinutes(),
            };
        },
    );

    for (const activity of activities) {
        const activityDate = new Date(
            activity.activityDate,
        );

        const day = days.find(
            (item) =>
                item.date.getFullYear() ===
                activityDate.getFullYear() &&
                item.date.getMonth() ===
                activityDate.getMonth() &&
                item.date.getDate() ===
                activityDate.getDate(),
        );

        if (!day) continue;

        day.totalMinutes += activity.durationMinutes;

        addClassificationMinutes(
            day,
            activity.classification,
            activity.durationMinutes,
        );
    }

    return days;
}

/*
 * LAST 30 DAYS
 *
 * Five consecutive periods:
 * 7 + 7 + 7 + 7 + 2 days.
 */

export function buildLast30DaysPeriods(
    activities: Activity[],
): PeriodProgressStat[] {
    const today = new Date();

    const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    const rangeStart = new Date(todayStart);

    rangeStart.setDate(
        rangeStart.getDate() - 29,
    );

    const periods: PeriodProgressStat[] = [];

    for (let index = 0; index < 5; index++) {
        const startDate = new Date(rangeStart);

        startDate.setDate(
            startDate.getDate() + index * 7,
        );

        if (startDate > todayStart) {
            break;
        }

        const endDate = new Date(startDate);

        endDate.setDate(
            endDate.getDate() + 6,
        );

        if (endDate > todayStart) {
            endDate.setTime(todayStart.getTime());
        }

        periods.push({
            label:
                index === 4
                    ? "Now"
                    : `W${index + 1}`,

            startDate,
            endDate,

            totalMinutes: 0,
            ...createEmptyClassificationMinutes(),
        });
    }

    for (const activity of activities) {
        const activityDate = new Date(
            activity.activityDate,
        );

        const normalizedDate = new Date(
            activityDate.getFullYear(),
            activityDate.getMonth(),
            activityDate.getDate(),
        );

        const period = periods.find(
            (item) =>
                normalizedDate >= item.startDate &&
                normalizedDate <= item.endDate,
        );

        if (!period) continue;

        period.totalMinutes +=
            activity.durationMinutes;

        addClassificationMinutes(
            period,
            activity.classification,
            activity.durationMinutes,
        );
    }

    return periods;
}

/*
 * PREVIOUS PERIOD RANGE
 */

export function getPreviousPeriodRange(
    period: ProgressPeriod,
) {
    const currentStart = getPeriodStart(period);

    const previousEnd = new Date(
        currentStart,
    );

    const days =
        period === "7days" ? 7 : 30;

    const previousStart = new Date(
        previousEnd,
    );

    previousStart.setDate(
        previousStart.getDate() - days,
    );

    return {
        start: previousStart,
        end: previousEnd,
    };
}

/*
 * PERIOD COMPARISON
 */

export function calculateProgressComparison(
    current: ProgressStatistics,
    previous: ProgressStatistics,
): ProgressComparison {
    const hasPreviousData =
        previous.totalMinutes > 0;

    const totalMinutesChangePercent =
        hasPreviousData
            ? Math.round(
                ((current.totalMinutes -
                    previous.totalMinutes) /
                    previous.totalMinutes) *
                100,
            )
            : null;

    const growingPercentagePointChange =
        hasPreviousData
            ? current.growingPercent -
            previous.growingPercent
            : null;

    const restoringPercentagePointChange =
        hasPreviousData
            ? current.restoringPercent -
            previous.restoringPercent
            : null;

    const leakPercentagePointChange =
        hasPreviousData
            ? current.leakPercent -
            previous.leakPercent
            : null;

    return {
        previousTotalMinutes:
            previous.totalMinutes,

        previousGrowingMinutes:
            previous.growingMinutes,

        previousRestoringMinutes:
            previous.restoringMinutes,

        previousLeakMinutes:
            previous.leakMinutes,

        previousGrowingPercent:
            previous.growingPercent,

        previousRestoringPercent:
            previous.restoringPercent,

        previousLeakPercent:
            previous.leakPercent,

        totalMinutesChangePercent,

        growingPercentagePointChange,
        restoringPercentagePointChange,
        leakPercentagePointChange,
    };
}

/*
 * CATEGORY TRENDS
 */

export function calculateCategoryTrends(
    current: ProgressStatistics,
    previous: ProgressStatistics,
): ProgressCategoryTrend[] {
    const categories = new Set<ActivityCategory>([
        ...current.categoryStats.map(
            (item) => item.category,
        ),
        ...previous.categoryStats.map(
            (item) => item.category,
        ),
    ]);

    return Array.from(categories)
        .map((category) => {
            const currentCategory =
                current.categoryStats.find(
                    (item) =>
                        item.category === category,
                );

            const previousCategory =
                previous.categoryStats.find(
                    (item) =>
                        item.category === category,
                );

            // TOTAL TIME

            const currentTotalMinutes =
                currentCategory?.totalMinutes ?? 0;

            const previousTotalMinutes =
                previousCategory?.totalMinutes ?? 0;

            // GROWING

            const currentGrowingMinutes =
                currentCategory?.growingMinutes ?? 0;

            const previousGrowingMinutes =
                previousCategory?.growingMinutes ?? 0;

            // RESTORING

            const currentRestoringMinutes =
                currentCategory?.restoringMinutes ?? 0;

            const previousRestoringMinutes =
                previousCategory?.restoringMinutes ?? 0;

            // LIFE LEAKS

            const currentLeakMinutes =
                currentCategory?.leakMinutes ?? 0;

            const previousLeakMinutes =
                previousCategory?.leakMinutes ?? 0;

            return {
                category,

                currentTotalMinutes,
                previousTotalMinutes,

                totalMinutesChange:
                    currentTotalMinutes -
                    previousTotalMinutes,

                currentGrowingMinutes,
                previousGrowingMinutes,

                growingMinutesChange:
                    currentGrowingMinutes -
                    previousGrowingMinutes,

                currentRestoringMinutes,
                previousRestoringMinutes,

                restoringMinutesChange:
                    currentRestoringMinutes -
                    previousRestoringMinutes,

                currentLeakMinutes,
                previousLeakMinutes,

                leakMinutesChange:
                    currentLeakMinutes -
                    previousLeakMinutes,
            };
        })
        .filter(
            (item) =>
                item.currentTotalMinutes > 0 ||
                item.previousTotalMinutes > 0,
        )
        .sort(
            (a, b) =>
                Math.abs(b.totalMinutesChange) -
                Math.abs(a.totalMinutesChange),
        );
}