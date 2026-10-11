import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { ProgressComparison, ProgressPeriod } from "../hooks/useProgress";

type ProgressComparisonCardProps = {
  comparison: ProgressComparison;
  period: ProgressPeriod;
};

type ChangeRowProps = {
  label: string;
  value: number | null;
  direction?: "positive" | "negative" | "neutral";
  suffix?: string;
};

const COLORS = {
  surface: "#11141D",
  border: "#252936",
  text: "#F5F0E8",
  muted: "#9295A3",
  subtle: "#686C7A",
  growing: "#8274E8",
  leaks: "#D88455",
  gold: "#D6AD65",
};

function ChangeRow({
  label,
  value,
  direction = "neutral",
  suffix = "%",
}: ChangeRowProps) {
  if (value === null) {
    return (
      <View className="flex-row items-center justify-between py-4">
        <Text className="text-[13px]" style={{ color: COLORS.muted }}>
          {label}
        </Text>

        <Text className="text-[12px]" style={{ color: COLORS.subtle }}>
          No previous data
        </Text>
      </View>
    );
  }

  const icon =
    value > 0
      ? "arrow-up-outline"
      : value < 0
        ? "arrow-down-outline"
        : "remove-outline";

  let color = COLORS.muted;

  if (value !== 0 && direction !== "neutral") {
    const improved = direction === "positive" ? value > 0 : value < 0;

    color = improved ? COLORS.growing : COLORS.leaks;
  }

  const formattedValue = value > 0 ? `+${value}` : `${value}`;

  return (
    <View className="flex-row items-center justify-between py-4">
      {/* LABEL */}

      <Text className="text-[13px]" style={{ color: COLORS.muted }}>
        {label}
      </Text>

      {/* CHANGE */}

      <View className="flex-row items-center">
        <Ionicons name={icon} size={15} color={color} />

        <Text className="ml-1.5 text-[13px] font-semibold" style={{ color }}>
          {formattedValue}
          {suffix}
        </Text>
      </View>
    </View>
  );
}

export function ProgressComparisonCard({
  comparison,
  period,
}: ProgressComparisonCardProps) {
  const periodLabel =
    period === "7days" ? "previous 7 days" : "previous 30 days";

  return (
    <View className="mt-8">
      {/* SECTION HEADER */}

      <View className="mb-3">
        <Text className="text-[10px] font-bold tracking-[2px] text-[#9295A3]">
          CHANGE
        </Text>

        <Text className="mt-1.5 text-[12px] text-[#686C7A]">
          Compared with the {periodLabel}
        </Text>
      </View>

      {/* COMPARISON CARD */}

      <View className="overflow-hidden rounded-[24px] border border-[#252936] bg-[#11141D] px-5">
        <ChangeRow
          label="Time observed"
          value={comparison.totalMinutesChangePercent}
          direction="neutral"
        />

        <View className="h-[1px] bg-[#252936]" />

        <ChangeRow
          label="Growing share"
          value={comparison.growingPercentagePointChange}
          direction="positive"
          suffix=" pp"
        />

        <View className="h-[1px] bg-[#252936]" />

        <ChangeRow
          label="Life Leak share"
          value={comparison.leakPercentagePointChange}
          direction="negative"
          suffix=" pp"
        />
      </View>
    </View>
  );
}
