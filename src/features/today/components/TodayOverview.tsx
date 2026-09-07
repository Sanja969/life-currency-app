import { Pressable, Text, View } from "react-native";

import { ActivityStatistics } from "@/types/activity";
import { formatDuration } from "../utils/formatDuration";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type TodayOverviewProps = {
  statistics: ActivityStatistics;
};

export function TodayOverview({ statistics }: TodayOverviewProps) {
  const growingPercent = statistics.servesPercentage;
  const leakPercent =
    statistics.totalDurationMinutes > 0 ? 100 - growingPercent : 0;

  const today = new Date();

  const formattedDate = today
    .toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  const hasTrackedTime = statistics.totalDurationMinutes > 0;

  return (
    <View>
      {/* DATE */}

      <Text className="text-[11px] font-bold tracking-[1.6px] text-[#64718D]">
        TODAY · {formattedDate}
      </Text>

      {/* HERO */}

      <Text className="mt-3 text-[34px] font-bold leading-[40px] tracking-[-1px] text-white">
        Your life, today
      </Text>

      <Text className="mt-2 text-[14px] leading-[21px] text-[#7F8CA8]">
        See where your time is becoming energy — and where it is leaking away.
      </Text>
      <Pressable
        onPress={() => router.push("/activities/new")}
        className="mt-5 self-start"
        style={({ pressed }) => ({
          opacity: pressed ? 0.72 : 1,
          transform: [
            {
              scale: pressed ? 0.97 : 1,
            },
          ],
        })}
      >
        <View className="flex-row items-center rounded-full border border-[#304375] bg-[#0C1730] px-4 py-2.5">
          <View
            className="h-6 w-6 items-center justify-center rounded-full bg-[#718BFF]"
            style={{
              shadowColor: "#718BFF",
              shadowOpacity: 0.65,
              shadowRadius: 8,
              shadowOffset: {
                width: 0,
                height: 0,
              },
            }}
          >
            <Ionicons name="add" size={17} color="#FFFFFF" />
          </View>

          <Text className="ml-2.5 text-[13px] font-semibold text-[#C9D2FF]">
            Trace activity
          </Text>
        </View>
      </Pressable>

      {/* TRACKED TIME */}

      <View className="mt-5 overflow-hidden rounded-[26px] border border-[#1C2A49] bg-[#07101F]">
        <View className="px-5 pb-5 pt-5">
          <Text className="text-[11px] font-bold tracking-[1.3px] text-[#65728D]">
            TIME OBSERVED
          </Text>

          <Text className="mt-2 text-[36px] font-bold tracking-[-1px] text-white">
            {formatDuration(statistics.totalDurationMinutes)}
          </Text>

          <Text className="mt-1 text-[13px] text-[#71809D]">
            {hasTrackedTime
              ? `${statistics.totalActivities} ${
                  statistics.totalActivities === 1 ? "activity" : "activities"
                } traced today`
              : "No time traced yet today"}
          </Text>
        </View>

        {/* GROWING / LEAK */}

        <View className="border-t border-[#17233B] px-5 py-5">
          <View className="flex-row justify-between">
            <View>
              <View className="flex-row items-center">
                <View
                  className="mr-2 h-[7px] w-[7px] rounded-full bg-[#718BFF]"
                  style={{
                    shadowColor: "#718BFF",
                    shadowOpacity: 1,
                    shadowRadius: 7,
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                  }}
                />

                <Text className="text-[11px] font-bold tracking-[1px] text-[#718BFF]">
                  GROWING
                </Text>
              </View>

              <Text className="mt-2 text-[21px] font-semibold text-[#DCE2FF]">
                {formatDuration(statistics.servesDurationMinutes)}
              </Text>

              <Text className="mt-0.5 text-[12px] text-[#687694]">
                {growingPercent}% of tracked time
              </Text>
            </View>

            <View className="items-end">
              <View className="flex-row items-center">
                <Text className="text-[11px] font-bold tracking-[1px] text-[#E657A8]">
                  LIFE LEAKS
                </Text>

                <View
                  className="ml-2 h-[7px] w-[7px] rounded-full bg-[#E657A8]"
                  style={{
                    shadowColor: "#E657A8",
                    shadowOpacity: 1,
                    shadowRadius: 7,
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                  }}
                />
              </View>

              <Text className="mt-2 text-[21px] font-semibold text-[#FFD0EB]">
                {formatDuration(statistics.doesNotServeDurationMinutes)}
              </Text>

              <Text className="mt-0.5 text-[12px] text-[#687694]">
                {leakPercent}% of tracked time
              </Text>
            </View>
          </View>

          {/* BALANCE BAR */}

          <View className="mt-5 h-[7px] flex-row overflow-hidden rounded-full bg-[#121A2C]">
            {hasTrackedTime ? (
              <>
                <View
                  className="h-full bg-[#718BFF]"
                  style={{
                    width: `${growingPercent}%`,
                  }}
                />

                <View
                  className="h-full bg-[#E657A8]"
                  style={{
                    width: `${leakPercent}%`,
                  }}
                />
              </>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
