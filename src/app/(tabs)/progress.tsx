import { useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProgressBalance } from "@/features/progress/components/ProgressBalance";
import { ProgressHeader } from "@/features/progress/components/ProgressHeader";
import { WeeklyPattern } from "@/features/progress/components/WeeklyPattern";
import { LifeAreaBreakdown } from "@/features/progress/components/LifeAreaBreakdown";
import { ProgressInsights } from "@/features/progress/components/ProgressInsights";
import { ThirtyDayPattern } from "@/features/progress/components/ThirtyDayPattern";
import { ProgressComparisonCard } from "@/features/progress/components/ProgressComparisonCard";
import { NotableShifts } from "@/features/progress/components/NotableShifts";
import { ProgressEmptyState } from "@/features/progress/components/ProgressEmptyState";

import { useProgress } from "@/features/progress/hooks/useProgress";

import { buildLast30DaysPeriods } from "@/features/progress/utils/progressStatistics";

import { COLORS } from "@/theme/colors";

export default function ProgressScreen() {
  const {
    period,
    setPeriod,
    activities,
    statistics,
    comparison,
    categoryTrends,
    isLoading,
    errorMessage,
  } = useProgress();

  /*
   * Build 30-day chart data only when
   * the 30-day period is selected.
   */

  const thirtyDayPeriods = useMemo(
    () => (period === "30days" ? buildLast30DaysPeriods(activities) : []),
    [activities, period],
  );

  /*
   * LOADING STATE
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
   * ERROR STATE
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
            color: COLORS.danger,
          }}
        >
          {errorMessage}
        </Text>
      </View>
    );
  }

  /*
   * PROGRESS DASHBOARD
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
          {/* PERIOD SELECTOR */}

          <ProgressHeader period={period} onPeriodChange={setPeriod} />

          {/* EMPTY STATE */}

          {statistics.totalMinutes === 0 ? (
            <ProgressEmptyState />
          ) : (
            <>
              {/* OVERALL BALANCE */}

              <ProgressBalance statistics={statistics} period={period} />

              {/* PERIOD COMPARISON */}

              <ProgressComparisonCard comparison={comparison} period={period} />

              {/* TIME DISTRIBUTION */}

              {period === "7days" ? (
                <WeeklyPattern days={statistics.dailyStats} />
              ) : (
                <ThirtyDayPattern periods={thirtyDayPeriods} />
              )}

              {/* LIFE AREAS */}

              <LifeAreaBreakdown categories={statistics.categoryStats} />

              {/* NOTABLE SHIFTS */}

              {comparison.previousTotalMinutes > 0 && (
                <NotableShifts trends={categoryTrends} period={period} />
              )}

              {/* INSIGHTS */}

              <ProgressInsights
                strongestInvestment={statistics.strongestInvestment}
                strongestRestoration={
                  [...statistics.categoryStats]

                    .filter((category) => category.restoringMinutes > 0)

                    .sort(
                      (a, b) => b.restoringMinutes - a.restoringMinutes,
                    )[0] ?? null
                }
                biggestLeak={statistics.biggestLeak}
                period={period}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
