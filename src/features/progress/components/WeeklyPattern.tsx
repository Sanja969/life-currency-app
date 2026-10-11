import { Text, View } from "react-native";

import { DailyProgressStat } from "../hooks/useProgress";

type WeeklyPatternProps = {
  days: DailyProgressStat[];
};

const COLORS = {
  surface: "#11141D",
  border: "#252936",
  track: "#20242F",
  growing: "#8274E8",
  leaks: "#D88455",
  gold: "#D6AD65",
  text: "#F5F0E8",
  muted: "#9295A3",
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

  const maxMinutes = Math.max(
    ...days.map((day) => day.totalMinutes),
    1,
  );

  return (
    <View className="mt-8">
      {/* SECTION HEADER */}

      <View className="mb-3">
        <Text className="text-[10px] font-bold tracking-[2px] text-[#9295A3]">
          7-DAY PATTERN
        </Text>

        <Text className="mt-1.5 text-[12px] text-[#686C7A]">
          How your observed time changed each day
        </Text>
      </View>

      {/* CHART CARD */}

      <View className="rounded-[24px] border border-[#252936] bg-[#11141D] px-4 pb-5 pt-6">
        {/* BARS */}

        <View
          className="flex-row items-end justify-between"
          style={{ height: 155 }}
        >
          {days.map((day) => {
            const totalHeight =
              day.totalMinutes > 0
                ? Math.max(
                    8,
                    (day.totalMinutes / maxMinutes) *
                      MAX_BAR_HEIGHT,
                  )
                : 4;

            const growingRatio =
              day.totalMinutes > 0
                ? day.growingMinutes / day.totalMinutes
                : 0;

            const growingHeight = totalHeight * growingRatio;
            const leakHeight = totalHeight - growingHeight;

            const isToday = isSameDay(day.date, today);

            const dayLabel = day.date.toLocaleDateString("en-US", {
              weekday: "short",
            });

            return (
              <View
                key={day.date.toISOString()}
                className="flex-1 items-center"
              >
                {/* BAR TRACK */}

                <View
                  className="w-[18px] justify-end overflow-hidden rounded-full bg-[#20242F]"
                  style={{ height: MAX_BAR_HEIGHT }}
                >
                  {day.totalMinutes > 0 ? (
                    <View
                      className="mt-auto overflow-hidden rounded-full"
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

                {/* DAY LABEL */}

                <Text
                  className="mt-3 text-[11px] font-semibold"
                  style={{
                    color: isToday
                      ? COLORS.gold
                      : COLORS.muted,
                  }}
                >
                  {dayLabel}
                </Text>

                {/* TODAY INDICATOR */}

                {isToday ? (
                  <View className="mt-1 h-[3px] w-[3px] rounded-full bg-[#D6AD65]" />
                ) : (
                  <View className="mt-1 h-[3px]" />
                )}
              </View>
            );
          })}
        </View>

        {/* DIVIDER */}

        <View className="mt-4 h-[1px] bg-[#252936]" />

        {/* LEGEND */}

        <View className="mt-4 flex-row items-center justify-center">
          <View className="mr-5 flex-row items-center">
            <View className="mr-2 h-[7px] w-[7px] rounded-full bg-[#8274E8]" />

            <Text className="text-[11px] text-[#9295A3]">
              Growing
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="mr-2 h-[7px] w-[7px] rounded-full bg-[#D88455]" />

            <Text className="text-[11px] text-[#9295A3]">
              Life Leaks
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}