import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { ActivityStatistics } from "@/types/activity";
import { formatDuration } from "../utils/formatDuration";

type TodayActivitySummaryProps = {
  statistics: ActivityStatistics;
};

export function TodayActivitySummary({
  statistics,
}: TodayActivitySummaryProps) {
  const leakPercent =
    statistics.totalDurationMinutes > 0 ? 100 - statistics.servesPercentage : 0;

  return (
    <View className="mt-6">
      {/* HEADER */}

      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
          TODAY'S ACTIVITIES
        </Text>

        <Pressable
          onPress={() => router.push("/activities")}
          hitSlop={10}
          className="flex-row items-center"
        >
          <Text className="text-[13px] font-semibold text-[#718BFF]">
            View all
          </Text>

          <Ionicons name="chevron-forward" size={16} color="#718BFF" />
        </Pressable>
      </View>

      {/* GROWING */}

      <Pressable
        onPress={() => router.push("/activities")}
        className="mb-3 overflow-hidden rounded-[20px] border border-[#1D3158] bg-[#07111F]"
        style={({ pressed }) => ({
          opacity: pressed ? 0.78 : 1,
          transform: [
            {
              scale: pressed ? 0.985 : 1,
            },
          ],
        })}
      >
        {/* LEFT ACCENT */}

        <View className="absolute bottom-0 left-0 top-0 w-[4px] bg-[#718BFF]" />

        <View className="flex-row items-center px-4 py-4">
          {/* ICON */}

          <View
            className="h-[48px] w-[48px] items-center justify-center rounded-[16px]"
            style={{
              backgroundColor: "rgba(113,139,255,0.16)",
            }}
          >
            <Ionicons name="leaf-outline" size={23} color="#8295FF" />
          </View>

          {/* TEXT */}

          <View className="ml-4 flex-1">
            <Text className="text-[16px] font-semibold text-[#E6EAFF]">
              Growing
            </Text>

            <Text className="mt-1 text-[12px] text-[#7583A1]">
              {statistics.servesCount}{" "}
              {statistics.servesCount === 1 ? "activity" : "activities"}
            </Text>
          </View>

          {/* VALUE */}

          <View className="items-end">
            <Text className="text-[18px] font-semibold text-[#E3E7FF]">
              {formatDuration(statistics.servesDurationMinutes)}
            </Text>

            <Text className="mt-1 text-[12px] text-[#8295FF]">
              {statistics.servesPercentage}%
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#526586"
            style={{ marginLeft: 8 }}
          />
        </View>
      </Pressable>

      {/* LIFE LEAKS */}

      <Pressable
        onPress={() => router.push("/activities")}
        className="overflow-hidden rounded-[20px] border border-[#40203B] bg-[#0B0D1C]"
        style={({ pressed }) => ({
          opacity: pressed ? 0.78 : 1,
          transform: [
            {
              scale: pressed ? 0.985 : 1,
            },
          ],
        })}
      >
        {/* LEFT ACCENT */}

        <View className="absolute bottom-0 left-0 top-0 w-[4px] bg-[#E657A8]" />

        <View className="flex-row items-center px-4 py-4">
          {/* ICON */}

          <View
            className="h-[48px] w-[48px] items-center justify-center rounded-[16px]"
            style={{
              backgroundColor: "rgba(230,87,168,0.14)",
            }}
          >
            <Ionicons name="flame-outline" size={23} color="#E969B2" />
          </View>

          {/* TEXT */}

          <View className="ml-4 flex-1">
            <Text className="text-[16px] font-semibold text-[#F5DCEB]">
              Life Leaks
            </Text>

            <Text className="mt-1 text-[12px] text-[#7583A1]">
              {statistics.doesNotServeCount}{" "}
              {statistics.doesNotServeCount === 1 ? "activity" : "activities"}
            </Text>
          </View>

          {/* VALUE */}

          <View className="items-end">
            <Text className="text-[18px] font-semibold text-[#FFE1F1]">
              {formatDuration(statistics.doesNotServeDurationMinutes)}
            </Text>

            <Text className="mt-1 text-[12px] text-[#E969B2]">
              {leakPercent}%
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#66445C"
            style={{ marginLeft: 8 }}
          />
        </View>
      </Pressable>
    </View>
  );
}
