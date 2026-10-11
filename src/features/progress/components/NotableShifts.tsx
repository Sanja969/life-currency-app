import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { COLORS } from "@/theme/colors";
import { formatDuration } from "@/utils/formatDuration";

import type {
  ProgressCategoryTrend,
  ProgressPeriod,
} from "../hooks/useProgress";

type NotableShiftsProps = {
  trends: ProgressCategoryTrend[];
  period: ProgressPeriod;
};

type Shift = {
  key: string;
  categoryLabel: string;
  signal: "growing" | "restoring" | "leak";
  direction: "up" | "down";
  changeMinutes: number;
};

function buildNotableShifts(trends: ProgressCategoryTrend[]): Shift[] {
  const candidates: Shift[] = [];

  for (const trend of trends) {
    const meta = getActivityCategoryMeta(trend.category);

    const changes = [
      {
        signal: "growing" as const,
        minutes: trend.growingMinutesChange,
      },
      {
        signal: "restoring" as const,
        minutes: trend.restoringMinutesChange,
      },
      {
        signal: "leak" as const,
        minutes: trend.leakMinutesChange,
      },
    ];

    for (const change of changes) {
      if (change.minutes === 0) continue;

      candidates.push({
        key: `${trend.category}-${change.signal}`,
        categoryLabel: meta.label,
        signal: change.signal,
        direction: change.minutes > 0 ? "up" : "down",
        changeMinutes: Math.abs(change.minutes),
      });
    }
  }

  return candidates
    .sort((a, b) => b.changeMinutes - a.changeMinutes)
    .slice(0, 3);
}

function getShiftContent(shift: Shift) {
  if (shift.signal === "growing") {
    return {
      eyebrow:
        shift.direction === "up" ? "GROWING INCREASED" : "GROWING DECREASED",
      message:
        shift.direction === "up" ? "more Growing time" : "less Growing time",
      color: shift.direction === "up" ? COLORS.growing : COLORS.leak,
    };
  }

  if (shift.signal === "restoring") {
    return {
      eyebrow:
        shift.direction === "up"
          ? "RESTORING INCREASED"
          : "RESTORING DECREASED",
      message:
        shift.direction === "up"
          ? "more Restoring time"
          : "less Restoring time",
      color: COLORS.restoring,
    };
  }

  return {
    eyebrow:
      shift.direction === "up" ? "LIFE LEAK INCREASED" : "LIFE LEAK DECREASED",
    message:
      shift.direction === "up" ? "more Life Leak time" : "less Life Leak time",
    color: shift.direction === "up" ? COLORS.leak : COLORS.growing,
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionTitle}>NOTABLE SHIFTS</Text>
        </View>

        <Text style={styles.sectionDescription}>
          Compared with the {periodLabel}
        </Text>
      </View>

      <View style={styles.list}>
        {shifts.map((shift, index) => (
          <View key={shift.key}>
            <ShiftRow shift={shift} />

            {index < shifts.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

function ShiftRow({ shift }: { shift: Shift }) {
  const content = getShiftContent(shift);

  const iconName =
    shift.direction === "up" ? "arrow-up-outline" : "arrow-down-outline";

  const sign = shift.direction === "up" ? "+" : "−";

  return (
    <View style={styles.shiftRow}>
      <View
        style={[
          styles.accentLine,
          {
            backgroundColor: content.color,
          },
        ]}
      />

      <View style={styles.shiftContent}>
        <View style={styles.shiftTopRow}>
          <View style={styles.shiftInfo}>
            <Text style={[styles.eyebrow, { color: content.color }]}>
              {content.eyebrow}
            </Text>

            <Text style={styles.categoryName}>{shift.categoryLabel}</Text>
          </View>

          <View style={styles.changeValueRow}>
            <Ionicons name={iconName} size={16} color={content.color} />

            <Text style={[styles.changeValue, { color: content.color }]}>
              {sign}
              {formatDuration(shift.changeMinutes)}
            </Text>
          </View>
        </View>

        <Text style={styles.message}>
          {content.message} than in the previous period
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },

  header: {
    marginBottom: 15,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
  },

  sectionTitle: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  sectionDescription: {
    color: COLORS.subtle,
    fontSize: 12,
    marginTop: 8,
  },

  list: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  shiftRow: {
    flexDirection: "row",
    minHeight: 105,
  },

  accentLine: {
    width: 2,
  },

  shiftContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  shiftTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  shiftInfo: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  categoryName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },

  changeValueRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },

  changeValue: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 5,
  },

  message: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 20,
  },
});
