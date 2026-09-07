import {
    Activity,
    ActivityCategory,
    ActivityClassification,
} from "@/types/activity";

import {
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
    leakMinutes: number;
    totalMinutes: number;
};

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

export function calculateProgressStatistics(
    activities: Activity[],
): ProgressStatistics {
    let growingMinutes = 0;
    let leakMinutes = 0;

    const categoryMap = new Map<
        ActivityCategory,
        {
            totalMinutes: number;
            growingMinutes: number;
            leakMinutes: number;
        }
    >();

    const dailyMap = new Map<
        string,
        DailyProgressStat
    >();

    for (const activity of activities) {
        const duration = activity.durationMinutes;

        const isGrowing =
            activity.classification ===
            ActivityClassification.Serves;

        if (isGrowing) {
            growingMinutes += duration;
        } else {
            leakMinutes += duration;
        }

        const category = categoryMap.get(
            activity.category,
        ) ?? {
            totalMinutes: 0,
            growingMinutes: 0,
            leakMinutes: 0,
        };

        category.totalMinutes += duration;

        if (isGrowing) {
            category.growingMinutes += duration;
        } else {
            category.leakMinutes += duration;
        }

        categoryMap.set(activity.category, category);

        const date = new Date(activity.activityDate);

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
            growingMinutes: 0,
            leakMinutes: 0,
            totalMinutes: 0,
        };

        day.totalMinutes += duration;

        if (isGrowing) {
            day.growingMinutes += duration;
        } else {
            day.leakMinutes += duration;
        }

        dailyMap.set(dayKey, day);
    }

    const totalMinutes = growingMinutes + leakMinutes;

    const growingPercent =
        totalMinutes > 0
            ? Math.round(
                (growingMinutes / totalMinutes) * 100,
            )
            : 0;

    const leakPercent =
        totalMinutes > 0 ? 100 - growingPercent : 0;

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
                (a, b) => b.totalMinutes - a.totalMinutes,
            );

    const dailyStats = Array.from(
        dailyMap.values(),
    ).sort(
        (a, b) =>
            a.date.getTime() - b.date.getTime(),
    );

    const strongestInvestment =
        [...categoryStats]
            .filter((item) => item.growingMinutes > 0)
            .sort(
                (a, b) =>
                    b.growingMinutes - a.growingMinutes,
            )[0] ?? null;

    const biggestLeak =
        [...categoryStats]
            .filter((item) => item.leakMinutes > 0)
            .sort(
                (a, b) => b.leakMinutes - a.leakMinutes,
            )[0] ?? null;

    return {
        totalMinutes,
        growingMinutes,
        leakMinutes,
        growingPercent,
        leakPercent,
        categoryStats,
        dailyStats,
        strongestInvestment,
        biggestLeak,
    };
}

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
                growingMinutes: 0,
                leakMinutes: 0,
                totalMinutes: 0,
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

        if (
            activity.classification ===
            ActivityClassification.Serves
        ) {
            day.growingMinutes += activity.durationMinutes;
        } else {
            day.leakMinutes += activity.durationMinutes;
        }
    }

    return days;
}

export function buildLast30DaysPeriods(
    activities: Activity[],
): PeriodProgressStat[] {
    const today = new Date();

    const rangeStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 29,
    );

    const periods: PeriodProgressStat[] = [];

    for (let index = 0; index < 5; index++) {
        const startDate = new Date(rangeStart);

        startDate.setDate(
            rangeStart.getDate() + index * 7,
        );

        if (startDate > today) {
            break;
        }

        const endDate = new Date(startDate);

        endDate.setDate(startDate.getDate() + 6);

        if (endDate > today) {
            endDate.setTime(today.getTime());
        }

        periods.push({
            label:
                index === 4
                    ? "Now"
                    : `W${index + 1}`,
            startDate,
            endDate,
            growingMinutes: 0,
            leakMinutes: 0,
            totalMinutes: 0,
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

        period.totalMinutes += activity.durationMinutes;

        if (
            activity.classification ===
            ActivityClassification.Serves
        ) {
            period.growingMinutes +=
                activity.durationMinutes;
        } else {
            period.leakMinutes +=
                activity.durationMinutes;
        }
    }

    return periods;
}

export function getPreviousPeriodRange(
    period: ProgressPeriod,
) {
    const currentStart = getPeriodStart(period);

    const previousEnd = new Date(currentStart);

    const days =
        period === "7days" ? 7 : 30;

    const previousStart = new Date(previousEnd);

    previousStart.setDate(
        previousStart.getDate() - days,
    );

    return {
        start: previousStart,
        end: previousEnd,
    };
}

export function calculateProgressComparison(
    current: ProgressStatistics,
    previous: ProgressStatistics,
): ProgressComparison {
    const totalMinutesChangePercent =
        previous.totalMinutes > 0
            ? Math.round(
                ((current.totalMinutes -
                    previous.totalMinutes) /
                    previous.totalMinutes) *
                100,
            )
            : null;

    const growingPercentagePointChange =
        previous.totalMinutes > 0
            ? current.growingPercent -
            previous.growingPercent
            : null;

    const leakPercentagePointChange =
        previous.totalMinutes > 0
            ? current.leakPercent -
            previous.leakPercent
            : null;

    return {
        previousTotalMinutes:
            previous.totalMinutes,

        previousGrowingMinutes:
            previous.growingMinutes,

        previousLeakMinutes:
            previous.leakMinutes,

        previousGrowingPercent:
            previous.growingPercent,

        previousLeakPercent:
            previous.leakPercent,

        totalMinutesChangePercent,

        growingPercentagePointChange,

        leakPercentagePointChange,
    };
}

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
                    (item) => item.category === category,
                );

            const previousCategory =
                previous.categoryStats.find(
                    (item) => item.category === category,
                );

            const currentTotalMinutes =
                currentCategory?.totalMinutes ?? 0;

            const previousTotalMinutes =
                previousCategory?.totalMinutes ?? 0;

            const currentGrowingMinutes =
                currentCategory?.growingMinutes ?? 0;

            const previousGrowingMinutes =
                previousCategory?.growingMinutes ?? 0;

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