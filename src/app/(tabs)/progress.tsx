import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProgressBalance } from "@/features/progress/components/ProgressBalance";
import { ProgressHeader } from "@/features/progress/components/ProgressHeader";
import { useProgress } from "@/features/progress/hooks/useProgress";
import { WeeklyPattern } from "@/features/progress/components/WeeklyPattern";
import { LifeAreaBreakdown } from "@/features/progress/components/LifeAreaBreakdown";
import { ProgressInsights } from "@/features/progress/components/ProgressInsights";
import { useMemo } from "react";
import { ThirtyDayPattern } from "@/features/progress/components/ThirtyDayPattern";
import { buildLast30DaysPeriods } from "@/features/progress/utils/progressStatistics";
import { ProgressComparisonCard } from "@/features/progress/components/ProgressComparisonCard";
import { NotableShifts } from "@/features/progress/components/NotableShifts";

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
      <View className="flex-1 items-center justify-center bg-[#030611]">
        <ActivityIndicator size="large" color="#718BFF" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="flex-1 items-center justify-center bg-[#030611] px-6">
        <Text className="text-center text-[#E657A8]">{errorMessage}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#030611]">
      {/* BACKGROUND FIELD */}

      <View
        pointerEvents="none"
        className="absolute -right-32 top-[-70px] h-[320px] w-[320px] rounded-full bg-[#536DFF]"
        style={{
          opacity: 0.055,
        }}
      />

      <View
        pointerEvents="none"
        className="absolute -left-40 top-[390px] h-[330px] w-[330px] rounded-full bg-[#E657A8]"
        style={{
          opacity: 0.025,
        }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 18,

            // tab bar + bottom safe area
            paddingBottom: 130,
          }}
        >
          <ProgressHeader period={period} onPeriodChange={setPeriod} />

          <ProgressBalance statistics={statistics} period={period} />
          <ProgressComparisonCard comparison={comparison} period={period} />
          {period === "7days" ? (
            <WeeklyPattern days={statistics.dailyStats} />
          ) : (
            <ThirtyDayPattern periods={thirtyDayPeriods} />
          )}
          <LifeAreaBreakdown categories={statistics.categoryStats} />
          <NotableShifts trends={categoryTrends} period={period} />
          <ProgressInsights
            strongestInvestment={statistics.strongestInvestment}
            biggestLeak={statistics.biggestLeak}
            period={period}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
