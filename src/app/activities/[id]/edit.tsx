import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { ActivityForm } from "../../../components/ActivityForm";
import { Activity } from "../../../types/activity";
import { activityService } from "../../../services/ActivityService";
import { ActivityFormOutput } from "../../../validation/activitySchema";

export default function EditActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        const data = await activityService.getActivityById(Number(id));
        setActivity(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadActivity();
  }, [id]);

  async function handleSubmit(data: ActivityFormOutput) {
    await activityService.updateActivity(Number(id), data);

    router.back();
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!activity) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Activity not found.</Text>
      </View>
    );
  }

  return (
    <ActivityForm
      mode="edit"
      initialValues={activity}
      onSubmit={handleSubmit}
    />
  );
}