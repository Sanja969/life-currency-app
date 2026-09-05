import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { activityService } from "@/services/ActivityService";
import { Activity, ActivityClassification } from "@/types/activity";

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function ActivityDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const id = normalizeParam(params.id);

  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    if (!id) {
      setErrorMessage("Activity id is missing.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const activities = await activityService.getAllActivities();

      const foundActivity = activities.find(
        (item) => String(item.id) === String(id),
      );

      if (!foundActivity) {
        setActivity(null);
        setErrorMessage("Activity could not be found.");
        return;
      }

      setActivity(foundActivity);
    } catch (error) {
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

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#030611]">
        <ActivityIndicator size="large" color="#718BFF" />

        <Text className="mt-4 text-[14px] text-[#7483A3]">
          Loading activity...
        </Text>
      </View>
    );
  }

  if (!activity || errorMessage) {
    return (
      <View className="flex-1 bg-[#030611]">
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View className="px-5 pt-2">
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              className="h-11 w-11 items-center justify-center rounded-full border border-[#1D2A48] bg-[#08101F]"
            >
              <Ionicons name="chevron-back" size={23} color="#D6DDF0" />
            </Pressable>
          </View>

          <View className="flex-1 items-center justify-center px-8">
            <View className="h-16 w-16 items-center justify-center rounded-full border border-[#E657A8]/30 bg-[#E657A8]/10">
              <Ionicons name="alert-circle-outline" size={30} color="#E657A8" />
            </View>

            <Text className="mt-5 text-center text-[20px] font-semibold text-white">
              Activity unavailable
            </Text>

            <Text className="mt-2 text-center text-[14px] leading-6 text-[#7F8CA8]">
              {errorMessage ?? "This activity could not be found."}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const serves = activity.classification === ActivityClassification.Serves;

  const palette = serves
    ? {
        primary: "#718BFF",
        light: "#D8DEFF",

        gradientStart: "rgba(36, 53, 133, 0.86)",
        gradientMiddle: "rgba(16, 27, 69, 0.82)",
        gradientEnd: "rgba(6, 12, 29, 0.98)",

        border: "rgba(91, 117, 255, 0.72)",
        glow: "#627AFF",

        label: "GROWING",
        message: "This activity is building your energy.",
      }
    : {
        primary: "#E657A8",
        light: "#FFD0EB",

        gradientStart: "rgba(110, 24, 77, 0.86)",
        gradientMiddle: "rgba(62, 17, 52, 0.82)",
        gradientEnd: "rgba(13, 9, 27, 0.98)",

        border: "rgba(230, 70, 164, 0.7)",
        glow: "#E447A5",

        label: "LIFE LEAK",
        message: "This activity is taking energy from your day.",
      };

  const date = new Date(activity.activityDate);

  const formattedDate = date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View className="flex-1 bg-[#030611]">
      {/* BACKGROUND GLOWS */}

      <View
        pointerEvents="none"
        className="absolute -right-28 top-[-40px] h-[300px] w-[300px] rounded-full"
        style={{
          backgroundColor: palette.glow,
          opacity: 0.08,
        }}
      />

      <View
        pointerEvents="none"
        className="absolute -left-40 top-[340px] h-[320px] w-[320px] rounded-full"
        style={{
          backgroundColor: palette.glow,
          opacity: 0.035,
        }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* HEADER */}

        <View className="flex-row items-center justify-between px-5 pt-2">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="h-11 w-11 items-center justify-center rounded-full border border-[#1D2A48] bg-[#08101F]"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              transform: [
                {
                  scale: pressed ? 0.95 : 1,
                },
              ],
            })}
          >
            <Ionicons name="chevron-back" size={23} color="#D6DDF0" />
          </Pressable>

          <Text className="text-[13px] font-semibold tracking-[0.4px] text-[#7785A5]">
            ACTIVITY TRACE
          </Text>

          <View className="h-11 w-11" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 60,
          }}
        >
          {/* TITLE */}

          <View>
            <View className="mb-3 flex-row items-center">
              <View
                className="mr-2.5 h-[9px] w-[9px] rounded-full"
                style={{
                  backgroundColor: palette.primary,
                  shadowColor: palette.primary,
                  shadowOpacity: 1,
                  shadowRadius: 10,
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                }}
              />

              <Text
                className="text-[11px] font-bold tracking-[1.3px]"
                style={{
                  color: palette.primary,
                }}
              >
                {palette.label}
              </Text>
            </View>

            <Text className="text-[32px] font-bold leading-[38px] tracking-[-1px] text-white">
              {activity.title}
            </Text>

            {activity.description ? (
              <Text className="mt-3 text-[15px] leading-[23px] text-[#8D9AB5]">
                {activity.description}
              </Text>
            ) : null}
          </View>

          {/* ENERGY CORE */}

          <LinearGradient
            colors={[
              palette.gradientStart,
              palette.gradientMiddle,
              palette.gradientEnd,
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={{
              marginTop: 28,
              minHeight: 220,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: palette.border,

              shadowColor: palette.glow,
              shadowOpacity: 0.22,
              shadowRadius: 24,
              shadowOffset: {
                width: 0,
                height: 10,
              },

              overflow: "hidden",
            }}
          >
            {/* ENERGY FIELD */}

            <View
              pointerEvents="none"
              className="absolute -right-[90px] -top-[110px] h-[310px] w-[310px] rounded-full border"
              style={{
                borderColor: serves
                  ? "rgba(113,139,255,0.18)"
                  : "rgba(230,87,168,0.18)",
              }}
            />

            <View
              pointerEvents="none"
              className="absolute -right-[45px] -top-[65px] h-[220px] w-[220px] rounded-full border"
              style={{
                borderColor: serves
                  ? "rgba(113,139,255,0.12)"
                  : "rgba(230,87,168,0.12)",
              }}
            />

            {/* CORE */}

            <View className="flex-1 items-center justify-center px-6 py-7">
              <View
                className="h-[88px] w-[88px] items-center justify-center rounded-full border"
                style={{
                  borderColor: serves
                    ? "rgba(144,161,255,0.32)"
                    : "rgba(240,107,185,0.32)",

                  backgroundColor: serves
                    ? "rgba(113,139,255,0.08)"
                    : "rgba(230,87,168,0.08)",
                }}
              >
                <View
                  className="h-[52px] w-[52px] items-center justify-center rounded-full"
                  style={{
                    backgroundColor: palette.primary,

                    shadowColor: palette.primary,
                    shadowOpacity: 0.9,
                    shadowRadius: 24,
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                  }}
                >
                  <View
                    className="h-[15px] w-[15px] rounded-full"
                    style={{
                      backgroundColor: palette.light,
                    }}
                  />
                </View>
              </View>

              <Text
                className="mt-5 text-[12px] font-bold tracking-[1.2px]"
                style={{
                  color: palette.primary,
                }}
              >
                {palette.label}
              </Text>

              <Text className="mt-2 text-center text-[14px] leading-5 text-[#A6B0C7]">
                {palette.message}
              </Text>
            </View>
          </LinearGradient>

          {/* METRICS */}

          <Text className="mb-3 mt-7 text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
            TRACE DETAILS
          </Text>

          <View className="overflow-hidden rounded-[22px] border border-[#192744] bg-[#07101F]">
            {/* DURATION */}

            <View className="flex-row items-center px-5 py-4">
              <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-[#101A30]">
                <Ionicons
                  name="hourglass-outline"
                  size={20}
                  color={palette.primary}
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-[12px] text-[#71809D]">Duration</Text>

                <Text className="mt-0.5 text-[16px] font-semibold text-[#E4E8F2]">
                  {activity.durationMinutes} minutes
                </Text>
              </View>
            </View>

            <View className="ml-[68px] h-[1px] bg-[#17233B]" />

            {/* DATE */}

            <View className="flex-row items-center px-5 py-4">
              <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-[#101A30]">
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={palette.primary}
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-[12px] text-[#71809D]">Date</Text>

                <Text className="mt-0.5 text-[15px] font-semibold capitalize text-[#E4E8F2]">
                  {formattedDate}
                </Text>
              </View>
            </View>

            <View className="ml-[68px] h-[1px] bg-[#17233B]" />

            {/* TIME */}

            <View className="flex-row items-center px-5 py-4">
              <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-[#101A30]">
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={palette.primary}
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-[12px] text-[#71809D]">Time</Text>

                <Text className="mt-0.5 text-[16px] font-semibold text-[#E4E8F2]">
                  {formattedTime}
                </Text>
              </View>
            </View>
          </View>

          {/* ENERGY INTERPRETATION */}

          <View
            className="mt-5 rounded-[20px] border p-4"
            style={{
              borderColor: serves
                ? "rgba(113,139,255,0.22)"
                : "rgba(230,87,168,0.22)",

              backgroundColor: serves
                ? "rgba(53,72,155,0.10)"
                : "rgba(119,29,80,0.10)",
            }}
          >
            <View className="flex-row items-start">
              <Ionicons
                name={serves ? "trending-up-outline" : "trending-down-outline"}
                size={21}
                color={palette.primary}
              />

              <View className="ml-3 flex-1">
                <Text className="text-[14px] font-semibold text-[#E0E5F1]">
                  {serves ? "Energy gained" : "Energy leaked"}
                </Text>

                <Text className="mt-1 text-[13px] leading-[20px] text-[#7F8DAA]">
                  {serves
                    ? `${activity.durationMinutes} minutes of your day were invested in something you've classified as helping you grow.`
                    : `${activity.durationMinutes} minutes of your day went toward something you've classified as draining your energy.`}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
