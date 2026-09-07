import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { ActivityCategory } from "@/types/activity";
import { formatDuration } from "@/features/today/utils/formatDuration";

import { ProgressCategoryStat } from "../hooks/useProgress";
import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";

type LifeAreaBreakdownProps = {
  categories: ProgressCategoryStat[];
};

export function LifeAreaBreakdown({ categories }: LifeAreaBreakdownProps) {
  if (categories.length === 0) {
    return (
      <View className="mt-7">
        <Text className="text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
          TIME BY LIFE AREA
        </Text>

        <View className="mt-3 items-center rounded-[26px] border border-[#192744] bg-[#07101F] px-6 py-8">
          <Ionicons name="analytics-outline" size={25} color="#53617D" />

          <Text className="mt-3 text-[14px] font-semibold text-[#8A96AE]">
            No life areas observed yet
          </Text>

          <Text className="mt-1 text-center text-[12px] leading-[18px] text-[#56637D]">
            Activities from this period will appear here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-7">
      <View className="mb-3">
        <Text className="text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
          TIME BY LIFE AREA
        </Text>

        <Text className="mt-1 text-[12px] text-[#56637D]">
          Where your observed time is flowing
        </Text>
      </View>

      <View className="overflow-hidden rounded-[26px] border border-[#192744] bg-[#07101F]">
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
                <View className="flex-row items-center">
                  <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-[#101A30]">
                    <Ionicons name={meta.icon} size={19} color="#8295FF" />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-[15px] font-semibold text-[#E4E8F2]">
                      {meta.label}
                    </Text>

                    <Text className="mt-0.5 text-[12px] text-[#687694]">
                      {item.percentage}% of tracked time
                    </Text>
                  </View>

                  <Text className="text-[16px] font-semibold text-[#D7DEEE]">
                    {formatDuration(item.totalMinutes)}
                  </Text>
                </View>

                <View className="ml-[52px] mt-4 h-[7px] flex-row overflow-hidden rounded-full bg-[#111A2C]">
                  {item.totalMinutes > 0 ? (
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

                <View className="ml-[52px] mt-2.5 flex-row justify-between">
                  <Text className="text-[11px] text-[#718BFF]">
                    Growing {formatDuration(item.growingMinutes)}
                  </Text>

                  <Text className="text-[11px] text-[#E657A8]">
                    Leak {formatDuration(item.leakMinutes)}
                  </Text>
                </View>
              </View>

              {index < categories.length - 1 ? (
                <View className="ml-[68px] h-[1px] bg-[#17233B]" />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
