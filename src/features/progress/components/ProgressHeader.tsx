import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { COLORS } from "@/theme/colors";

import type { ProgressPeriod } from "../hooks/useProgress";

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
      <View style={styles.eyebrowRow}>
        <View style={styles.goldDot} />

        <Text style={styles.eyebrow}>LIFE PATTERNS</Text>
      </View>

      <Text style={styles.title}>Your progress</Text>

      <Text style={styles.subtitle}>
        See how your time and energy are shaping your life.
      </Text>

      <View style={styles.periodSection}>
        <Text style={styles.periodLabel}>TIME FRAME</Text>

        <View style={styles.periodRow}>
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
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.periodButton,
        {
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Svg
        pointerEvents="none"
        width="100%"
        height="100%"
        viewBox="0 0 160 46"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        <Path
          d="M 10 0 L 160 0 L 160 36 L 150 46 L 0 46 L 0 10 Z"
          fill={selected ? COLORS.goldBackground : COLORS.surface}
          stroke={selected ? COLORS.goldBorder : COLORS.border}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />

        {selected && (
          <Path
            d="M 10 0 L 48 0"
            stroke={COLORS.gold}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </Svg>

      <Text
        style={[
          styles.periodButtonText,
          {
            color: selected ? COLORS.lightGold : COLORS.muted,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  title: {
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "600",
    letterSpacing: -1.1,
    marginTop: 15,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },

  periodSection: {
    marginTop: 30,
  },

  periodLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 14,
  },

  periodRow: {
    flexDirection: "row",
    gap: 10,
  },

  periodButton: {
    flex: 1,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  periodButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
