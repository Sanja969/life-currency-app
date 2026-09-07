import { Pressable, Text, View } from "react-native";

import { ProgressPeriod } from "../hooks/useProgress";

type ProgressHeaderProps = {
  period: ProgressPeriod;
  onPeriodChange: (period: ProgressPeriod) => void;
};

export function ProgressHeader({
  period,
  onPeriodChange,
}: ProgressHeaderProps) {
  return (
    <View>
      <Text className="text-[11px] font-bold tracking-[1.6px] text-[#65728D]">
        LIFE PATTERNS
      </Text>

      <Text className="mt-3 text-[34px] font-bold leading-[40px] tracking-[-1px] text-white">
        Your progress
      </Text>

      <Text className="mt-2 text-[14px] leading-[21px] text-[#7F8CA8]">
        See how your time and energy are shaping your life.
      </Text>

      <View className="mt-6 flex-row rounded-[18px] border border-[#1B2947] bg-[#07101F] p-1">
        <PeriodButton
          label="7 Days"
          selected={period === "7days"}
          onPress={() => onPeriodChange("7days")}
        />

        <PeriodButton
          label="30 Days"
          selected={period === "30days"}
          onPress={() => onPeriodChange("30days")}
        />
      </View>
    </View>
  );
}

type PeriodButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function PeriodButton({ label, selected, onPress }: PeriodButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center rounded-[14px] py-3"
      style={({ pressed }) => ({
        backgroundColor: selected ? "rgba(82,103,221,0.22)" : "transparent",

        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Text
        className="text-[14px] font-semibold"
        style={{
          color: selected ? "#DCE2FF" : "#697792",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
