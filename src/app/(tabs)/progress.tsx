import { useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProgressBalance } from "@/features/progress/components/ProgressBalance";
import { ProgressHeader } from "@/features/progress/components/ProgressHeader";
import { useProgress } from "@/features/progress/hooks/useProgress";
import { WeeklyPattern } from "@/features/progress/components/WeeklyPattern";
import { LifeAreaBreakdown } from "@/features/progress/components/LifeAreaBreakdown";
import { ProgressInsights } from "@/features/progress/components/ProgressInsights";
import { ThirtyDayPattern } from "@/features/progress/components/ThirtyDayPattern";
import { buildLast30DaysPeriods } from "@/features/progress/utils/progressStatistics";
import { ProgressComparisonCard } from "@/features/progress/components/ProgressComparisonCard";
import { NotableShifts } from "@/features/progress/components/NotableShifts";
import { ProgressEmptyState } from "@/features/progress/components/ProgressEmptyState";

const COLORS = {
  background: "#080A10",
  surface: "#11141D",
  gold: "#D6AD65",
  growing: "#8274E8",
  leaks: "#D88455",
  text: "#F5F0E8",
  muted: "#9295A3",
};

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

  const thirtyDayPeriods = useMemo(
    () => (period === "30days" ? buildLast30DaysPeriods(activities) : []),
    [activities, period],
  );

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: COLORS.background }}
      >
        <ActivityIndicator size="large" color={COLORS.gold} />

        <Text
          className="mt-5 text-[11px] font-semibold tracking-[3px]"
          style={{ color: COLORS.muted }}
        >
          ANALYZING YOUR TIME
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: COLORS.background }}
      >
        <Text
          className="text-center text-[14px] leading-6"
          style={{ color: COLORS.leaks }}
        >
          {errorMessage}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#080A10]">
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
          <ProgressHeader period={period} onPeriodChange={setPeriod} />

          {statistics.totalMinutes === 0 ? (
            <ProgressEmptyState />
          ) : (
            <>
              <ProgressBalance statistics={statistics} period={period} />

              <ProgressComparisonCard comparison={comparison} period={period} />

              {period === "7days" ? (
                <WeeklyPattern days={statistics.dailyStats} />
              ) : (
                <ThirtyDayPattern periods={thirtyDayPeriods} />
              )}

              <LifeAreaBreakdown categories={statistics.categoryStats} />

              {comparison.previousTotalMinutes > 0 && (
                <NotableShifts trends={categoryTrends} period={period} />
              )}

              <ProgressInsights
                strongestInvestment={statistics.strongestInvestment}
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
