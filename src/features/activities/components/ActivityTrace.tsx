import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { memo, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { CosmicPanel } from "@/components/ui/CosmicPanel";

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

const GROWING_PALETTE = {
  core: "#8274E8",
  coreLight: "#E4DEFF",

  gradientStart: "#1C192D",
  gradientMiddle: "#14131F",
  gradientEnd: "#101117",

  border: "rgba(130,116,232,0.45)",
  glow: "#8274E8",

  ringStrong: "rgba(130,116,232,0.45)",
  ringSoft: "rgba(130,116,232,0.16)",

  label: "#A99CF5",
  fieldLine: "rgba(130,116,232,0.12)",
};

const RESTORING_PALETTE = {
  core: "#58C7B5",
  coreLight: "#E0FFF8",

  gradientStart: "#142B2A",
  gradientMiddle: "#121F20",
  gradientEnd: "#101719",

  border: "rgba(88,199,181,0.45)",
  glow: "#58C7B5",

  ringStrong: "rgba(88,199,181,0.45)",
  ringSoft: "rgba(88,199,181,0.16)",

  label: "#80DECF",
  fieldLine: "rgba(88,199,181,0.12)",
};

const LEAK_PALETTE = {
  core: "#D88455",
  coreLight: "#FFE0CA",

  gradientStart: "#291B18",
  gradientMiddle: "#1C1515",
  gradientEnd: "#111114",

  border: "rgba(216,132,85,0.45)",
  glow: "#D88455",

  ringStrong: "rgba(216,132,85,0.45)",
  ringSoft: "rgba(216,132,85,0.16)",

  label: "#E7A47C",
  fieldLine: "rgba(216,132,85,0.12)",
};

const CLASSIFICATION_META = {
  [ActivityClassification.Serves]: {
    palette: GROWING_PALETTE,
    label: "GROWING",
  },

  [ActivityClassification.Restores]: {
    palette: RESTORING_PALETTE,
    label: "RESTORING",
  },

  [ActivityClassification.DoesNotServe]: {
    palette: LEAK_PALETTE,
    label: "LIFE LEAK",
  },
};

export function ActivityTraceComponent({
  activity,
  showDate,
  isArriving,
}: ActivityTraceProps) {
  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);

  const classificationMeta = CLASSIFICATION_META[activity.classification];

  const palette = classificationMeta.palette;

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
        <View className="mb-3 mt-5 flex-row items-center">
          <Text className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#9295A5]">
            {formatDateHeading(date)}
          </Text>

          <View
            className="ml-4 h-[1px] flex-1"
            style={{
              backgroundColor: "rgba(214,173,101,0.18)",
            }}
          />
        </View>
      ) : null}

      <Animated.View style={cardArrivalStyle}>
        <CosmicPanel
          variant="subtle"
          accent={palette.core}
          onPress={() => router.push(`/activities/${activity.id}`)}
          style={{ marginBottom: 8 }}
          contentStyle={{
            minHeight: 84,
            height: 84,
            paddingHorizontal: 16,
            justifyContent: "center",
          }}
        >
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
                  {classificationMeta.label}
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
        </CosmicPanel>
      </Animated.View>
    </View>
  );
}

export const ActivityTrace = memo(ActivityTraceComponent);
