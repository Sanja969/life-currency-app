import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { formatDuration } from "@/utils/formatDuration";

import { ProgressPeriod, ProgressStatistics } from "../hooks/useProgress";

type ProgressBalanceProps = {
  statistics: ProgressStatistics;
  period: ProgressPeriod;
};

const COLORS = {
  gold: "#D6AD65",
  text: "#F5F0E8",
  muted: "#9295A3",
  growing: "#8274E8",
  leaks: "#D88455",
  border: "#252936",
};

export function ProgressBalance({ statistics, period }: ProgressBalanceProps) {
  const hasData = statistics.totalMinutes > 0;

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

        <Text style={styles.totalTime}>
          {formatDuration(statistics.totalMinutes)}
        </Text>

        <Text style={styles.periodDescription}>
          {period === "7days"
            ? "over the last 7 days"
            : "over the last 30 days"}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.energyHeading}>YOUR ENERGY BALANCE</Text>

        <View style={styles.energyRow}>
          <View style={styles.energyColumn}>
            <View style={styles.energyLabelRow}>
              <View
                style={[styles.energyDot, { backgroundColor: COLORS.growing }]}
              />

              <Text style={[styles.energyLabel, { color: COLORS.growing }]}>
                GROWING
              </Text>
            </View>

            <Text style={styles.energyTime}>
              {formatDuration(statistics.growingMinutes)}
            </Text>

            <Text style={styles.energyPercent}>
              {statistics.growingPercent}% of tracked time
            </Text>
          </View>

          <View style={styles.energyColumnRight}>
            <View style={styles.energyLabelRow}>
              <Text style={[styles.energyLabel, { color: COLORS.leaks }]}>
                LIFE LEAKS
              </Text>

              <View
                style={[styles.energyDot, { backgroundColor: COLORS.leaks }]}
              />
            </View>

            <Text style={styles.energyTime}>
              {formatDuration(statistics.leakMinutes)}
            </Text>

            <Text style={styles.energyPercent}>
              {statistics.leakPercent}% of tracked time
            </Text>
          </View>
        </View>

        <View style={styles.balanceTrack}>
          {hasData && (
            <>
              <View
                style={{
                  width: `${statistics.growingPercent}%`,
                  height: "100%",
                  backgroundColor: COLORS.growing,
                }}
              />

              <View
                style={{
                  width: `${statistics.leakPercent}%`,
                  height: "100%",
                  backgroundColor: COLORS.leaks,
                }}
              />
            </>
          )}
        </View>

        <View style={styles.balanceFooter}>
          <Text style={styles.balanceFooterText}>Growth</Text>
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
    backgroundColor: "rgba(214,173,101,0.12)",
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
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 24,
  },

  energyColumn: {
    flex: 1,
    minWidth: 0,
  },

  energyColumnRight: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },

  energyLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  energyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  energyLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  energyTime: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "600",
    marginTop: 11,
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
    backgroundColor: "#20212C",
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
