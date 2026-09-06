import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityForm } from "../../../components/ActivityForm";
import { activityService } from "../../../services/ActivityService";
import { Activity, ActivityClassification } from "../../../types/activity";
import { ActivityFormOutput } from "../../../validation/activitySchema";

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function EditActivityScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const id = normalizeParam(params.id);

  const [activity, setActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    if (!id) {
      setErrorMessage("Activity id is missing.");
      setIsLoading(false);
      return;
    }

    const numericId = Number(id);

    if (Number.isNaN(numericId)) {
      setErrorMessage("Activity id is invalid.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [activityData, allActivities] = await Promise.all([
        activityService.getActivityById(numericId),
        activityService.getAllActivities(),
      ]);

      setActivity(activityData);
      setActivities(allActivities);
    } catch (error) {
      console.error("Unable to load activity:", error);

      setActivity(null);

      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load activity.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadActivity();
    }, [loadActivity]),
  );

  async function handleSubmit(data: ActivityFormOutput) {
    if (!id) {
      return;
    }

    try {
      await activityService.updateActivity(Number(id), data);

      router.back();
    } catch (error) {
      Alert.alert(
        "Unable to update activity",
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your changes.",
      );

      throw error;
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#02040D]">
        <ImageBackground
          source={require("../../../../assets/add.png")}
          resizeMode="cover"
          style={{
            flex: 1,
          }}
          imageStyle={{
            opacity: 0.48,
          }}
        >
          <View
            pointerEvents="none"
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(2, 4, 13, 0.72)",
            }}
          />

          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#718BFF" />

            <Text className="mt-4 text-[14px] text-[#7483A3]">
              Loading activity...
            </Text>
          </View>
        </ImageBackground>
      </View>
    );
  }

  if (!activity || errorMessage) {
    return (
      <View className="flex-1 bg-[#02040D]">
        <ImageBackground
          source={require("../../../../assets/add.png")}
          resizeMode="cover"
          style={{
            flex: 1,
          }}
          imageStyle={{
            opacity: 0.45,
          }}
        >
          <View
            pointerEvents="none"
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(2, 4, 13, 0.76)",
            }}
          />

          <SafeAreaView
            style={{
              flex: 1,
            }}
            edges={["top", "left", "right"]}
          >
            <View className="px-5 pt-2">
              <Pressable
                onPress={() => router.back()}
                hitSlop={12}
                className="h-11 w-11 items-center justify-center rounded-full border border-[#29395F] bg-[#0B142B]/90"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  transform: [
                    {
                      scale: pressed ? 0.95 : 1,
                    },
                  ],
                })}
              >
                <Ionicons name="chevron-back" size={23} color="#FFFFFF" />
              </Pressable>
            </View>

            <View className="flex-1 items-center justify-center px-8">
              <View className="h-16 w-16 items-center justify-center rounded-full border border-[#E657A8]/30 bg-[#E657A8]/10">
                <Ionicons
                  name="alert-circle-outline"
                  size={30}
                  color="#E657A8"
                />
              </View>

              <Text className="mt-5 text-center text-[20px] font-semibold text-white">
                Activity unavailable
              </Text>

              <Text className="mt-2 text-center text-[14px] leading-6 text-[#7F8CA8]">
                {errorMessage ?? "This activity could not be found."}
              </Text>

              <Pressable
                onPress={() => router.replace("/activities")}
                className="mt-6 rounded-[16px] border border-[#28375D] bg-[#0B1425] px-5 py-3"
              >
                <Text className="text-[14px] font-semibold text-[#C8D1E6]">
                  Back to activities
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  const serves = activity.classification === ActivityClassification.Serves;

  const accentColor = serves ? "#718BFF" : "#E657A8";

  const glowColor = serves
    ? "rgba(91, 110, 255, 0.18)"
    : "rgba(220, 70, 160, 0.18)";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#02040D",
      }}
    >
      <ImageBackground
        source={require("../../../../assets/add.png")}
        resizeMode="cover"
        style={{
          flex: 1,
        }}
        imageStyle={{
          opacity: 0.55,
        }}
      >
        {/* DARK OVERLAY */}

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(2, 4, 13, 0.68)",
          }}
        />

        {/* ACTIVITY ENERGY GLOW */}

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 80,
            right: -120,
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: glowColor,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 300,
            left: -170,
            width: 320,
            height: 320,
            borderRadius: 160,
            backgroundColor: glowColor,
            opacity: 0.45,
          }}
        />

        <SafeAreaView
          style={{
            flex: 1,
          }}
          edges={["top", "left", "right"]}
        >
          {/* HEADER */}

          <View className="flex-row items-center justify-between px-5 pb-1 pt-2">
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              className="h-11 w-11 items-center justify-center rounded-full border border-[#29395F] bg-[#0B142B]/90"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [
                  {
                    scale: pressed ? 0.95 : 1,
                  },
                ],
              })}
            >
              <Ionicons name="chevron-back" size={23} color="#FFFFFF" />
            </Pressable>

            <View className="flex-row items-center">
              <View
                className="mr-2 h-[6px] w-[6px] rounded-full"
                style={{
                  backgroundColor: accentColor,
                  shadowColor: accentColor,
                  shadowOpacity: 1,
                  shadowRadius: 7,
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                }}
              />

              <Text className="text-[11px] font-bold tracking-[1.2px] text-[#7F8BA7]">
                EDIT TRACE
              </Text>
            </View>

            {/* Keeps title centered */}

            <View className="h-11 w-11" />
          </View>

          {/* FORM */}

          <ScrollView
            style={{
              flex: 1,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: 70,
            }}
          >
            <ActivityForm
              mode="edit"
              initialValues={activity}
              activities={activities}
              activityId={activity.id}
              onSubmit={handleSubmit}
            />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
