import { Text, View } from "react-native";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { formatDuration } from "@/features/today/utils/formatDuration";

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

        // Less leaking = positive.
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
    <View className="mt-7">
      <View className="mb-3">
        <Text className="text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
          NOTABLE SHIFTS
        </Text>

        <Text className="mt-1 text-[12px] text-[#56637D]">
          Compared with the {periodLabel}
        </Text>
      </View>

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

  const accent = positive ? "#718BFF" : "#E657A8";

  const borderColor = positive ? "#24345E" : "#4A2343";

  const backgroundColor = positive ? "#0A1225" : "#120B1B";

  const sign = shift.direction === "up" ? "+" : "−";

  return (
    <View
      className="rounded-[22px] border p-4"
      style={{
        borderColor,
        backgroundColor,
      }}
    >
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text
            className="text-[9px] font-bold tracking-[1.1px]"
            style={{
              color: accent,
            }}
          >
            {content.eyebrow}
          </Text>

          <Text className="mt-1 text-[16px] font-semibold text-[#E4E8F2]">
            {shift.categoryLabel}
          </Text>
        </View>

        <Text
          className="text-[16px] font-semibold"
          style={{
            color: accent,
          }}
        >
          {sign}
          {formatDuration(shift.changeMinutes)}
        </Text>
      </View>

      <Text className="mt-2 text-[12px] text-[#687694]">
        {content.message} than in the previous period
      </Text>
    </View>
  );
}
