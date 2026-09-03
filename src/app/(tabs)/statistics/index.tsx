import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Text } from "react-native-paper";

import { activityService } from "../../../services/ActivityService";
import { ActivityStatistics } from "../../../types/activity";
import { StatisticsCard } from "../../../components/StatisticCard";
import { formatDuration } from "../../../utils/formatDuration";

export default function StatisticsScreen() {
  const [statistics, setStatistics] = useState<ActivityStatistics | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadStatistics() {
        try {
          setIsLoading(true);
          setErrorMessage(null);

          const result = await activityService.getActivityStatistics();

          if (isActive) {
            setStatistics(result);
          }
        } catch (error) {
          if (isActive) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "An unexpected error occurred.",
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadStatistics();

      return () => {
        isActive = false;
      };
    }, []),
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (errorMessage || !statistics) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-red-600">
          {errorMessage ?? "Unable to load statistics."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerClassName="gap-4 p-4">
      <StatisticsCard title="Activities" value={statistics.totalActivities} />

      <StatisticsCard
        title="Total duration"
        value={formatDuration(statistics.totalDurationMinutes)}
      />

      <StatisticsCard
        title="Average duration"
        value={formatDuration(statistics.averageDurationMinutes)}
      />

      <StatisticsCard title="Serves" value={statistics.servesCount} />

      <StatisticsCard
        title="Doesn't serve"
        value={statistics.doesNotServeCount}
      />

      <StatisticsCard
        title="Positive ratio"
        value={`${statistics.servesPercentage}%`}
      />
    </ScrollView>
  );
}
