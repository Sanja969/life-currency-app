import { Text, View } from "react-native";

import { formatDuration } from "@/features/today/utils/formatDuration";

import { ProgressPeriod, ProgressStatistics } from "../hooks/useProgress";

type ProgressBalanceProps = {
  statistics: ProgressStatistics;
  period: ProgressPeriod;
};

export function ProgressBalance({ statistics, period }: ProgressBalanceProps) {
  const hasData = statistics.totalMinutes > 0;

  return (
    <View className="mt-7">
      <Text className="mb-3 text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
        LIFE BALANCE
      </Text>

      <View className="overflow-hidden rounded-[26px] border border-[#192744] bg-[#07101F]">
        {/* TOTAL */}

        <View className="px-5 pb-5 pt-5">
          <Text className="text-[11px] font-bold tracking-[1.2px] text-[#65728D]">
            TIME OBSERVED
          </Text>

          <Text className="mt-2 text-[34px] font-bold tracking-[-1px] text-white">
            {formatDuration(statistics.totalMinutes)}
          </Text>

          <Text className="mt-1 text-[13px] text-[#71809D]">
            {period === "7days"
              ? "over the last 7 days"
              : "over the last 30 days"}
          </Text>
        </View>

        <View className="h-[1px] bg-[#17233B]" />

        {/* SPLIT */}

        <View className="px-5 py-5">
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

              <Text className="mt-2 text-[20px] font-semibold text-[#DCE2FF]">
                {formatDuration(statistics.growingMinutes)}
              </Text>

              <Text className="mt-1 text-[12px] text-[#687694]">
                {statistics.growingPercent}%
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

              <Text className="mt-2 text-[20px] font-semibold text-[#FFD0EB]">
                {formatDuration(statistics.leakMinutes)}
              </Text>

              <Text className="mt-1 text-[12px] text-[#687694]">
                {statistics.leakPercent}%
              </Text>
            </View>
          </View>

          {/* BALANCE BAR */}

          <View className="mt-5 h-[8px] flex-row overflow-hidden rounded-full bg-[#111A2C]">
            {hasData ? (
              <>
                <View
                  className="h-full bg-[#718BFF]"
                  style={{
                    width: `${statistics.growingPercent}%`,
                  }}
                />

                <View
                  className="h-full bg-[#E657A8]"
                  style={{
                    width: `${statistics.leakPercent}%`,
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
