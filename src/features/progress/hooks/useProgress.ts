import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import { activityService } from "@/services/ActivityService";
import {
    Activity,
    ActivityCategory,
} from "@/types/activity";

import {
    buildLast7DaysStats,
    calculateCategoryTrends,
    calculateProgressComparison,
    calculateProgressStatistics,
    getEndOfToday,
    getPeriodStart,
    getPreviousPeriodRange,
} from "../utils/progressStatistics";

export type ProgressPeriod = "7days" | "30days";

export type ProgressCategoryStat = {
    category: ActivityCategory;
    totalMinutes: number;
    growingMinutes: number;
    leakMinutes: number;
    percentage: number;
};

export type DailyProgressStat = {
    date: Date;
    growingMinutes: number;
    leakMinutes: number;
    totalMinutes: number;
};

export type ProgressStatistics = {
    totalMinutes: number;
    growingMinutes: number;
    leakMinutes: number;

    growingPercent: number;
    leakPercent: number;

    categoryStats: ProgressCategoryStat[];
    dailyStats: DailyProgressStat[];

    strongestInvestment: ProgressCategoryStat | null;
    biggestLeak: ProgressCategoryStat | null;
};

export type ProgressComparison = {
    previousTotalMinutes: number;
    previousGrowingMinutes: number;
    previousLeakMinutes: number;

    previousGrowingPercent: number;
    previousLeakPercent: number;

    totalMinutesChangePercent: number | null;
    growingPercentagePointChange: number | null;
    leakPercentagePointChange: number | null;
};

export type ProgressCategoryTrend = {
    category: ActivityCategory;

    currentTotalMinutes: number;
    previousTotalMinutes: number;
    totalMinutesChange: number;

    currentGrowingMinutes: number;
    previousGrowingMinutes: number;
    growingMinutesChange: number;

    currentLeakMinutes: number;
    previousLeakMinutes: number;
    leakMinutesChange: number;
};

export function useProgress() {
    const [period, setPeriod] =
        useState<ProgressPeriod>("7days");

    const [activities, setActivities] =
        useState<Activity[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            async function load() {
                try {
                    setIsLoading(true);
                    setErrorMessage(null);

                    const result =
                        await activityService.getAllActivities();

                    if (active) {
                        setActivities(result);
                    }
                } catch (error) {
                    if (!active) return;

                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "Unable to load progress.",
                    );
                } finally {
                    if (active) {
                        setIsLoading(false);
                    }
                }
            }

            void load();

            return () => {
                active = false;
            };
        }, []),
    );

    const periodActivities = useMemo(() => {
        const start = getPeriodStart(period);
        const end = getEndOfToday();

        return activities.filter((activity) => {
            const date = new Date(activity.activityDate);

            return date >= start && date < end;
        });
    }, [activities, period]);

    const statistics = useMemo(() => {
        const result =
            calculateProgressStatistics(
                periodActivities,
            );

        if (period === "7days") {
            return {
                ...result,
                dailyStats:
                    buildLast7DaysStats(periodActivities),
            };
        }

        return result;
    }, [periodActivities, period]);

    const previousPeriodActivities = useMemo(() => {
        const { start, end } =
            getPreviousPeriodRange(period);

        return activities.filter((activity) => {
            const date = new Date(activity.activityDate);

            return date >= start && date < end;
        });
    }, [activities, period]);

    const previousStatistics = useMemo(
        () =>
            calculateProgressStatistics(
                previousPeriodActivities,
            ),
        [previousPeriodActivities],
    );

    const comparison = useMemo(
        () =>
            calculateProgressComparison(
                statistics,
                previousStatistics,
            ),
        [statistics, previousStatistics],
    );

    const categoryTrends = useMemo(
        () =>
            calculateCategoryTrends(
                statistics,
                previousStatistics,
            ),
        [statistics, previousStatistics],
    );

    return {
        period,
        setPeriod,

        activities: periodActivities,
        statistics,
        comparison,
        categoryTrends,

        isLoading,
        errorMessage,
    };
}