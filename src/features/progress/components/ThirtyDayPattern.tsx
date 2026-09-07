import { Text, View } from "react-native";

import { PeriodProgressStat } from "../utils/progressStatistics";

type ThirtyDayPatternProps = {
  periods: PeriodProgressStat[];
};

const MAX_BAR_HEIGHT = 118;

export function ThirtyDayPattern({ periods }: ThirtyDayPatternProps) {
  const maxMinutes = Math.max(...periods.map((item) => item.totalMinutes), 1);

  return (
    <View className="mt-7">
      <View className="mb-3">
        <Text className="text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
          30-DAY PATTERN
        </Text>

        <Text className="mt-1 text-[12px] text-[#56637D]">
          How your observed time shifted across the last 30 days
        </Text>
      </View>

      <View className="rounded-[26px] border border-[#192744] bg-[#07101F] px-5 pb-4 pt-5">
        <View
          className="flex-row items-end justify-between"
          style={{ height: 155 }}
        >
          {periods.map((item) => {
            const totalHeight =
              item.totalMinutes > 0
                ? Math.max(8, (item.totalMinutes / maxMinutes) * MAX_BAR_HEIGHT)
                : 4;

            const growingRatio =
              item.totalMinutes > 0
                ? item.growingMinutes / item.totalMinutes
                : 0;

            const growingHeight = totalHeight * growingRatio;

            const leakHeight = totalHeight - growingHeight;

            return (
              <View
                key={item.startDate.toISOString()}
                className="flex-1 items-center"
              >
                <View
                  className="w-[28px] justify-end overflow-hidden rounded-full bg-[#111A2C]"
                  style={{
                    height: MAX_BAR_HEIGHT,
                  }}
                >
                  {item.totalMinutes > 0 ? (
                    <View
                      className="mt-auto overflow-hidden rounded-full"
                      style={{
                        height: totalHeight,
                      }}
                    >
                      {leakHeight > 0 ? (
                        <View
                          className="bg-[#E657A8]"
                          style={{
                            height: leakHeight,
                          }}
                        />
                      ) : null}

                      {growingHeight > 0 ? (
                        <View
                          className="bg-[#718BFF]"
                          style={{
                            height: growingHeight,
                          }}
                        />
                      ) : null}
                    </View>
                  ) : (
                    <View className="mt-auto h-[4px] rounded-full bg-[#26324B]" />
                  )}
                </View>

                <Text
                  className="mt-3 text-[11px] font-semibold"
                  style={{
                    color: item.label === "Now" ? "#DCE2FF" : "#65728D",
                  }}
                >
                  {item.label}
                </Text>

                {item.label === "Now" ? (
                  <View className="mt-1 h-[3px] w-[3px] rounded-full bg-[#718BFF]" />
                ) : (
                  <View className="mt-1 h-[3px]" />
                )}
              </View>
            );
          })}
        </View>

        <View className="mt-4 h-[1px] bg-[#17233B]" />

        <View className="mt-4 flex-row justify-center">
          <View className="mr-5 flex-row items-center">
            <View className="mr-2 h-[6px] w-[6px] rounded-full bg-[#718BFF]" />

            <Text className="text-[11px] text-[#71809D]">Growing</Text>
          </View>

          <View className="flex-row items-center">
            <View className="mr-2 h-[6px] w-[6px] rounded-full bg-[#E657A8]" />

            <Text className="text-[11px] text-[#71809D]">Life Leak</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
