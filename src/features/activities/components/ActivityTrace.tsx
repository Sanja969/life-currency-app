import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Activity, ActivityClassification } from "@/types/activity";

import { ActivityParticle } from "./ActivityParticle";
import { formatDateHeading, normalizeDate } from "../utils/activityDate";

type ActivityTraceProps = {
  activity: Activity;
  showDate: boolean;
  isArriving: boolean;
};

export function ActivityTrace({
  activity,
  showDate,
  isArriving,
}: ActivityTraceProps) {
  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);

  const serves = activity.classification === ActivityClassification.Serves;

  const palette = serves
    ? {
        core: "#718BFF",
        coreLight: "#D8DEFF",

        gradientStart: "rgba(37, 54, 135, 0.72)",
        gradientMiddle: "rgba(18, 30, 75, 0.72)",
        gradientEnd: "rgba(8, 15, 34, 0.92)",

        border: "rgba(91, 117, 255, 0.78)",

        glow: "#627AFF",

        ringStrong: "rgba(115, 139, 255, 0.55)",
        ringSoft: "rgba(115, 139, 255, 0.22)",

        label: "#7890FF",

        fieldLine: "rgba(103, 126, 255, 0.20)",
      }
    : {
        core: "#E657A8",
        coreLight: "#FFD0EB",

        gradientStart: "rgba(112, 25, 78, 0.72)",
        gradientMiddle: "rgba(68, 19, 57, 0.68)",
        gradientEnd: "rgba(13, 11, 29, 0.94)",

        border: "rgba(230, 70, 164, 0.72)",

        glow: "#E447A5",

        ringStrong: "rgba(235, 87, 177, 0.52)",
        ringSoft: "rgba(235, 87, 177, 0.20)",

        label: "#F06BB9",

        fieldLine: "rgba(230, 79, 170, 0.18)",
      };

  const date = normalizeDate(activity.activityDate);

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const cardArrivalStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: cardScale.value,
      },
    ],
    opacity: interpolate(cardGlow.value, [0, 1], [1, 1]),
  }));

  useEffect(() => {
    if (!isArriving) {
      return;
    }

    cardScale.value = 1;

    cardScale.value = withDelay(
      650,
      withSequence(
        withTiming(1.035, {
          duration: 180,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(1, {
          duration: 280,
          easing: Easing.out(Easing.cubic),
        }),
      ),
    );

    cardGlow.value = withDelay(
      600,
      withSequence(
        withTiming(1, {
          duration: 180,
        }),
        withTiming(0, {
          duration: 500,
        }),
      ),
    );
  }, [isArriving]);

  return (
    <View>
      {showDate ? (
        <View className="mb-2 mt-3.5 flex-row items-center">
          <Text className="text-[11px] font-bold uppercase tracking-[1.6px] text-[#7A87A3]">
            {formatDateHeading(date)}
          </Text>

          <View className="ml-4 h-[1px] flex-1 bg-[#303A55]/70" />
        </View>
      ) : null}

      <Animated.View style={cardArrivalStyle}>
        <Pressable
          onPress={() => router.push(`/activities/${activity.id}`)}
          className="mb-2 overflow-hidden rounded-[20px]"
          style={({ pressed }) => ({
            transform: [
              {
                scale: pressed ? 0.985 : 1,
              },
            ],
            shadowColor: palette.glow,
            shadowOpacity: pressed ? 0.42 : 0.2,
            shadowRadius: pressed ? 22 : 14,
            shadowOffset: {
              width: 0,
              height: 6,
            },
            elevation: 7,
          })}
        >
          <LinearGradient
            colors={[
              palette.gradientStart,
              palette.gradientMiddle,
              palette.gradientEnd,
            ]}
            start={{
              x: 0,
              y: 0.5,
            }}
            end={{
              x: 1,
              y: 0.5,
            }}
            style={{
              minHeight: 92,
              borderRadius: 20,
              borderWidth: 1.1,
              borderColor: palette.border,
              overflow: "hidden",
            }}
          >
            {/* LEFT ENERGY GLOW */}

            <View
              pointerEvents="none"
              className="absolute -left-14 -top-16 h-[180px] w-[180px] rounded-full"
              style={{
                backgroundColor: palette.glow,
                opacity: 0.065,
              }}
            />

            {/* LARGE SUBTLE FIELD ARC */}

            <View
              pointerEvents="none"
              className="absolute -bottom-[120px] left-[125px] h-[205px] w-[325px] rounded-[180px] border"
              style={{
                borderColor: palette.fieldLine,
                transform: [
                  {
                    rotate: "-8deg",
                  },
                ],
              }}
            />

            <View
              pointerEvents="none"
              className="absolute -bottom-[142px] left-[140px] h-[215px] w-[350px] rounded-[190px] border"
              style={{
                borderColor: serves
                  ? "rgba(103,126,255,0.08)"
                  : "rgba(230,79,170,0.08)",
                transform: [
                  {
                    rotate: "-8deg",
                  },
                ],
              }}
            />

            {/* TINY FIELD PARTICLE */}

            <View
              pointerEvents="none"
              className="absolute bottom-[25px] right-[95px] h-[4px] w-[4px] rounded-full"
              style={{
                backgroundColor: palette.core,
                shadowColor: palette.core,
                shadowOpacity: 1,
                shadowRadius: 7,
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
              }}
            />

            {/* SECOND TINY PARTICLE */}

            <View
              pointerEvents="none"
              className="absolute right-[165px] top-[24px] h-[2px] w-[2px] rounded-full"
              style={{
                backgroundColor: palette.coreLight,
                opacity: 0.45,
              }}
            />

            {/* CONTENT */}

            <View className="min-h-[92px] flex-row items-center px-4">
              <View className="mr-2.5">
                <ActivityParticle
                  color={palette.core}
                  coreLight={palette.coreLight}
                  ringStrong={palette.ringStrong}
                  ringSoft={palette.ringSoft}
                  arriving={isArriving}
                />
              </View>

              {/* INFO */}

              <View className="flex-1 pr-2.5">
                <Text
                  numberOfLines={1}
                  className="text-[16px] font-semibold text-white"
                >
                  {activity.title}
                </Text>

                <View className="mt-1.5 flex-row items-center">
                  <Text
                    className="text-[11px] font-bold tracking-[0.5px]"
                    style={{
                      color: palette.label,
                    }}
                  >
                    {serves ? "GROWING" : "LIFE LEAK"}
                  </Text>

                  <View className="mx-2 h-[3px] w-[3px] rounded-full bg-[#7A8399]" />

                  <Text className="text-[12px] text-[#9AA5BC]">
                    {activity.durationMinutes} min
                  </Text>
                </View>
              </View>

              {/* TIME */}

              <View className="flex-row items-center">
                <Text className="mr-2.5 text-[13px] font-semibold text-[#D2D8E8]">
                  {time}
                </Text>

                <Ionicons name="chevron-forward" size={17} color="#8A96B1" />
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}
