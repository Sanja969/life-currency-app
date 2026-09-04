import { useEffect, useState } from "react";

import { Alert, ScrollView, View } from "react-native";

import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { ActivityForm } from "../../components/ActivityForm";
import { activityService } from "../../services/ActivityService";

import { Activity, ActivityInput } from "../../types/activity";

export default function CreateActivityScreen() {
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    async function loadActivities() {
      try {
        const data = await activityService.getAllActivities();

        setActivities(data);
      } catch (error) {
        console.error("Unable to load activities:", error);
      }
    }

    loadActivities();
  }, []);

  async function handleCreate(data: ActivityInput) {
    try {
      await activityService.createActivity(data);

      router.back();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Activity overlaps")
      ) {
        throw error;
      }

      Alert.alert(
        "Unable to create activity",
        error instanceof Error ? error.message : "Something went wrong.",
      );

      throw error;
    }
  }

  return (
    <View className="flex-1 bg-[#030611]">
      {/* Background gradient */}
      <LinearGradient
        colors={["#030611", "#060B1D", "#081329", "#050816"]}
        locations={[0, 0.35, 0.72, 1]}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />

      {/* Blue cosmic glow */}
      <View
        pointerEvents="none"
        className="absolute -right-24 top-8 h-64 w-64 rounded-full bg-blue-600/10"
      />

      {/* Violet glow */}
      <View
        pointerEvents="none"
        className="absolute -left-32 top-[360px] h-72 w-72 rounded-full bg-violet-600/10"
      />

      {/* Very subtle magenta glow */}
      <View
        pointerEvents="none"
        className="absolute -right-32 bottom-10 h-64 w-64 rounded-full bg-fuchsia-600/5"
      />

      {/* Small stars */}
      <View className="absolute left-[12%] top-[8%] h-1 w-1 rounded-full bg-white/70" />
      <View className="absolute right-[16%] top-[15%] h-0.5 w-0.5 rounded-full bg-white/70" />
      <View className="absolute left-[8%] top-[35%] h-0.5 w-0.5 rounded-full bg-blue-200/80" />
      <View className="absolute right-[10%] top-[48%] h-1 w-1 rounded-full bg-white/50" />
      <View className="absolute left-[18%] top-[68%] h-0.5 w-0.5 rounded-full bg-violet-200/80" />
      <View className="absolute right-[22%] top-[82%] h-0.5 w-0.5 rounded-full bg-white/60" />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: 60,
        }}
      >
        <ActivityForm
          mode="create"
          activities={activities}
          onSubmit={handleCreate}
        />
      </ScrollView>
    </View>
  );
}
