import { useMemo } from "react";

import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { ProgressHeader } from "@/features/progress/components/ProgressHeader";
import { LifeFlow } from "@/features/progress/components/LifeFlow";
import { IntentionAlignment } from "@/features/progress/components/IntentionAlignment";
import { ProgressEvolution } from "@/features/progress/components/ProgressEvolution";
import { ProgressEmptyState } from "@/features/progress/components/ProgressEmptyState";

import { useProgress } from "@/features/progress/hooks/useProgress";

import { buildMonthlyPeriods } from "@/features/progress/utils/progressStatistics";
import { getWeekStart } from "@/features/plan/utils/weekUtils";

import { COLORS } from "@/theme/colors";
import { MonthlyPattern } from "@/features/progress/components/MonthlyPattern";
import { WeeklyFlames } from "@/features/progress/components/WeeklyFlames";

export default function ProgressScreen() {
  const {
    period,
    setPeriod,
    currentRange,
    statistics,
    comparison,
    categoryTrends,
    isLoading,
    errorMessage,
  } = useProgress();

  /*
   * PERIOD TYPE
   */

  const isWeeklyPeriod = period === "thisWeek" || period === "lastWeek";

  const isMonthlyPeriod = period === "thisMonth" || period === "lastMonth";

  const isCurrentWeek = period === "thisWeek";

  /*
   * WEEK START
   *
   * Used to load intentions for
   * the selected calendar week.
   */

  const weekStart = useMemo(
    () => (isWeeklyPeriod ? getWeekStart(currentRange.start) : null),
    [isWeeklyPeriod, currentRange.start],
  );

  /*
   * MONTHLY PATTERN
   *
   * Group days into calendar weeks
   * within the selected month.
   *
   * Example:
   *
   * October 2026:
   * Oct 1–4
   * Oct 5–11
   * Oct 12–18
   * Oct 19–25
   * Oct 26–31
   */

  const monthlyPeriods = useMemo(
    () =>
      isMonthlyPeriod
        ? buildMonthlyPeriods(statistics.dailyStats, currentRange.start)
        : [],
    [isMonthlyPeriod, statistics.dailyStats, currentRange.start],
  );

  /*
   * ACTIVITY STATE
   */

  const hasRecordedActivities = statistics.totalMinutes > 0;

  /*
   * LOADING
   */

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.gold} />

        <Text
          className="mt-5 text-[11px] font-semibold tracking-[3px]"
          style={{
            color: COLORS.muted,
          }}
        >
          ANALYZING YOUR TIME
        </Text>
      </View>
    );
  }

  /*
   * ERROR
   */

  if (errorMessage) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{
          backgroundColor: COLORS.background,
        }}
      >
        <Text
          className="text-center text-[14px] leading-6"
          style={{
            color: COLORS.leak,
          }}
        >
          {errorMessage}
        </Text>
      </View>
    );
  }

  /*
   * SCREEN
   */

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: COLORS.background,
      }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 130,
          }}
        >
          {/* HEADER */}

          <ProgressHeader period={period} onPeriodChange={setPeriod} />

          {/* LIFE FLOW */}

          {hasRecordedActivities && (
            <LifeFlow statistics={statistics} period={period} />
          )}

          {/* WEEKLY INTENTIONS */}

          {isWeeklyPeriod && weekStart && (
            <IntentionAlignment
              key={weekStart}
              weekStart={weekStart}
              isCurrentWeek={isCurrentWeek}
            />
          )}

          {/* EMPTY STATE OR ANALYTICS */}

          {!hasRecordedActivities ? (
            <ProgressEmptyState />
          ) : (
            <>
              {/* TIME PATTERN */}

              {isWeeklyPeriod ? (
                <WeeklyFlames
                  days={statistics.dailyStats}
                  period={period === "lastWeek" ? "lastWeek" : "thisWeek"}
                />
              ) : (
                <MonthlyPattern
                  periods={monthlyPeriods}
                  period={period === "lastMonth" ? "lastMonth" : "thisMonth"}
                />
              )}

              {/* EVOLUTION */}

              <ProgressEvolution
                statistics={statistics}
                comparison={comparison}
                trends={categoryTrends}
                period={period}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
