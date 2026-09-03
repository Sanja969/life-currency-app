import { ActivityIndicator, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Section } from "@/components/ui/section";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import { ActivityClassification } from "@/types/activity";
import { TodayHero } from "./components/TodayHero";
import { BalanceCard } from "./components/BalanceCard";
import { useToday } from "./hooks/useToday";

export function Today() {
  const { activities, statistics, isLoading, errorMessage } = useToday();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
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

  const growingActivities = activities.filter(
    (activity) => activity.classification === ActivityClassification.Serves,
  );

  const lifeLeakActivities = activities.filter(
    (activity) =>
      activity.classification === ActivityClassification.DoesNotServe,
  );

  return (
    <>
      <Section>
        <TodayHero investedMinutes={statistics.servesDurationMinutes} />
        <Section.Header>
          <AppText variant="headline">Life Balance</AppText>
        </Section.Header>

        <Section.Content>
          <BalanceCard statistics={statistics} />
        </Section.Content>
      </Section>

      <Section>
        <Section.Header>
          <AppText variant="headline">Growing</AppText>
        </Section.Header>

        <Section.Content>
          {growingActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </Section.Content>
      </Section>

      <Section>
        <Section.Header>
          <AppText variant="headline">Life Leaks</AppText>
        </Section.Header>

        <Section.Content>
          {lifeLeakActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </Section.Content>
      </Section>
    </>
  );
}
