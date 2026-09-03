import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Button, Text } from "react-native-paper";
import { format } from "date-fns";

import { activityService } from "../../../services/ActivityService";
import { Activity } from "../../../types/activity";
import { formatDuration } from "../../../utils/formatDuration";

export default function ActivityDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadActivity() {
        try {
          setIsLoading(true);
          setErrorMessage(null);

          const activityId = Number(id);

          if (!Number.isInteger(activityId)) {
            throw new Error("Invalid activity id.");
          }

          const result = await activityService.getActivityById(activityId);

          if (!result) {
            throw new Error("Activity not found.");
          }

          if (isActive) {
            setActivity(result);
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

      void loadActivity();

      return () => {
        isActive = false;
      };
    }, [id]),
  );

  function handleDelete() {
    if (!activity || isDeleting) {
      return;
    }

    Alert.alert(
      "Delete activity",
      `Are you sure you want to delete "${activity.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);

              await activityService.deleteActivity(activity.id);

              router.back();
            } catch (error) {
              Alert.alert(
                "Delete failed",
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred.",
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (errorMessage || !activity) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-red-600">
          {errorMessage ?? "Activity not found."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerClassName="gap-4 p-6">
      <Text variant="headlineMedium">{activity.title}</Text>

      <View className="gap-2">
        <Text variant="titleSmall">Duration</Text>
        <Text variant="bodyLarge">{formatDuration(activity.durationMinutes)}</Text>
      </View>

      <View className="gap-2">
        <Text variant="titleSmall">Classification</Text>
        <Text variant="bodyLarge">{activity.classification}</Text>
      </View>

      <View className="gap-2">
        <Text variant="titleSmall">Date</Text>
        <Text variant="bodyLarge">
          {format(activity.activityDate, "dd.MM.yyyy HH:mm")}
        </Text>
      </View>

      {activity.description && (
        <View className="gap-2">
          <Text variant="titleSmall">Description</Text>
          <Text variant="bodyLarge">{activity.description}</Text>
        </View>
      )}

      <View className="mt-4 gap-3">
        <Button
          mode="contained"
          icon="pencil"
          onPress={() => router.navigate(`/activities/${activity.id}/edit`)}
        >
          Edit
        </Button>

        <Button
          mode="outlined"
          loading={isDeleting}
          disabled={isDeleting}
          icon="delete"
          textColor="#b91c1c"
          onPress={handleDelete}
        >
          Delete
        </Button>
      </View>
    </ScrollView>
  );
}
