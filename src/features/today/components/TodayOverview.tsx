import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { ActivityStatistics } from "@/types/activity";
import { formatDuration } from "@/utils/formatDuration";

const COLORS = {
  background: "#080A10",
  gold: "#D6AD65",
  lightGold: "#F3D49B",
  growing: "#8274E8",
  leak: "#D88455",
  text: "#F5F0E7",
  muted: "#9295A5",
};

type TodayOverviewProps = {
  statistics: ActivityStatistics;
};

export function TodayOverview({ statistics }: TodayOverviewProps) {
  const hasTrackedTime = statistics.totalDurationMinutes > 0;

  const growingPercent = hasTrackedTime ? statistics.servesPercentage : 0;

  const leakPercent = hasTrackedTime ? 100 - growingPercent : 0;

  const today = new Date();

  const formattedDate = today
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  function handleTraceActivity() {
    router.push({
      pathname: "/activities/new",
      params: { source: "today" },
    });
  }

  return (
    <View style={styles.container}>
      {/* DATE */}

      <View style={styles.dateRow}>
        <View style={styles.dateDot} />

        <Text style={styles.dateText}>TODAY · {formattedDate}</Text>
      </View>

      {/* HERO */}

      <Text style={styles.title}>Your life, today</Text>

      <Text style={styles.subtitle}>
        Every moment matters. See where your time goes and what it becomes.
      </Text>

      {/* TRACE ACTIVITY */}

      <AppButton
        variant="secondary"
        leadingIcon="add"
        trailingIcon="arrow-forward"
        accessibilityLabel="Trace activity"
        onPress={handleTraceActivity}
        style={styles.traceButton}
      >
        Trace activity
      </AppButton>

      {/* TIME OBSERVED — COSMIC PANEL */}

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.cosmicCardContent}
      >
        {/* TOP SECTION */}

        <View style={styles.timeSection}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionLabel}>TIME OBSERVED</Text>

            <Ionicons name="hourglass-outline" size={19} color={COLORS.gold} />
          </View>

          <Text style={styles.totalTime}>
            {formatDuration(statistics.totalDurationMinutes)}
          </Text>

          <Text style={styles.activityCount}>
            {hasTrackedTime
              ? `${statistics.totalActivities} ${
                  statistics.totalActivities === 1 ? "activity" : "activities"
                } traced today`
              : "No time traced yet today"}
          </Text>
        </View>

        {/* DIVIDER */}

        <View style={styles.divider} />

        {/* ENERGY BALANCE */}

        <View style={styles.balanceSection}>
          <Text style={styles.balanceHeading}>YOUR ENERGY BALANCE</Text>

          <View style={styles.energyRow}>
            {/* GROWING */}

            <View style={styles.energyColumn}>
              <View style={styles.energyLabelRow}>
                <View
                  style={[
                    styles.energyDot,
                    {
                      backgroundColor: COLORS.growing,
                      shadowColor: COLORS.growing,
                    },
                  ]}
                />

                <Text style={[styles.energyLabel, { color: COLORS.growing }]}>
                  GROWING
                </Text>
              </View>

              <Text style={styles.energyTime}>
                {formatDuration(statistics.servesDurationMinutes)}
              </Text>

              <Text style={styles.energyPercent}>
                {growingPercent}% of tracked time
              </Text>
            </View>

            {/* LIFE LEAKS */}

            <View style={[styles.energyColumn, styles.leakColumn]}>
              <View style={styles.energyLabelRow}>
                <Text style={[styles.energyLabel, { color: COLORS.leak }]}>
                  LIFE LEAKS
                </Text>

                <View
                  style={[
                    styles.energyDot,
                    {
                      backgroundColor: COLORS.leak,
                      shadowColor: COLORS.leak,
                    },
                  ]}
                />
              </View>

              <Text style={styles.energyTime}>
                {formatDuration(statistics.doesNotServeDurationMinutes)}
              </Text>

              <Text style={styles.energyPercent}>
                {leakPercent}% of tracked time
              </Text>
            </View>
          </View>

          {/* BALANCE BAR */}

          <View style={styles.balanceTrack}>
            {hasTrackedTime && (
              <>
                <View
                  style={[
                    styles.balanceSegment,
                    {
                      width: `${growingPercent}%`,
                      backgroundColor: COLORS.growing,
                    },
                  ]}
                />

                <View
                  style={[
                    styles.balanceSegment,
                    {
                      width: `${leakPercent}%`,
                      backgroundColor: COLORS.leak,
                    },
                  ]}
                />
              </>
            )}
          </View>

          {/* BALANCE FOOTER */}

          <View style={styles.balanceFooter}>
            <Text style={styles.balanceFooterText}>Growth</Text>

            <Text style={styles.balanceFooterText}>Life leaks</Text>
          </View>
        </View>
      </CosmicPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  // DATE

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  dateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  dateText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  // HERO

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
    lineHeight: 23,
    marginTop: 9,
    maxWidth: 420,
  },

  // TRACE ACTIVITY

  traceButton: {
    alignSelf: "flex-start",
    marginTop: 23,
    marginBottom: 25,
  },

  traceGradient: {
    minHeight: 48,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  traceIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(214,173,101,0.13)",
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  traceText: {
    color: COLORS.lightGold,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // COSMIC PANEL

  cosmicCardContent: {
    padding: 0,
  },

  // TIME SECTION

  timeSection: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 23,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  totalTime: {
    color: COLORS.text,
    fontSize: 39,
    fontWeight: "600",
    letterSpacing: -1.3,
    marginTop: 13,
  },

  activityCount: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },

  // DIVIDER

  divider: {
    height: 1,
    backgroundColor: "rgba(214,173,101,0.12)",
  },

  // ENERGY BALANCE

  balanceSection: {
    paddingHorizontal: 24,
    paddingTop: 21,
    paddingBottom: 26,
  },

  balanceHeading: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.6,
    marginBottom: 22,
  },

  energyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  energyColumn: {
    flex: 1,
    minWidth: 0,
  },

  leakColumn: {
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
    shadowOpacity: 0.65,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 0,
    },
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

  // BALANCE BAR

  balanceTrack: {
    height: 5,
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "#20212C",
    marginTop: 23,
  },

  balanceSegment: {
    height: "100%",
  },

  balanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  balanceFooterText: {
    color: COLORS.muted,
    fontSize: 10,
  },
});
