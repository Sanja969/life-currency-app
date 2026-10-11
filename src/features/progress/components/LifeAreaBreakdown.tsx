import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { formatDuration } from "@/utils/formatDuration";
import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";

import { ProgressCategoryStat } from "../hooks/useProgress";

type LifeAreaBreakdownProps = {
  categories: ProgressCategoryStat[];
};

const COLORS = {
  surface: "#11141D",
  border: "#252936",
  text: "#F5F0E8",
  muted: "#9295A3",
  subtle: "#686C7A",
  gold: "#D6AD65",
  growing: "#8274E8",
  leaks: "#D88455",
  track: "#20242F",
};

export function LifeAreaBreakdown({ categories }: LifeAreaBreakdownProps) {
  if (categories.length === 0) {
    return (
      <View className="mt-8">
        <Text className="text-[10px] font-bold tracking-[2px] text-[#9295A3]">
          TIME BY LIFE AREA
        </Text>

        <View className="mt-3 items-center rounded-[24px] border border-[#252936] bg-[#11141D] px-6 py-8">
          <View className="h-12 w-12 items-center justify-center rounded-[15px] bg-[#24231F]">
            <Ionicons name="analytics-outline" size={23} color={COLORS.gold} />
          </View>

          <Text className="mt-4 text-[14px] font-semibold text-[#F5F0E8]">
            No life areas observed yet
          </Text>

          <Text className="mt-2 text-center text-[12px] leading-[19px] text-[#9295A3]">
            Activities from this period will appear here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-8">
      {/* SECTION HEADER */}

      <View className="mb-3">
        <Text className="text-[10px] font-bold tracking-[2px] text-[#9295A3]">
          TIME BY LIFE AREA
        </Text>

        <Text className="mt-1.5 text-[12px] text-[#686C7A]">
          Where your observed time is flowing
        </Text>
      </View>

      {/* CATEGORY CARD */}

      <View className="overflow-hidden rounded-[24px] border border-[#252936] bg-[#11141D]">
        {categories.map((item, index) => {
          const meta = getActivityCategoryMeta(item.category);

          const growingPercent =
            item.totalMinutes > 0
              ? Math.round((item.growingMinutes / item.totalMinutes) * 100)
              : 0;

          const leakPercent = item.totalMinutes > 0 ? 100 - growingPercent : 0;

          return (
            <View key={item.category}>
              <View className="px-5 py-5">
                {/* CATEGORY HEADER */}

                <View className="flex-row items-center">
                  {/* ICON */}

                  <View className="h-11 w-11 items-center justify-center rounded-[14px] border border-[#383125] bg-[#24231F]">
                    <Ionicons name={meta.icon} size={20} color={COLORS.gold} />
                  </View>

                  {/* CATEGORY NAME */}

                  <View className="ml-3 flex-1">
                    <Text className="text-[15px] font-semibold text-[#F5F0E8]">
                      {meta.label}
                    </Text>

                    <Text className="mt-1 text-[12px] text-[#9295A3]">
                      {item.percentage}% of tracked time
                    </Text>
                  </View>

                  {/* TOTAL DURATION */}

                  <Text className="ml-2 text-[15px] font-semibold text-[#F5F0E8]">
                    {formatDuration(item.totalMinutes)}
                  </Text>
                </View>

                {/* DISTRIBUTION BAR */}

                <View className="ml-[56px] mt-4 h-[6px] flex-row overflow-hidden rounded-full bg-[#20242F]">
                  {item.totalMinutes > 0 && (
                    <>
                      <View
                        className="h-full bg-[#8274E8]"
                        style={{
                          width: `${growingPercent}%`,
                        }}
                      />

                      <View
                        className="h-full bg-[#D88455]"
                        style={{
                          width: `${leakPercent}%`,
                        }}
                      />
                    </>
                  )}
                </View>

                {/* DURATION DETAILS */}

                <View className="ml-[56px] mt-3 flex-row flex-wrap justify-between">
                  <Text className="mr-2 text-[11px] text-[#8274E8]">
                    Growing {formatDuration(item.growingMinutes)}
                  </Text>

                  <Text className="text-[11px] text-[#D88455]">
                    Leaks {formatDuration(item.leakMinutes)}
                  </Text>
                </View>
              </View>

              {/* DIVIDER */}

              {index < categories.length - 1 && (
                <View className="ml-[76px] h-[1px] bg-[#252936]" />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
