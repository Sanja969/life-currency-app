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
  positiveIsGood?: boolean;
  suffix?: string;
};

function ChangeRow({
  label,
  value,
  positiveIsGood = true,
  suffix = "%",
}: ChangeRowProps) {
  if (value === null) {
    return (
      <View className="flex-row items-center justify-between py-3">
        <Text className="text-[13px] text-[#7A879F]">{label}</Text>

        <Text className="text-[12px] text-[#56637D]">No previous data</Text>
      </View>
    );
  }

  const improved = value === 0 ? null : positiveIsGood ? value > 0 : value < 0;

  const color =
    improved === null ? "#8290A8" : improved ? "#718BFF" : "#E657A8";

  const icon =
    value > 0
      ? "arrow-up-outline"
      : value < 0
        ? "arrow-down-outline"
        : "remove-outline";

  const formattedValue = value > 0 ? `+${value}` : `${value}`;

  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="text-[13px] text-[#7A879F]">{label}</Text>

      <View className="flex-row items-center">
        <Ionicons name={icon} size={14} color={color} />

        <Text className="ml-1 text-[13px] font-semibold" style={{ color }}>
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
    <View className="mt-7">
      <View className="mb-3">
        <Text className="text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
          CHANGE
        </Text>

        <Text className="mt-1 text-[12px] text-[#56637D]">
          Compared with the {periodLabel}
        </Text>
      </View>

      <View className="overflow-hidden rounded-[26px] border border-[#192744] bg-[#07101F] px-5">
        <ChangeRow
          label="Time observed"
          value={comparison.totalMinutesChangePercent}
          positiveIsGood
        />

        <View className="h-[1px] bg-[#17233B]" />

        <ChangeRow
          label="Growing share"
          value={comparison.growingPercentagePointChange}
          positiveIsGood
          suffix=" pp"
        />

        <View className="h-[1px] bg-[#17233B]" />

        <ChangeRow
          label="Life Leak share"
          value={comparison.leakPercentagePointChange}
          positiveIsGood={false}
          suffix=" pp"
        />
      </View>
    </View>
  );
}
