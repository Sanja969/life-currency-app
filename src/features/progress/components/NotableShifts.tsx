import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { formatDuration } from "@/utils/formatDuration";

import { ProgressCategoryTrend, ProgressPeriod } from "../hooks/useProgress";

type NotableShiftsProps = {
  trends: ProgressCategoryTrend[];
  period: ProgressPeriod;
};

type Shift = {
  key: string;
  categoryLabel: string;
  type: "positive" | "negative" | "neutral";
  signal: "growing" | "leak";
  direction: "up" | "down";
  changeMinutes: number;
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

function buildNotableShifts(trends: ProgressCategoryTrend[]): Shift[] {
  const candidates: Shift[] = [];

  for (const trend of trends) {
    const meta = getActivityCategoryMeta(trend.category);

    if (trend.growingMinutesChange !== 0) {
      const increased = trend.growingMinutesChange > 0;

      candidates.push({
        key: `${trend.category}-growing`,
        categoryLabel: meta.label,
        type: increased ? "positive" : "negative",
        signal: "growing",
        direction: increased ? "up" : "down",
        changeMinutes: Math.abs(trend.growingMinutesChange),
      });
    }

    if (trend.leakMinutesChange !== 0) {
      const increased = trend.leakMinutesChange > 0;

      candidates.push({
        key: `${trend.category}-leak`,
        categoryLabel: meta.label,
        type: increased ? "negative" : "positive",
        signal: "leak",
        direction: increased ? "up" : "down",
        changeMinutes: Math.abs(trend.leakMinutesChange),
      });
    }
  }

  return candidates
    .sort((a, b) => b.changeMinutes - a.changeMinutes)
    .slice(0, 3);
}

function getShiftContent(shift: Shift) {
  if (shift.signal === "growing" && shift.direction === "up") {
    return {
      eyebrow: "GROWING INCREASED",
      message: "more Growing time",
    };
  }

  if (shift.signal === "growing" && shift.direction === "down") {
    return {
      eyebrow: "GROWING DECREASED",
      message: "less Growing time",
    };
  }

  if (shift.signal === "leak" && shift.direction === "down") {
    return {
      eyebrow: "LIFE LEAK DECREASED",
      message: "less Life Leak time",
    };
  }

  return {
    eyebrow: "LIFE LEAK INCREASED",
    message: "more Life Leak time",
  };
}

export function NotableShifts({ trends, period }: NotableShiftsProps) {
  const shifts = buildNotableShifts(trends);

  if (shifts.length === 0) {
    return null;
  }

  const periodLabel =
    period === "7days" ? "previous 7 days" : "previous 30 days";

  return (
    <View className="mt-8">
      {/* SECTION HEADER */}

      <View className="mb-3">
        <Text className="text-[10px] font-bold tracking-[2px] text-[#9295A3]">
          NOTABLE SHIFTS
        </Text>

        <Text className="mt-1.5 text-[12px] text-[#686C7A]">
          Compared with the {periodLabel}
        </Text>
      </View>

      {/* SHIFT CARDS */}

      <View className="gap-3">
        {shifts.map((shift) => (
          <ShiftCard key={shift.key} shift={shift} />
        ))}
      </View>
    </View>
  );
}

function ShiftCard({ shift }: { shift: Shift }) {
  const content = getShiftContent(shift);

  const positive = shift.type === "positive";

  const accent = positive ? COLORS.growing : COLORS.leaks;

  const iconName =
    shift.direction === "up" ? "arrow-up-outline" : "arrow-down-outline";

  const sign = shift.direction === "up" ? "+" : "−";

  return (
    <View className="overflow-hidden rounded-[22px] border border-[#252936] bg-[#11141D]">
      <View className="flex-row">
        {/* ACCENT LINE */}

        <View
          className="w-[3px]"
          style={{
            backgroundColor: accent,
          }}
        />

        {/* CONTENT */}

        <View className="flex-1 p-4">
          <View className="flex-row items-center justify-between">
            <View className="mr-3 flex-1">
              <Text
                className="text-[10px] font-bold tracking-[1.3px]"
                style={{
                  color: accent,
                }}
              >
                {content.eyebrow}
              </Text>

              <Text className="mt-2 text-[16px] font-semibold text-[#F5F0E8]">
                {shift.categoryLabel}
              </Text>
            </View>

            {/* CHANGE VALUE */}

            <View className="flex-row items-center">
              <Ionicons name={iconName} size={16} color={accent} />

              <Text
                className="ml-1 text-[15px] font-semibold"
                style={{
                  color: accent,
                }}
              >
                {sign}
                {formatDuration(shift.changeMinutes)}
              </Text>
            </View>
          </View>

          <Text className="mt-3 text-[12px] leading-[18px] text-[#9295A3]">
            {content.message} than in the previous period
          </Text>
        </View>
      </View>
    </View>
  );
}
