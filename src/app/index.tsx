import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { activityService } from "../services/ActivityService";
import { Activity } from "../types/activity";
import { format } from "date-fns";

export default function HomeScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadActivities() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const result = await activityService.getAllActivities();

        setActivities(result);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.";

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadActivities();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center gap-2">
        <ActivityIndicator size="large" />
        <Text className="text-base text-slate-600">
          Loading activities...
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-base text-red-600">
          {errorMessage}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <FlatList
        data={activities}
        keyExtractor={(activity) => activity.id.toString()}
        contentContainerClassName="pb-4"
        renderItem={({ item }) => (
          <View className="mb-3 rounded-lg border border-slate-300 p-4">
            <Text className="mb-2 text-lg font-semibold">
              {item.title}
            </Text>

            <Text className="text-slate-700">
              Duration: {item.durationMinutes} minutes
            </Text>

            <Text className="text-slate-700">
              Classification: {item.classification}
            </Text>

            <Text className="text-slate-700">
              Date: {format(item.activityDate, "dd.MM.yyyy")}
            </Text>

            {item.description ? (
              <Text className="mt-2 text-slate-700">
                Description: {item.description}
              </Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-10">
            <Text className="text-slate-500">
              No activities yet.
            </Text>
          </View>
        }
      />
    </View>
  );
}