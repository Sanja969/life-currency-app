import { ActivityIndicator, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Section } from "@/components/ui/section";
import { CategoryBreakdown } from "./components/CategoryBreakdown";

import { TodayOverview } from "./components/TodayOverview";
import { LifeField } from "./components/LifeField";
import { TodaySignal } from "./components/TodaySignal";
import { TodayActivitySummary } from "./components/TodayActivitySummary";

import { useToday } from "./hooks/useToday";

const COLORS = {
  background: "#080A10",
  gold: "#D6AD65",
};

export function Today() {
  const { statistics, isLoading, errorMessage } = useToday();

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
    </>
  );
}