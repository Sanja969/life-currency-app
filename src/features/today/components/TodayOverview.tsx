import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { CosmicPanel } from "@/components/ui/CosmicPanel";

import { COLORS } from "@/theme/colors";
import { ActivityStatistics } from "@/types/activity";

import { formatDuration } from "@/utils/formatDuration";

type TodayOverviewProps = {
  statistics: ActivityStatistics;
};

export function TodayOverview({
  statistics,
}: TodayOverviewProps) {
  /*
   * TRACKED TIME
   */

  const hasTrackedTime = statistics.totalDurationMinutes > 0;

  /*
   * GROWTH + RESTORATION
   *
   * Time the user has classified as
   * Growing or Restoring.
   *
   * This is not an objective measurement
   * of how meaningful their day was.
   */

  const meaningfulMinutes =
    statistics.servesDurationMinutes +
    statistics.restoresDurationMinutes;

  const meaningfulPercentage = hasTrackedTime
    ? (meaningfulMinutes / statistics.totalDurationMinutes) * 100
    : 0;

  /*
   * TODAY'S DATE
   */

  const formattedDate = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  /*
   * NAVIGATION
   */

  function handleTraceActivity() {
    router.push({
      pathname: "/activities/new",
      params: {
        source: "today",
      },
    });
  }

  /*
   * RENDER
   */

  return (
    <View style={styles.container}>
      {/* DATE */}

      <View style={styles.dateRow}>
        <View style={styles.dateDot} />

        <Text style={styles.dateText}>
          TODAY · {formattedDate}
        </Text>
      </View>

      {/* HERO */}

      <Text style={styles.title}>
        Your life, today
      </Text>

      <Text style={styles.subtitle}>
        Not about doing more. About living more intentionally.
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

      {/* MAIN OVERVIEW */}

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.cosmicCardContent}
      >
        {/* TIME OBSERVED */}

        <View style={styles.timeSection}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionLabel}>
              TIME OBSERVED
            </Text>

            <Ionicons
              name="hourglass-outline"
              size={19}
              color={COLORS.gold}
            />
          </View>

          <Text style={styles.totalTime}>
            {formatDuration(statistics.totalDurationMinutes)}
          </Text>

          <Text style={styles.activityCount}>
            {hasTrackedTime
              ? `${statistics.totalActivities} ${
                  statistics.totalActivities === 1
                    ? "activity"
                    : "activities"
                } traced today`
              : "No time traced yet today"}
          </Text>
        </View>

        {/* DIVIDER */}

        <View style={styles.divider} />

        {/* GROWTH + RESTORATION */}

        <View style={styles.meaningfulSection}>
          <View style={styles.meaningfulHeader}>
            <View style={styles.meaningfulTitleRow}>
              <Ionicons
                name="sparkles-outline"
                size={16}
                color={COLORS.gold}
              />

              <Text style={styles.meaningfulLabel}>
                GROWTH + RESTORATION
              </Text>
            </View>

            <Text style={styles.meaningfulPercentage}>
              {Math.round(meaningfulPercentage)}%
            </Text>
          </View>

          {/* COMBINED DURATION */}

          <Text style={styles.meaningfulTime}>
            {formatDuration(meaningfulMinutes)}
          </Text>

          {/* DESCRIPTION */}

          <Text style={styles.meaningfulDescription}>
            {meaningfulMinutes > 0
              ? "Time you've classified as Growing or Restoring."
              : hasTrackedTime
                ? "No Growing or Restoring activities recorded yet."
                : "Start tracing activities to see how your time is distributed."}
          </Text>

          {/* PROGRESS BAR */}

          <View style={styles.meaningfulTrack}>
            {hasTrackedTime && meaningfulMinutes > 0 && (
              <View
                style={[
                  styles.meaningfulFill,
                  {
                    width: `${meaningfulPercentage}%`,
                  },
                ]}
              />
            )}
          </View>

          {/* FOOTER */}

          <View style={styles.meaningfulFooter}>
            <Text style={styles.meaningfulFooterText}>
              Growing + Restoring
            </Text>

            <Text style={styles.meaningfulFooterText}>
              Of recorded time
            </Text>
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

  // COSMIC PANEL

  cosmicCardContent: {
    padding: 0,
  },

  // TIME OBSERVED

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
    backgroundColor: COLORS.goldBorder,
    opacity: 0.45,
  },

  // GROWTH + RESTORATION

  meaningfulSection: {
    paddingHorizontal: 24,
    paddingTop: 23,
    paddingBottom: 24,
  },

  meaningfulHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  meaningfulTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },

  meaningfulLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    flexShrink: 1,
  },

  meaningfulPercentage: {
    color: COLORS.lightGold,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 10,
  },

  meaningfulTime: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "600",
    letterSpacing: -0.7,
    marginTop: 13,
  },

  meaningfulDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  // PROGRESS BAR

  meaningfulTrack: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: COLORS.border,
    marginTop: 18,
  },

  meaningfulFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  // FOOTER

  meaningfulFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  meaningfulFooterText: {
    color: COLORS.subtle,
    fontSize: 10,
  },
});