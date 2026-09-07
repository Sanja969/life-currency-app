import { Text, View } from "react-native";

import { formatDuration } from "@/features/today/utils/formatDuration";

import { PeriodProgressStat } from "../utils/progressStatistics";

type ThirtyDayPatternProps = {
  periods: PeriodProgressStat[];
};

function formatShortDate(date: Date) {
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function getPeriodLabel(startDate: Date, endDate: Date) {
  const sameMonth = startDate.getMonth() === endDate.getMonth();

  if (sameMonth) {
    const month = startDate.toLocaleDateString([], {
      month: "short",
    });

    return `${month} ${startDate.getDate()}–${endDate.getDate()}`;
  }

  return `${formatShortDate(startDate)}–${formatShortDate(endDate)}`;
}

export function ThirtyDayPattern({ periods }: ThirtyDayPatternProps) {
  const maxMinutes = Math.max(
    ...periods.map((period) => period.totalMinutes),
    1,
  );

  const totalMinutes = periods.reduce(
    (sum, period) => sum + period.totalMinutes,
    0,
  );

  return (
    <View className="mt-7">
      <View className="mb-4">
        <Text className="text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
          30-DAY PATTERN
        </Text>

        <Text className="mt-1 text-[12px] text-[#56637D]">
          How your tracked time changed across the last 30 days
        </Text>
      </View>

      <View className="rounded-[26px] border border-[#192744] bg-[#07101F] px-4 pb-4 pt-5">
        {totalMinutes === 0 ? (
          <View className="items-center py-8">
            <Text className="text-[14px] font-medium text-[#7A879F]">
              No activity yet
            </Text>

            <Text className="mt-1 text-center text-[12px] text-[#56637D]">
              Your 30-day pattern will form as you track your time.
            </Text>
          </View>
        ) : (
          <>
            <View className="h-[180px] flex-row items-end justify-between">
              {periods.map((period, index) => {
                const heightRatio = period.totalMinutes / maxMinutes;

                const barHeight =
                  period.totalMinutes > 0 ? Math.max(14, heightRatio * 150) : 4;

                const growingRatio =
                  period.totalMinutes > 0
                    ? period.growingMinutes / period.totalMinutes
                    : 0;

                const leakRatio =
                  period.totalMinutes > 0
                    ? period.leakMinutes / period.totalMinutes
                    : 0;

                return (
                  <View
                    key={`${period.startDate.toISOString()}-${index}`}
                    className="flex-1 items-center"
                  >
                    <Text className="mb-2 text-[10px] font-medium text-[#6F7D99]">
                      {period.totalMinutes > 0
                        ? formatDuration(period.totalMinutes)
                        : ""}
                    </Text>

                    <View
                      className="w-[32px] overflow-hidden rounded-full bg-[#111A2C]"
                      style={{
                        height: barHeight,
                      }}
                    >
                      {period.totalMinutes > 0 ? (
                        <>
                          <View
                            className="w-full bg-[#718BFF]"
                            style={{
                              height: `${growingRatio * 100}%`,
                            }}
                          />

                          <View
                            className="w-full bg-[#E657A8]"
                            style={{
                              height: `${leakRatio * 100}%`,
                            }}
                          />
                        </>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>

            <View className="mt-3 flex-row justify-between">
              {periods.map((period, index) => (
                <View
                  key={`${period.startDate.toISOString()}-label-${index}`}
                  className="flex-1 items-center px-0.5"
                >
                  <Text
                    numberOfLines={2}
                    className="text-center text-[9px] leading-[12px] text-[#65728D]"
                  >
                    {getPeriodLabel(period.startDate, period.endDate)}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-5 flex-row items-center justify-center">
              <View className="mr-1.5 h-[7px] w-[7px] rounded-full bg-[#718BFF]" />

              <Text className="mr-5 text-[10px] text-[#6F7D99]">Growing</Text>

              <View className="mr-1.5 h-[7px] w-[7px] rounded-full bg-[#E657A8]" />

              <Text className="text-[10px] text-[#6F7D99]">Life Leak</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
