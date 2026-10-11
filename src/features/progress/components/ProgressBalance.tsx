import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { COLORS } from "@/theme/colors";
import { formatDuration } from "@/utils/formatDuration";

import type { ProgressPeriod, ProgressStatistics } from "../hooks/useProgress";

type ProgressBalanceProps = {
  statistics: ProgressStatistics;
  period: ProgressPeriod;
};

export function ProgressBalance({ statistics, period }: ProgressBalanceProps) {
  const {
    totalMinutes,
    growingMinutes,
    restoringMinutes,
    leakMinutes,
    growingPercent,
    restoringPercent,
    leakPercent,
  } = statistics;

  const hasData = totalMinutes > 0;

  const segments = [
    {
      key: "growing",
      label: "GROWING",
      minutes: growingMinutes,
      percent: growingPercent,
      color: COLORS.growing,
    },
    {
      key: "restoring",
      label: "RESTORING",
      minutes: restoringMinutes,
      percent: restoringPercent,
      color: COLORS.restoring,
    },
    {
      key: "leaks",
      label: "LIFE LEAKS",
      minutes: leakMinutes,
      percent: leakPercent,
      color: COLORS.leak,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>LIFE BALANCE</Text>

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.panelContent}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>TIME OBSERVED</Text>

          <Ionicons name="hourglass-outline" size={19} color={COLORS.gold} />
        </View>

        <Text style={styles.totalTime}>{formatDuration(totalMinutes)}</Text>

        <Text style={styles.periodDescription}>
          {period === "7days"
            ? "over the last 7 days"
            : "over the last 30 days"}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.energyHeading}>YOUR ENERGY BALANCE</Text>

        <View style={styles.energyRow}>
          {segments.map((segment) => (
            <View key={segment.key} style={styles.energyColumn}>
              <View style={styles.energyLabelRow}>
                <View
                  style={[
                    styles.energyDot,
                    {
                      backgroundColor: segment.color,
                    },
                  ]}
                />

                <Text
                  style={[styles.energyLabel, { color: segment.color }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {segment.label}
                </Text>
              </View>

              <Text
                style={styles.energyTime}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatDuration(segment.minutes)}
              </Text>

              <Text style={styles.energyPercent}>{segment.percent}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.balanceTrack}>
          {hasData &&
            segments.map((segment) => (
              <View
                key={segment.key}
                style={{
                  flex: segment.minutes,
                  height: "100%",
                  backgroundColor: segment.color,
                }}
              />
            ))}
        </View>

        <View style={styles.balanceFooter}>
          <Text style={styles.balanceFooterText}>Growth</Text>

          <Text style={styles.balanceFooterText}>Recovery</Text>

          <Text style={styles.balanceFooterText}>Life leaks</Text>
        </View>
      </CosmicPanel>
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
    marginBottom: 13,
  },

  panelContent: {
    padding: 0,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 25,
  },

  cardLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  totalTime: {
    color: COLORS.text,
    fontSize: 39,
    fontWeight: "600",
    letterSpacing: -1.2,
    marginTop: 13,
    paddingHorizontal: 24,
  },

  periodDescription: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
    paddingHorizontal: 24,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.goldBorder,
    opacity: 0.5,
    marginTop: 24,
  },

  energyHeading: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.6,
    marginTop: 21,
    marginBottom: 22,
    paddingHorizontal: 24,
  },

  energyRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
  },

  energyColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },

  energyLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  energyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  energyLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  energyTime: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },

  energyPercent: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  balanceTrack: {
    height: 5,
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: COLORS.border,
    marginTop: 23,
    marginHorizontal: 24,
  },

  balanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginHorizontal: 24,
    marginBottom: 26,
  },

  balanceFooterText: {
    color: COLORS.muted,
    fontSize: 10,
  },
});
