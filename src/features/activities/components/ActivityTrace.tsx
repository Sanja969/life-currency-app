import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { memo, useEffect } from "react";
import { Text, View } from "react-native";

import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";
import { Activity } from "@/types/activity";

import { ActivityParticle } from "./ActivityParticle";
import { formatDateHeading, normalizeDate } from "../utils/activityDate";

type ActivityTraceProps = {
  activity: Activity;
  showDate: boolean;
  isArriving: boolean;
};

export function ActivityTraceComponent({
  activity,
  showDate,
  isArriving,
}: ActivityTraceProps) {
  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);

  // CENTRALIZED CLASSIFICATION THEME

  const theme = CLASSIFICATION_THEME[activity.classification];

  const date = normalizeDate(activity.activityDate);

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // CARD ARRIVAL ANIMATION

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
  }, [isArriving, cardScale, cardGlow]);

  return (
    <View>
      {/* DATE HEADING */}

      {showDate ? (
        <View className="mb-3 mt-5 flex-row items-center">
          <Text
            className="text-[10px] font-bold uppercase tracking-[1.8px]"
            style={{ color: COLORS.muted }}
          >
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

      {/* ACTIVITY CARD */}

      <Animated.View style={cardArrivalStyle}>
        <CosmicPanel
          variant="subtle"
          accent={theme.color}
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
              backgroundColor: theme.color,
              shadowColor: theme.color,
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
              backgroundColor: theme.coreLight,
              opacity: 0.45,
            }}
          />

          {/* CONTENT */}

          <View className="min-h-[92px] flex-row items-center px-4">
            {/* ACTIVITY PARTICLE */}

            <View className="mr-2.5">
              <ActivityParticle
                color={theme.color}
                coreLight={theme.coreLight}
                ringStrong={theme.ringStrong}
                ringSoft={theme.ringSoft}
                arriving={isArriving}
              />
            </View>

            {/* ACTIVITY INFO */}

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
                    color: theme.color,
                  }}
                >
                  {theme.shortLabel}
                </Text>

                <View className="mx-2 h-[3px] w-[3px] rounded-full bg-[#7A8399]" />

                <Text className="text-[12px] text-[#9AA5BC]">
                  {activity.durationMinutes} min
                </Text>
              </View>
            </View>

            {/* ACTIVITY TIME */}

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
