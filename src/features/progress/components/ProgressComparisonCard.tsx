import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

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
      <View style={styles.changeRow}>
        <Text style={styles.changeLabel}>{label}</Text>
        <Text style={styles.noData}>No previous data</Text>
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
    <View style={styles.changeRow}>
      <Text style={styles.changeLabel}>{label}</Text>

      <View style={styles.changeValueRow}>
        <Ionicons name={icon} size={15} color={color} />

        <Text style={[styles.changeValue, { color }]}>
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
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>CHANGE</Text>

      <Text style={styles.sectionDescription}>
        Compared with the {periodLabel}
      </Text>

      <View style={styles.comparisonContainer}>
        <View style={styles.leftAccent} />

        <View style={styles.comparisonContent}>
          <ChangeRow
            label="Time observed"
            value={comparison.totalMinutesChangePercent}
            direction="neutral"
          />

          <View style={styles.divider} />

          <ChangeRow
            label="Growing share"
            value={comparison.growingPercentagePointChange}
            direction="positive"
            suffix=" pp"
          />

          <View style={styles.divider} />

          <ChangeRow
            label="Life Leak share"
            value={comparison.leakPercentagePointChange}
            direction="negative"
            suffix=" pp"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },

  sectionLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  sectionDescription: {
    color: COLORS.subtle,
    fontSize: 12,
    marginTop: 7,
    marginBottom: 14,
  },

  comparisonContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  leftAccent: {
    width: 2,
    backgroundColor: COLORS.gold,
    opacity: 0.8,
  },

  comparisonContent: {
    flex: 1,
    paddingHorizontal: 18,
  },

  changeRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  changeLabel: {
    color: COLORS.muted,
    fontSize: 13,
    flexShrink: 1,
  },

  changeValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  changeValue: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },

  noData: {
    color: COLORS.subtle,
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
