import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { formatDuration } from "@/utils/formatDuration";

import {
  ProgressCategoryStat,
  ProgressPeriod,
} from "../hooks/useProgress";

type ProgressInsightsProps = {
  strongestInvestment: ProgressCategoryStat | null;
  biggestLeak: ProgressCategoryStat | null;
  period: ProgressPeriod;
};

const COLORS = {
  surface: "#11141D",
  border: "#252936",
  text: "#F5F0E8",
  muted: "#9295A3",
  subtle: "#686C7A",
  growing: "#8274E8",
  leaks: "#D88455",
};

export function ProgressInsights({
  strongestInvestment,
  biggestLeak,
  period,
}: ProgressInsightsProps) {
  if (!strongestInvestment && !biggestLeak) {
    return null;
  }

  const periodLabel =
    period === "7days" ? "last 7 days" : "last 30 days";

  const strongestInvestmentMeta = strongestInvestment
    ? getActivityCategoryMeta(
        strongestInvestment.category,
      )
    : null;

  const biggestLeakMeta = biggestLeak
    ? getActivityCategoryMeta(biggestLeak.category)
    : null;

  return (
    <View className="mt-8">
      {/* SECTION HEADER */}

      <View className="mb-3">
        <Text className="text-[10px] font-bold tracking-[2px] text-[#9295A3]">
          CURRENT SIGNALS
        </Text>

        <Text className="mt-1.5 text-[12px] text-[#686C7A]">
          What stands out in this period
        </Text>
      </View>

      {/* SIGNAL CARDS */}

      <View className="gap-3">
        {/* STRONGEST INVESTMENT */}

        {strongestInvestment && strongestInvestmentMeta && (
          <View className="rounded-[22px] border border-[#252936] bg-[#11141D] p-5">
            <View className="flex-row items-center">
              {/* ICON */}

              <View className="h-11 w-11 items-center justify-center rounded-[14px] border border-[#383052] bg-[#211D35]">
                <Ionicons
                  name="trending-up-outline"
                  size={21}
                  color={COLORS.growing}
                />
              </View>

              {/* CONTENT */}

              <View className="ml-3 flex-1">
                <Text className="text-[10px] font-bold tracking-[1.2px] text-[#8274E8]">
                  STRONGEST INVESTMENT
                </Text>

                <Text className="mt-1.5 text-[16px] font-semibold text-[#F5F0E8]">
                  {strongestInvestmentMeta.label}
                </Text>
              </View>

              {/* DURATION */}

              <Text className="ml-2 text-[15px] font-semibold text-[#8274E8]">
                {formatDuration(
                  strongestInvestment.growingMinutes,
                )}
              </Text>
            </View>

            <Text className="ml-[56px] mt-3 text-[12px] leading-[18px] text-[#9295A3]">
              Most Growing time in the {periodLabel}.
            </Text>
          </View>
        )}

        {/* BIGGEST LEAK */}

        {biggestLeak && biggestLeakMeta && (
          <View className="rounded-[22px] border border-[#252936] bg-[#11141D] p-5">
            <View className="flex-row items-center">
              {/* ICON */}

              <View className="h-11 w-11 items-center justify-center rounded-[14px] border border-[#493127] bg-[#302019]">
                <Ionicons
                  name="trending-down-outline"
                  size={21}
                  color={COLORS.leaks}
                />
              </View>

              {/* CONTENT */}

              <View className="ml-3 flex-1">
                <Text className="text-[10px] font-bold tracking-[1.2px] text-[#D88455]">
                  BIGGEST LEAK
                </Text>

                <Text className="mt-1.5 text-[16px] font-semibold text-[#F5F0E8]">
                  {biggestLeakMeta.label}
                </Text>
              </View>

              {/* DURATION */}

              <Text className="ml-2 text-[15px] font-semibold text-[#D88455]">
                {formatDuration(
                  biggestLeak.leakMinutes,
                )}
              </Text>
            </View>

            <Text className="ml-[56px] mt-3 text-[12px] leading-[18px] text-[#9295A3]">
              Most Life Leak time in the {periodLabel}.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}