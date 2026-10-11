import { Text, View } from "react-native";

import { formatDuration } from "@/utils/formatDuration";
import { PeriodProgressStat } from "../utils/progressStatistics";

type ThirtyDayPatternProps = {
  periods: PeriodProgressStat[];
};

const COLORS = {
  surface: "#11141D",
  border: "#252936",
  track: "#20242F",
  growing: "#8274E8",
  leaks: "#D88455",
  text: "#F5F0E8",
  muted: "#9295A3",
  subtle: "#686C7A",
};

const MAX_BAR_HEIGHT = 150;

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getPeriodLabel(startDate: Date, endDate: Date) {
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  if (sameMonth) {
    const month = startDate.toLocaleDateString("en-US", {
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
    <View className="mt-8">
      {/* SECTION HEADER */}

      <View className="mb-3">
        <Text className="text-[10px] font-bold tracking-[2px] text-[#9295A3]">
          30-DAY PATTERN
        </Text>

        <Text className="mt-1.5 text-[12px] text-[#686C7A]">
          How your tracked time changed across the last 30 days
        </Text>
      </View>

      {/* CHART CARD */}

      <View className="rounded-[24px] border border-[#252936] bg-[#11141D] px-4 pb-5 pt-6">
        {totalMinutes === 0 ? (
          <View className="items-center py-8">
            <Text className="text-[14px] font-medium text-[#9295A3]">
              No activity yet
            </Text>

            <Text className="mt-2 text-center text-[12px] leading-5 text-[#686C7A]">
              Your 30-day pattern will form as you track your time.
            </Text>
          </View>
        ) : (
          <>
            {/* BARS */}

            <View className="h-[185px] flex-row items-end justify-between">
              {periods.map((period, index) => {
                const totalHeight =
                  period.totalMinutes > 0
                    ? Math.max(
                        8,
                        (period.totalMinutes / maxMinutes) * MAX_BAR_HEIGHT,
                      )
                    : 4;

                const growingRatio =
                  period.totalMinutes > 0
                    ? period.growingMinutes / period.totalMinutes
                    : 0;

                const growingHeight = totalHeight * growingRatio;
                const leakHeight = totalHeight - growingHeight;

                return (
                  <View
                    key={`${period.startDate.toISOString()}-${index}`}
                    className="flex-1 items-center"
                  >
                    {/* TOTAL DURATION */}

                    <Text
                      numberOfLines={1}
                      className="mb-3 text-[10px] font-medium text-[#9295A3]"
                    >
                      {period.totalMinutes > 0
                        ? formatDuration(period.totalMinutes)
                        : ""}
                    </Text>

                    {/* STACKED BAR */}

                    <View
                      className="w-[30px] justify-end overflow-hidden rounded-[10px] bg-[#20242F]"
                      style={{ height: MAX_BAR_HEIGHT }}
                    >
                      {period.totalMinutes > 0 ? (
                        <View
                          className="mt-auto overflow-hidden rounded-[10px]"
                          style={{ height: totalHeight }}
                        >
                          {leakHeight > 0 && (
                            <View
                              style={{
                                height: leakHeight,
                                backgroundColor: COLORS.leaks,
                              }}
                            />
                          )}

                          {growingHeight > 0 && (
                            <View
                              style={{
                                height: growingHeight,
                                backgroundColor: COLORS.growing,
                              }}
                            />
                          )}
                        </View>
                      ) : (
                        <View className="mt-auto h-[4px] rounded-full bg-[#343845]" />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* DATE LABELS */}

            <View className="mt-3 flex-row justify-between">
              {periods.map((period, index) => (
                <View
                  key={`${period.startDate.toISOString()}-label-${index}`}
                  className="flex-1 items-center px-0.5"
                >
                  <Text
                    numberOfLines={2}
                    className="text-center text-[9px] leading-[12px] text-[#9295A3]"
                  >
                    {getPeriodLabel(period.startDate, period.endDate)}
                  </Text>
                </View>
              ))}
            </View>

            {/* DIVIDER */}

            <View className="mt-5 h-[1px] bg-[#252936]" />

            {/* LEGEND */}

            <View className="mt-4 flex-row items-center justify-center">
              <View className="mr-5 flex-row items-center">
                <View className="mr-2 h-[7px] w-[7px] rounded-full bg-[#8274E8]" />

                <Text className="text-[11px] text-[#9295A3]">Growing</Text>
              </View>

              <View className="flex-row items-center">
                <View className="mr-2 h-[7px] w-[7px] rounded-full bg-[#D88455]" />

                <Text className="text-[11px] text-[#9295A3]">Life Leaks</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
