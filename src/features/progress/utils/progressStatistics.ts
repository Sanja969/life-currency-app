import {
    Activity,
    ActivityCategory,
    ActivityClassification,
  } from "@/types/activity";
  
  import { getWeekStart } from "@/features/plan/utils/weekUtils";
  
  import type {
    DailyProgressStat,
    ProgressCategoryStat,
    ProgressCategoryTrend,
    ProgressComparison,
    ProgressPeriod,
    ProgressStatistics,
  } from "../hooks/useProgress";
  
  import { splitActivityByDay } from "./splitActivityByDay";
  
  /*
   * TYPES
   */
  
  export type DateRange = {
    start: Date;
    end: Date;
  };
  
  export type PeriodProgressStat = {
    label: string;
  
    startDate: Date;
    endDate: Date;
  
    growingMinutes: number;
    restoringMinutes: number;
    leakMinutes: number;
  
    totalMinutes: number;
  };
  
  type ClassificationMinutes = {
    growingMinutes: number;
    restoringMinutes: number;
    leakMinutes: number;
  };
  
  /*
   * DATE HELPERS
   */
  
  function getStartOfDay(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
  }
  
  function addDays(date: Date, days: number): Date {
    const result = new Date(date);
  
    result.setDate(result.getDate() + days);
  
    return result;
  }
  
  function parseLocalDate(value: string): Date {
    const [year, month, day] = value.split("-").map(Number);
  
    return new Date(year, month - 1, day);
  }
  
  function getDayKey(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }
  
  function getMonthStart(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1,
    );
  }
  
  function addMonthsToMonthStart(
    monthStart: Date,
    months: number,
  ): Date {
    return new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + months,
      1,
    );
  }
  
  /*
   * Equivalent elapsed portion of a previous month.
   *
   * Example:
   * October 12, 10:30 -> September 12, 10:30
   *
   * If the target month is shorter, clamp to
   * its final day.
   *
   * Example:
   * March 31 -> February 28 (or 29).
   */
  
  function getEquivalentPreviousMonthEnd(
    now: Date,
  ): Date {
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
  
    const lastDayOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
    ).getDate();
  
    const targetDay = Math.min(
      now.getDate(),
      lastDayOfPreviousMonth,
    );
  
    return new Date(
      previousMonthStart.getFullYear(),
      previousMonthStart.getMonth(),
      targetDay,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds(),
    );
  }
  
  /*
   * PERIOD RANGES
   *
   * All ranges use [start, end).
   *
   * Start is included.
   * End is excluded.
   */
  
  export function getPeriodRange(
    period: ProgressPeriod,
    now: Date = new Date(),
  ): DateRange {
    const currentWeekStart = parseLocalDate(
      getWeekStart(now),
    );
  
    const currentMonthStart = getMonthStart(now);
  
    switch (period) {
      case "thisWeek":
        return {
          start: currentWeekStart,
          end: now,
        };
  
      case "lastWeek":
        return {
          start: addDays(currentWeekStart, -7),
          end: currentWeekStart,
        };
  
      case "thisMonth":
        return {
          start: currentMonthStart,
          end: now,
        };
  
      case "lastMonth":
        return {
          start: addMonthsToMonthStart(
            currentMonthStart,
            -1,
          ),
          end: currentMonthStart,
        };
    }
  }
  
  /*
   * PREVIOUS PERIOD RANGE
   */
  
  export function getPreviousPeriodRange(
    period: ProgressPeriod,
    now: Date = new Date(),
  ): DateRange {
    const currentRange = getPeriodRange(
      period,
      now,
    );
  
    switch (period) {
      case "thisWeek":
        return {
          start: addDays(currentRange.start, -7),
          end: addDays(currentRange.end, -7),
        };
  
      case "lastWeek":
        return {
          start: addDays(currentRange.start, -7),
          end: currentRange.start,
        };
  
      case "thisMonth":
        return {
          start: addMonthsToMonthStart(
            currentRange.start,
            -1,
          ),
          end: getEquivalentPreviousMonthEnd(now),
        };
  
      case "lastMonth":
        return {
          start: addMonthsToMonthStart(
            currentRange.start,
            -1,
          ),
          end: currentRange.start,
        };
    }
  }
  
  /*
   * CLASSIFICATION HELPERS
   */
  
  function createEmptyClassificationMinutes(): ClassificationMinutes {
    return {
      growingMinutes: 0,
      restoringMinutes: 0,
      leakMinutes: 0,
    };
  }
  
  function addClassificationMinutes(
    target: ClassificationMinutes,
    classification: ActivityClassification,
    durationMinutes: number,
  ): void {
    switch (classification) {
      case ActivityClassification.Serves:
        target.growingMinutes += durationMinutes;
        break;
  
      case ActivityClassification.Restores:
        target.restoringMinutes += durationMinutes;
        break;
  
      case ActivityClassification.DoesNotServe:
        target.leakMinutes += durationMinutes;
        break;
    }
  }
  
  /*
   * PERCENTAGE HELPERS
   */
  
  function calculatePercentage(
    minutes: number,
    totalMinutes: number,
  ): number {
    if (totalMinutes <= 0) {
      return 0;
    }
  
    return Math.round(
      (minutes / totalMinutes) * 100,
    );
  }
  
  function calculateExactShare(
    minutes: number,
    totalMinutes: number,
  ): number {
    if (totalMinutes <= 0) {
      return 0;
    }
  
    return (minutes / totalMinutes) * 100;
  }
  
  /*
   * PROGRESS STATISTICS
   *
   * Activities must already be clipped
   * to the requested reporting period.
   *
   * Activities crossing midnight are split
   * into calendar-day segments.
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
  
    /*
     * PROCESS ACTIVITIES
     */
  
    for (const activity of activities) {
      const duration = activity.durationMinutes;
  
      if (duration <= 0) {
        continue;
      }
  
      /*
       * OVERALL CLASSIFICATION TOTALS
       */
  
      addClassificationMinutes(
        totals,
        activity.classification,
        duration,
      );
  
      /*
       * CATEGORY STATISTICS
       */
  
      const category =
        categoryMap.get(activity.category) ?? {
          totalMinutes: 0,
          ...createEmptyClassificationMinutes(),
        };
  
      category.totalMinutes += duration;
  
      addClassificationMinutes(
        category,
        activity.classification,
        duration,
      );
  
      categoryMap.set(
        activity.category,
        category,
      );
  
      /*
       * DAILY STATISTICS
       */
  
      const segments = splitActivityByDay(activity);
  
      for (const segment of segments) {
        const dayKey = getDayKey(segment.date);
  
        const day =
          dailyMap.get(dayKey) ?? {
            date: getStartOfDay(segment.date),
  
            totalMinutes: 0,
  
            ...createEmptyClassificationMinutes(),
          };
  
        day.totalMinutes += segment.durationMinutes;
  
        addClassificationMinutes(
          day,
          activity.classification,
          segment.durationMinutes,
        );
  
        dailyMap.set(dayKey, day);
      }
    }
  
    /*
     * TOTAL TIME
     */
  
    const {
      growingMinutes,
      restoringMinutes,
      leakMinutes,
    } = totals;
  
    const totalMinutes =
      growingMinutes +
      restoringMinutes +
      leakMinutes;
  
    /*
     * CLASSIFICATION PERCENTAGES
     */
  
    const growingPercent = calculatePercentage(
      growingMinutes,
      totalMinutes,
    );
  
    const restoringPercent = calculatePercentage(
      restoringMinutes,
      totalMinutes,
    );
  
    const leakPercent = calculatePercentage(
      leakMinutes,
      totalMinutes,
    );
  
    /*
     * CATEGORY BREAKDOWN
     */
  
    const categoryStats: ProgressCategoryStat[] =
      Array.from(categoryMap.entries())
        .map(([category, stats]) => ({
          category,
  
          ...stats,
  
          percentage: calculatePercentage(
            stats.totalMinutes,
            totalMinutes,
          ),
        }))
        .sort(
          (a, b) =>
            b.totalMinutes - a.totalMinutes,
        );
  
    /*
     * DAILY BREAKDOWN
     */
  
    const dailyStats = Array.from(
      dailyMap.values(),
    ).sort(
      (a, b) =>
        a.date.getTime() - b.date.getTime(),
    );
  
    /*
     * STRONGEST GROWING CATEGORY
     */
  
    const strongestInvestment =
      [...categoryStats]
        .filter(
          (item) =>
            item.growingMinutes > 0,
        )
        .sort(
          (a, b) =>
            b.growingMinutes - a.growingMinutes,
        )[0] ?? null;
  
    /*
     * BIGGEST LIFE LEAK CATEGORY
     */
  
    const biggestLeak =
      [...categoryStats]
        .filter(
          (item) =>
            item.leakMinutes > 0,
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
   * WEEKLY STATS
   *
   * Returns Monday through Sunday.
   *
   * Missing days are filled with zero minutes.
   */
  
  export function buildWeeklyStats(
    dailyStats: DailyProgressStat[],
    weekStart: Date,
  ): DailyProgressStat[] {
    const dailyMap = new Map(
      dailyStats.map((day) => [
        getDayKey(day.date),
        day,
      ]),
    );
  
    const start = getStartOfDay(weekStart);
  
    return Array.from(
      { length: 7 },
      (_, index) => {
        const date = addDays(start, index);
  
        const existing = dailyMap.get(
          getDayKey(date),
        );
  
        return (
          existing ?? {
            date,
  
            totalMinutes: 0,
  
            ...createEmptyClassificationMinutes(),
          }
        );
      },
    );
  }
  
  /*
   * MONTHLY STATS
   *
   * Groups calendar days into calendar weeks.
   *
   * Each group contains only days that belong
   * to the selected month.
   *
   * Examples for October 2026:
   *
   * Oct 1–4
   * Oct 5–11
   * Oct 12–18
   * Oct 19–25
   * Oct 26–31
   *
   * The returned endDate is inclusive and is
   * intended for display and grouping.
   */
  
  export function buildMonthlyPeriods(
    dailyStats: DailyProgressStat[],
    monthStart: Date,
  ): PeriodProgressStat[] {
    const start = getMonthStart(monthStart);
  
    const nextMonthStart = addMonthsToMonthStart(
      start,
      1,
    );
  
    const periods: PeriodProgressStat[] = [];
  
    let cursor = new Date(start);
  
    while (cursor < nextMonthStart) {
      const startDate = new Date(cursor);
  
      /*
       * JavaScript:
       * Sunday = 0
       * Monday = 1
       *
       * Days until Sunday:
       * Sunday -> 0
       * Monday -> 6
       */
  
      const daysUntilSunday =
        (7 - cursor.getDay()) % 7;
  
      const calendarWeekEnd = addDays(
        cursor,
        daysUntilSunday,
      );
  
      const lastDayOfMonth = addDays(
        nextMonthStart,
        -1,
      );
  
      const endDate =
        calendarWeekEnd < lastDayOfMonth
          ? calendarWeekEnd
          : lastDayOfMonth;
  
      periods.push({
        label: `W${periods.length + 1}`,
  
        startDate,
        endDate,
  
        totalMinutes: 0,
  
        ...createEmptyClassificationMinutes(),
      });
  
      cursor = addDays(endDate, 1);
    }
  
    /*
     * DISTRIBUTE DAILY STATISTICS
     */
  
    for (const day of dailyStats) {
      const dayDate = getStartOfDay(day.date);
  
      const period = periods.find(
        (item) =>
          dayDate >= item.startDate &&
          dayDate <= item.endDate,
      );
  
      if (!period) {
        continue;
      }
  
      period.totalMinutes += day.totalMinutes;
  
      period.growingMinutes += day.growingMinutes;
  
      period.restoringMinutes += day.restoringMinutes;
  
      period.leakMinutes += day.leakMinutes;
    }
  
    return periods;
  }
  
  /*
   * PERIOD COMPARISON
   *
   * Percentage-point changes are calculated
   * from original minute totals.
   */
  
  export function calculateProgressComparison(
    current: ProgressStatistics,
    previous: ProgressStatistics,
  ): ProgressComparison {
    const hasPreviousData =
      previous.totalMinutes > 0;
  
    const hasCurrentData =
      current.totalMinutes > 0;
  
    /*
     * TOTAL RECORDED TIME CHANGE
     */
  
    const totalMinutesChangePercent =
      hasPreviousData
        ? Math.round(
            (
              (current.totalMinutes -
                previous.totalMinutes) /
              previous.totalMinutes
            ) * 100,
          )
        : null;
  
    /*
     * PERCENTAGE POINT CHANGES
     */
  
    const canCompareShares =
      hasPreviousData &&
      hasCurrentData;
  
    const growingPercentagePointChange =
      canCompareShares
        ? Math.round(
            calculateExactShare(
              current.growingMinutes,
              current.totalMinutes,
            ) -
            calculateExactShare(
              previous.growingMinutes,
              previous.totalMinutes,
            ),
          )
        : null;
  
    const restoringPercentagePointChange =
      canCompareShares
        ? Math.round(
            calculateExactShare(
              current.restoringMinutes,
              current.totalMinutes,
            ) -
            calculateExactShare(
              previous.restoringMinutes,
              previous.totalMinutes,
            ),
          )
        : null;
  
    const leakPercentagePointChange =
      canCompareShares
        ? Math.round(
            calculateExactShare(
              current.leakMinutes,
              current.totalMinutes,
            ) -
            calculateExactShare(
              previous.leakMinutes,
              previous.totalMinutes,
            ),
          )
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
    const categories =
      new Set<ActivityCategory>([
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
  
        /*
         * TOTAL TIME
         */
  
        const currentTotalMinutes =
          currentCategory?.totalMinutes ?? 0;
  
        const previousTotalMinutes =
          previousCategory?.totalMinutes ?? 0;
  
        /*
         * GROWING
         */
  
        const currentGrowingMinutes =
          currentCategory?.growingMinutes ?? 0;
  
        const previousGrowingMinutes =
          previousCategory?.growingMinutes ?? 0;
  
        /*
         * RESTORING
         */
  
        const currentRestoringMinutes =
          currentCategory?.restoringMinutes ?? 0;
  
        const previousRestoringMinutes =
          previousCategory?.restoringMinutes ?? 0;
  
        /*
         * LIFE LEAKS
         */
  
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
          Math.abs(
            b.totalMinutesChange,
          ) -
          Math.abs(
            a.totalMinutesChange,
          ),
      );
  }