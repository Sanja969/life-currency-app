import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { formatDuration } from "@/features/today/utils/formatDuration";

import { ProgressCategoryStat, ProgressPeriod } from "../hooks/useProgress";

type ProgressInsightsProps = {
  strongestInvestment: ProgressCategoryStat | null;
  biggestLeak: ProgressCategoryStat | null;
  period: ProgressPeriod;
};

export function ProgressInsights({
  strongestInvestment,
  biggestLeak,
  period,
}: ProgressInsightsProps) {
  if (!strongestInvestment && !biggestLeak) {
    return null;
  }

  const periodLabel = period === "7days" ? "last 7 days" : "last 30 days";

  const strongestInvestmentMeta = strongestInvestment
    ? getActivityCategoryMeta(strongestInvestment.category)
    : null;

  const biggestLeakMeta = biggestLeak
    ? getActivityCategoryMeta(biggestLeak.category)
    : null;

  return (
    <View className="mt-7">
      <View className="mb-3">
        <Text className="text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
          CURRENT SIGNALS
        </Text>

        <Text className="mt-1 text-[12px] text-[#56637D]">
          What stands out in this period
        </Text>
      </View>

      <View className="gap-3">
        {strongestInvestment && strongestInvestmentMeta ? (
          <View className="rounded-[22px] border border-[#24345E] bg-[#0A1225] p-5">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-[#152147]">
                <Ionicons
                  name="trending-up-outline"
                  size={20}
                  color="#718BFF"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[10px] font-bold tracking-[1.1px] text-[#718BFF]">
                  STRONGEST INVESTMENT
                </Text>

                <Text className="mt-1 text-[17px] font-semibold text-[#E5E9F5]">
                  {strongestInvestmentMeta.label}
                </Text>
              </View>

              <Text className="text-[16px] font-semibold text-[#BFC9FF]">
                {formatDuration(strongestInvestment.growingMinutes)}
              </Text>
            </View>

            <Text className="ml-[52px] mt-3 text-[12px] leading-[18px] text-[#697792]">
              Most Growing time in the {periodLabel}.
            </Text>
          </View>
        ) : null}

        {biggestLeak && biggestLeakMeta ? (
          <View className="rounded-[22px] border border-[#4A2343] bg-[#120B1B] p-5">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-[#31142B]">
                <Ionicons
                  name="trending-down-outline"
                  size={20}
                  color="#E657A8"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[10px] font-bold tracking-[1.1px] text-[#E657A8]">
                  BIGGEST LEAK
                </Text>

                <Text className="mt-1 text-[17px] font-semibold text-[#F1DFEA]">
                  {biggestLeakMeta.label}
                </Text>
              </View>

              <Text className="text-[16px] font-semibold text-[#F4A9D2]">
                {formatDuration(biggestLeak.leakMinutes)}
              </Text>
            </View>

            <Text className="ml-[52px] mt-3 text-[12px] leading-[18px] text-[#80677A]">
              Most Life Leak time in the {periodLabel}.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
