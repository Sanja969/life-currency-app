import { ActivityIndicator, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Section } from "@/components/ui/section";

import { CategoryBreakdown } from "./components/CategoryBreakdown";
import { TodayOverview } from "./components/TodayOverview";
import { LifeField } from "./components/LifeField";
import { TodaySignal } from "./components/TodaySignal";
import { TodayActivitySummary } from "./components/TodayActivitySummary";
import { DailyReflectionCard } from "./components/DailyReflectionCard";

import { useToday } from "./hooks/useToday";

import { COLORS } from "@/theme/colors";

export function Today() {
  const { statistics, isLoading, errorMessage } = useToday();

  // LOADING STATE

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  // ERROR STATE

  if (errorMessage || !statistics) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.background,
          paddingHorizontal: 24,
        }}
      >
        <AppText>{errorMessage ?? "Unable to load data."}</AppText>
      </View>
    );
  }

  // TODAY DASHBOARD

  return (
    <>
      <Section>
        <TodayOverview statistics={statistics} />
      </Section>

      <Section>
        <LifeField statistics={statistics} />
      </Section>

      <Section>
        <CategoryBreakdown categories={statistics.categoryStatistics} />
      </Section>

      <Section>
        <TodaySignal statistics={statistics} />
      </Section>

      <Section>
        <TodayActivitySummary statistics={statistics} />
      </Section>

      {/* DAILY REFLECTION */}

      <Section>
        <DailyReflectionCard />
      </Section>
    </>
  );
}
