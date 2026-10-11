import { Text, View } from "react-native";

import { formatDuration } from "@/utils/formatDuration";

import { ProgressPeriod, ProgressStatistics } from "../hooks/useProgress";

type ProgressBalanceProps = {
  statistics: ProgressStatistics;
  period: ProgressPeriod;
};

export function ProgressBalance({ statistics, period }: ProgressBalanceProps) {
  const hasData = statistics.totalMinutes > 0;

  return (
    <View className="mt-8">
      {/* SECTION LABEL */}

      <Text className="mb-3 text-[10px] font-bold tracking-[2px] text-[#9295A3]">
        LIFE BALANCE
      </Text>

      {/* MAIN CARD */}

      <View className="overflow-hidden rounded-[24px] border border-[#252936] bg-[#11141D]">
        {/* TOTAL TIME */}

        <View className="px-5 pb-5 pt-5">
          <Text className="text-[10px] font-bold tracking-[1.8px] text-[#9295A3]">
            TIME OBSERVED
          </Text>

          <Text className="mt-3 text-[34px] font-bold tracking-[-1px] text-[#F5F0E8]">
            {formatDuration(statistics.totalMinutes)}
          </Text>

          <Text className="mt-1 text-[12px] text-[#9295A3]">
            {period === "7days"
              ? "over the last 7 days"
              : "over the last 30 days"}
          </Text>
        </View>

        {/* DIVIDER */}

        <View className="mx-5 h-[1px] bg-[#252936]" />

        {/* DISTRIBUTION */}

        <View className="px-5 pb-5 pt-5">
          <View className="flex-row justify-between">
            {/* GROWING */}

            <View>
              <View className="flex-row items-center">
                <View className="mr-2 h-[7px] w-[7px] rounded-full bg-[#8274E8]" />

                <Text className="text-[10px] font-bold tracking-[1.3px] text-[#8274E8]">
                  GROWING
                </Text>
              </View>

              <Text className="mt-3 text-[21px] font-semibold text-[#F5F0E8]">
                {formatDuration(statistics.growingMinutes)}
              </Text>

              <Text className="mt-1 text-[12px] text-[#9295A3]">
                {statistics.growingPercent}% of tracked time
              </Text>
            </View>

            {/* LIFE LEAKS */}

            <View className="items-end">
              <View className="flex-row items-center">
                <Text className="text-[10px] font-bold tracking-[1.3px] text-[#D88455]">
                  LIFE LEAKS
                </Text>

                <View className="ml-2 h-[7px] w-[7px] rounded-full bg-[#D88455]" />
              </View>

              <Text className="mt-3 text-[21px] font-semibold text-[#F5F0E8]">
                {formatDuration(statistics.leakMinutes)}
              </Text>

              <Text className="mt-1 text-[12px] text-[#9295A3]">
                {statistics.leakPercent}% of tracked time
              </Text>
            </View>
          </View>

          {/* BALANCE BAR */}

          <View className="mt-6 h-[6px] flex-row overflow-hidden rounded-full bg-[#252936]">
            {hasData && (
              <>
                <View
                  className="h-full bg-[#8274E8]"
                  style={{
                    width: `${statistics.growingPercent}%`,
                  }}
                />

                <View
                  className="h-full bg-[#D88455]"
                  style={{
                    width: `${statistics.leakPercent}%`,
                  }}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
