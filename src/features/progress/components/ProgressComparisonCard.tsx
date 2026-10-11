import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/theme/colors";

import type { ProgressComparison, ProgressPeriod } from "../hooks/useProgress";

type ProgressComparisonCardProps = {
  comparison: ProgressComparison;
  period: ProgressPeriod;
};

type ChangeRowProps = {
  label: string;
  value: number | null;
  direction?: "positive" | "negative" | "neutral";
  suffix?: string;
  accent?: string;
};

function ChangeRow({
  label,
  value,
  direction = "neutral",
  suffix = "%",
  accent,
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

  let color: string = COLORS.muted;

  if (value !== 0) {
    if (accent) {
      color = accent;
    } else if (direction !== "neutral") {
      const improved = direction === "positive" ? value > 0 : value < 0;

      color = improved ? COLORS.growing : COLORS.leak;
    }
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
            label="Restoring share"
            value={comparison.restoringPercentagePointChange}
            suffix=" pp"
            accent={COLORS.restoring}
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
