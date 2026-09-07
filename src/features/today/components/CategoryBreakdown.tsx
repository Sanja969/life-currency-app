import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { ActivityCategory, ActivityCategoryStatistics } from "@/types/activity";

import { formatDuration } from "../utils/formatDuration";

type CategoryBreakdownProps = {
  categories: ActivityCategoryStatistics[];
};

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

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <View className="mt-7">
      <View className="mb-4">
        <Text className="text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
          WHERE YOUR LIFE WENT
        </Text>

        <Text className="mt-1 text-[12px] text-[#56637D]">
          Your time across life areas
        </Text>
      </View>

      <View className="overflow-hidden rounded-[22px] border border-[#192744] bg-[#07101F]">
        {categories.map((item, index) => {
          const meta = CATEGORY_META[item.category];

          const growingRatio =
            item.totalDurationMinutes > 0
              ? item.servesDurationMinutes / item.totalDurationMinutes
              : 0;

          const leakRatio = 1 - growingRatio;

          return (
            <View key={item.category}>
              <View className="px-4 py-4">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-[#101A30]">
                    <Ionicons name={meta.icon} size={19} color="#8295FF" />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-[15px] font-semibold text-[#E4E8F2]">
                      {meta.label}
                    </Text>

                    <Text className="mt-0.5 text-[12px] text-[#6F7D99]">
                      {item.percentage}% of tracked time
                    </Text>
                  </View>

                  <Text className="text-[15px] font-semibold text-[#C9D1E3]">
                    {formatDuration(item.totalDurationMinutes)}
                  </Text>
                </View>

                {/* CATEGORY BAR */}

                <View className="ml-[52px] mt-3 h-[6px] flex-row overflow-hidden rounded-full bg-[#111A2C]">
                  {item.totalDurationMinutes > 0 ? (
                    <>
                      <View
                        className="h-full bg-[#718BFF]"
                        style={{
                          width: `${growingRatio * 100}%`,
                        }}
                      />

                      <View
                        className="h-full bg-[#E657A8]"
                        style={{
                          width: `${leakRatio * 100}%`,
                        }}
                      />
                    </>
                  ) : null}
                </View>

                {/* SPLIT */}

                <View className="ml-[52px] mt-2 flex-row justify-between">
                  <Text className="text-[11px] text-[#718BFF]">
                    Growing {formatDuration(item.servesDurationMinutes)}
                  </Text>

                  <Text className="text-[11px] text-[#E657A8]">
                    Leak {formatDuration(item.doesNotServeDurationMinutes)}
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
