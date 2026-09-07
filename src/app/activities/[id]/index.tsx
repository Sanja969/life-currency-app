import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { DeleteActivityModal } from "@/features/activities/components/DeleteActivityModal";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { activityService } from "@/services/ActivityService";
import {
  Activity,
  ActivityCategory,
  ActivityClassification,
} from "@/types/activity";

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

const CATEGORY_META: Record<
  ActivityCategory,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  [ActivityCategory.Work]: {
    label: "Work",
    icon: "briefcase-outline",
  },
  [ActivityCategory.Learning]: {
    label: "Learning",
    icon: "book-outline",
  },
  [ActivityCategory.Health]: {
    label: "Health",
    icon: "fitness-outline",
  },
  [ActivityCategory.Relationships]: {
    label: "Relationships",
    icon: "people-outline",
  },
  [ActivityCategory.Rest]: {
    label: "Rest",
    icon: "moon-outline",
  },
  [ActivityCategory.Entertainment]: {
    label: "Entertainment",
    icon: "game-controller-outline",
  },
  [ActivityCategory.Mindfulness]: {
    label: "Mindfulness",
    icon: "leaf-outline",
  },
  [ActivityCategory.Other]: {
    label: "Other",
    icon: "ellipsis-horizontal-outline",
  },
};

export default function ActivityDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const id = normalizeParam(params.id);

  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const loadActivity = useCallback(async () => {
    if (!id) {
      setActivity(null);
      setErrorMessage("Activity id is missing.");
      setIsLoading(false);
      return;
    }

    const numericId = Number(id);

    if (Number.isNaN(numericId)) {
      setActivity(null);
      setErrorMessage("Activity id is invalid.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const foundActivity = await activityService.getActivityById(numericId);

      if (!foundActivity) {
        setActivity(null);
        setErrorMessage("Activity could not be found.");
        return;
      }

      setActivity(foundActivity);
    } catch (error) {
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

  const handleEdit = () => {
    if (!activity) {
      return;
    }

    router.push(`/activities/${activity.id}/edit`);
  };

  const handleDelete = () => {
    if (!activity || isDeleting) {
      return;
    }

    setIsDeleteModalVisible(true);
  };

  const deleteActivity = async () => {
    if (!activity || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);

      await activityService.deleteActivity(activity.id);

      setIsDeleteModalVisible(false);

      router.replace("/activities");
    } catch (error) {
      setIsDeleting(false);

      Alert.alert(
        "Could not delete activity",
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting this activity.",
      );
    }
  };

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
      </View>
    );
  }

  const serves = activity.classification === ActivityClassification.Serves;

  const categoryMeta = CATEGORY_META[activity.category];

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

          <Pressable
            onPress={handleEdit}
            hitSlop={12}
            className="h-11 w-11 items-center justify-center rounded-full border border-[#26365D] bg-[#0A1325]"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              transform: [
                {
                  scale: pressed ? 0.95 : 1,
                },
              ],
            })}
          >
            <Ionicons name="pencil-outline" size={19} color={palette.primary} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 70,
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

          {/* TRACE DETAILS */}

          <Text className="mb-3 mt-7 text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
            TRACE DETAILS
          </Text>

          <View className="overflow-hidden rounded-[22px] border border-[#192744] bg-[#07101F]">
            {/* LIFE AREA */}

            <View className="flex-row items-center px-5 py-4">
              <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-[#101A30]">
                <Ionicons
                  name={categoryMeta.icon}
                  size={20}
                  color={palette.primary}
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-[12px] text-[#71809D]">Life area</Text>

                <Text className="mt-0.5 text-[16px] font-semibold text-[#E4E8F2]">
                  {categoryMeta.label}
                </Text>
              </View>
            </View>

            <View className="ml-[68px] h-[1px] bg-[#17233B]" />
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

          {/* ACTIONS */}

          <Text className="mb-3 mt-7 text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
            MANAGE TRACE
          </Text>

          <Pressable
            onPress={handleEdit}
            className="h-[56px] flex-row items-center justify-center rounded-[18px] border"
            style={({ pressed }) => ({
              borderColor: palette.border,
              backgroundColor: serves
                ? "rgba(72, 92, 199, 0.18)"
                : "rgba(150, 42, 103, 0.18)",

              opacity: pressed ? 0.8 : 1,

              transform: [
                {
                  scale: pressed ? 0.985 : 1,
                },
              ],
            })}
          >
            <Ionicons name="pencil-outline" size={19} color={palette.primary} />

            <Text
              className="ml-2.5 text-[15px] font-semibold"
              style={{
                color: palette.primary,
              }}
            >
              Edit activity
            </Text>
          </Pressable>

          <Pressable
            disabled={isDeleting}
            onPress={handleDelete}
            className="mt-3 h-[54px] flex-row items-center justify-center rounded-[18px] border border-[#772E50]/60 bg-[#351124]/30"
            style={({ pressed }) => ({
              opacity: isDeleting ? 0.5 : pressed ? 0.75 : 1,

              transform: [
                {
                  scale: pressed ? 0.985 : 1,
                },
              ],
            })}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF6AAB" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={19} color="#EF6AAB" />

                <Text className="ml-2.5 text-[15px] font-semibold text-[#EF7DB5]">
                  Delete activity
                </Text>
              </>
            )}
          </Pressable>

          <Text className="mt-3 px-3 text-center text-[11px] leading-[17px] text-[#505D78]">
            Deleting an activity permanently removes this trace from your
            history.
          </Text>
        </ScrollView>
      </SafeAreaView>
      <DeleteActivityModal
        visible={isDeleteModalVisible}
        activityTitle={activity.title}
        isDeleting={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setIsDeleteModalVisible(false);
          }
        }}
        onDelete={() => {
          void deleteActivity();
        }}
      />
    </View>
  );
}
