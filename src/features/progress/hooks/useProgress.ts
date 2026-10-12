import {
    useCallback,
    useMemo,
    useRef,
    useState,
  } from "react";
  
  import { useFocusEffect } from "expo-router";
  
  import { activityService } from "@/services/ActivityService";
  
  import {
    Activity,
    ActivityCategory,
  } from "@/types/activity";
  
  import {
    buildWeeklyStats,
    calculateCategoryTrends,
    calculateProgressComparison,
    calculateProgressStatistics,
    getPeriodRange,
    getPreviousPeriodRange,
  } from "../utils/progressStatistics";
  
  import {
    clipActivitiesToRange,
  } from "../utils/activityTimeUtils";
  
  /*
   * TYPES
   */
  
  export type ProgressPeriod =
    | "thisWeek"
    | "lastWeek"
    | "thisMonth"
    | "lastMonth";
  
  export type ProgressCategoryStat = {
    category: ActivityCategory;
  
    totalMinutes: number;
  
    growingMinutes: number;
    restoringMinutes: number;
    leakMinutes: number;
  
    percentage: number;
  };
  
  export type DailyProgressStat = {
    date: Date;
  
    growingMinutes: number;
    restoringMinutes: number;
    leakMinutes: number;
  
    totalMinutes: number;
  };
  
  export type ProgressStatistics = {
    totalMinutes: number;
  
    growingMinutes: number;
    restoringMinutes: number;
    leakMinutes: number;
  
    growingPercent: number;
    restoringPercent: number;
    leakPercent: number;
  
    categoryStats: ProgressCategoryStat[];
    dailyStats: DailyProgressStat[];
  
    strongestInvestment: ProgressCategoryStat | null;
    biggestLeak: ProgressCategoryStat | null;
  };
  
  export type ProgressComparison = {
    previousTotalMinutes: number;
  
    previousGrowingMinutes: number;
    previousRestoringMinutes: number;
    previousLeakMinutes: number;
  
    previousGrowingPercent: number;
    previousRestoringPercent: number;
    previousLeakPercent: number;
  
    totalMinutesChangePercent: number | null;
  
    growingPercentagePointChange: number | null;
    restoringPercentagePointChange: number | null;
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
  
    currentRestoringMinutes: number;
    previousRestoringMinutes: number;
    restoringMinutesChange: number;
  
    currentLeakMinutes: number;
    previousLeakMinutes: number;
    leakMinutesChange: number;
  };
  
  /*
   * HOOK
   */
  
  export function useProgress() {
    /*
     * SELECTED PERIOD
     */
  
    const [period, setPeriod] =
      useState<ProgressPeriod>("thisWeek");
  
    /*
     * ACTIVITIES
     */
  
    const [activities, setActivities] =
      useState<Activity[]>([]);
  
    /*
     * LOADING STATE
     */
  
    const [isLoading, setIsLoading] =
      useState(true);
  
    const [errorMessage, setErrorMessage] =
      useState<string | null>(null);
  
    /*
     * Avoid full-screen loading on every focus.
     */
  
    const hasLoadedRef = useRef(false);
  
    /*
     * REFERENCE DATE
     *
     * All period calculations use the same
     * reference date.
     */
  
    const [referenceDate, setReferenceDate] =
      useState(() => new Date());
  
    /*
     * DATE RANGES
     */
  
    const currentRange = useMemo(
      () =>
        getPeriodRange(
          period,
          referenceDate,
        ),
      [period, referenceDate],
    );
  
    const previousRange = useMemo(
      () =>
        getPreviousPeriodRange(
          period,
          referenceDate,
        ),
      [period, referenceDate],
    );
  
    /*
     * LOAD ACTIVITIES
     *
     * Load enough historical data to support:
     *
     * - This Week
     * - Last Week
     * - This Month
     * - Last Month
     *
     * Including their comparison periods.
     *
     * Data is reloaded whenever Progress
     * receives focus.
     */
  
    useFocusEffect(
      useCallback(() => {
        let active = true;
  
        async function load() {
          try {
            if (!hasLoadedRef.current) {
              setIsLoading(true);
            }
  
            setErrorMessage(null);
  
            const now = new Date();
  
            /*
             * Determine the earliest required
             * start date.
             */
  
            const periods: ProgressPeriod[] = [
              "thisWeek",
              "lastWeek",
              "thisMonth",
              "lastMonth",
            ];
  
            const ranges = periods.flatMap(
              (selectedPeriod) => [
                getPeriodRange(
                  selectedPeriod,
                  now,
                ),
  
                getPreviousPeriodRange(
                  selectedPeriod,
                  now,
                ),
              ],
            );
  
            const earliestStart = new Date(
              Math.min(
                ...ranges.map(
                  (range) =>
                    range.start.getTime(),
                ),
              ),
            );
  
            /*
             * One-day buffer for activities
             * crossing the start boundary.
             */
  
            const queryStart = new Date(
              earliestStart,
            );
  
            queryStart.setDate(
              queryStart.getDate() - 1,
            );
  
            /*
             * Query up to the current moment.
             */
  
            const result =
              await activityService.getOverlappingActivities(
                queryStart,
                now,
              );
  
            if (!active) {
              return;
            }
  
            setActivities(result);
  
            setReferenceDate(now);
  
            hasLoadedRef.current = true;
          } catch (error) {
            if (!active) {
              return;
            }
  
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
  
    /*
     * CURRENT PERIOD ACTIVITIES
     */
  
    const periodActivities = useMemo(
      () =>
        clipActivitiesToRange(
          activities,
          currentRange,
        ),
      [activities, currentRange],
    );
  
    /*
     * CURRENT PERIOD STATISTICS
     */
  
    const statistics = useMemo(() => {
      const result =
        calculateProgressStatistics(
          periodActivities,
        );
  
      /*
       * Weekly periods always contain
       * Monday through Sunday.
       */
  
      if (
        period === "thisWeek" ||
        period === "lastWeek"
      ) {
        return {
          ...result,
  
          dailyStats: buildWeeklyStats(
            result.dailyStats,
            currentRange.start,
          ),
        };
      }
  
      return result;
    }, [
      periodActivities,
      period,
      currentRange,
    ]);
  
    /*
     * PREVIOUS PERIOD ACTIVITIES
     */
  
    const previousPeriodActivities = useMemo(
      () =>
        clipActivitiesToRange(
          activities,
          previousRange,
        ),
      [activities, previousRange],
    );
  
    /*
     * PREVIOUS PERIOD STATISTICS
     */
  
    const previousStatistics = useMemo(
      () =>
        calculateProgressStatistics(
          previousPeriodActivities,
        ),
      [previousPeriodActivities],
    );
  
    /*
     * PERIOD COMPARISON
     */
  
    const comparison = useMemo(
      () =>
        calculateProgressComparison(
          statistics,
          previousStatistics,
        ),
      [
        statistics,
        previousStatistics,
      ],
    );
  
    /*
     * CATEGORY TRENDS
     */
  
    const categoryTrends = useMemo(
      () =>
        calculateCategoryTrends(
          statistics,
          previousStatistics,
        ),
      [
        statistics,
        previousStatistics,
      ],
    );
  
    /*
     * RETURN
     */
  
    return {
      period,
      setPeriod,
  
      currentRange,
  
      activities: periodActivities,
  
      statistics,
      comparison,
      categoryTrends,
  
      isLoading,
      errorMessage,
    };
  }