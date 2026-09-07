import { Text, View } from "react-native";

import { DailyProgressStat } from "../hooks/useProgress";

type WeeklyPatternProps = {
  days: DailyProgressStat[];
};

const MAX_BAR_HEIGHT = 118;

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function WeeklyPattern({ days }: WeeklyPatternProps) {
  const today = new Date();

  const maxMinutes = Math.max(...days.map((day) => day.totalMinutes), 1);

  return (
    <View className="mt-7">
      <View className="mb-3">
        <Text className="text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
          7-DAY PATTERN
        </Text>

        <Text className="mt-1 text-[12px] text-[#56637D]">
          How your observed time changed each day
        </Text>
      </View>

      <View className="rounded-[26px] border border-[#192744] bg-[#07101F] px-4 pb-4 pt-5">
        <View
          className="flex-row items-end justify-between"
          style={{ height: 155 }}
        >
          {days.map((day) => {
            const totalHeight =
              day.totalMinutes > 0
                ? Math.max(8, (day.totalMinutes / maxMinutes) * MAX_BAR_HEIGHT)
                : 4;

            const growingRatio =
              day.totalMinutes > 0 ? day.growingMinutes / day.totalMinutes : 0;

            const growingHeight = totalHeight * growingRatio;

            const leakHeight = totalHeight - growingHeight;

            const isToday = isSameDay(day.date, today);

            const dayLabel = day.date
              .toLocaleDateString("en-US", {
                weekday: "short",
              })
              .slice(0, 3);

            return (
              <View
                key={day.date.toISOString()}
                className="flex-1 items-center"
              >
                <View
                  className="w-[18px] justify-end overflow-hidden rounded-full bg-[#111A2C]"
                  style={{
                    height: MAX_BAR_HEIGHT,
                  }}
                >
                  {day.totalMinutes > 0 ? (
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
                    color: isToday ? "#DCE2FF" : "#65728D",
                  }}
                >
                  {dayLabel}
                </Text>

                {isToday ? (
                  <View className="mt-1 h-[3px] w-[3px] rounded-full bg-[#718BFF]" />
                ) : (
                  <View className="mt-1 h-[3px]" />
                )}
              </View>
            );
          })}
        </View>

        <View className="mt-4 h-[1px] bg-[#17233B]" />

        <View className="mt-4 flex-row items-center justify-center">
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
