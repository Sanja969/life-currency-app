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
      {/* EYEBROW */}

      <Text className="text-[10px] font-bold tracking-[2.4px] text-[#D6AD65]">
        LIFE PATTERNS
      </Text>

      {/* TITLE */}

      <Text className="mt-3 text-[34px] font-bold leading-[40px] tracking-[-1px] text-[#F5F0E8]">
        Your progress
      </Text>

      {/* DESCRIPTION */}

      <Text className="mt-2 text-[14px] leading-[21px] text-[#9295A3]">
        See how your time and energy are shaping your life.
      </Text>

      {/* PERIOD SELECTOR */}

      <View className="mt-6 flex-row rounded-[16px] border border-[#252936] bg-[#11141D] p-1">
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

function PeriodButton({
  label,
  selected,
  onPress,
}: PeriodButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="flex-1 items-center justify-center rounded-[12px] py-3"
      style={({ pressed }) => ({
        backgroundColor: selected ? "#24231F" : "transparent",
        borderWidth: 1,
        borderColor: selected ? "#665336" : "transparent",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text
        className="text-[13px] font-semibold"
        style={{
          color: selected ? "#D6AD65" : "#9295A3",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}