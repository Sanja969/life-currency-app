import { ActivityIndicator, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Section } from "@/components/ui/section";
import { CategoryBreakdown } from "./components/CategoryBreakdown";

import { TodayOverview } from "./components/TodayOverview";
import { LifeField } from "./components/LifeField";
import { TodaySignal } from "./components/TodaySignal";
import { TodayActivitySummary } from "./components/TodayActivitySummary";

import { useToday } from "./hooks/useToday";

export function Today() {
  const { statistics, isLoading, errorMessage } = useToday();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#718BFF" />
      </View>
    );
  }

  if (errorMessage || !statistics) {
    return (
      <View className="flex-1 items-center justify-center">
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
