import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { COLORS } from "@/theme/colors";
import { CLASSIFICATION_THEME } from "@/theme/classification";
import { ActivityClassification, ActivityStatistics } from "@/types/activity";
import { formatDuration } from "@/utils/formatDuration";

type TodayOverviewProps = {
  statistics: ActivityStatistics;
};

type EnergyItem = {
  classification: ActivityClassification;
  minutes: number;
  percentage: number;
};

export function TodayOverview({ statistics }: TodayOverviewProps) {
  const hasTrackedTime = statistics.totalDurationMinutes > 0;

  const energyItems: EnergyItem[] = [
    {
      classification: ActivityClassification.Serves,
      minutes: statistics.servesDurationMinutes,
      percentage: statistics.servesPercentage,
    },
    {
      classification: ActivityClassification.Restores,
      minutes: statistics.restoresDurationMinutes,
      percentage: statistics.restoresPercentage,
    },
    {
      classification: ActivityClassification.DoesNotServe,
      minutes: statistics.doesNotServeDurationMinutes,
      percentage: statistics.doesNotServePercentage,
    },
  ];

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

      {/* TIME OBSERVED */}

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

          {/* THREE CLASSIFICATIONS */}

          <View style={styles.energyRow}>
            {energyItems.map((item) => {
              const theme = CLASSIFICATION_THEME[item.classification];

              return (
                <View key={item.classification} style={styles.energyColumn}>
                  {/* LABEL */}

                  <View style={styles.energyLabelRow}>
                    <View
                      style={[
                        styles.energyDot,
                        {
                          backgroundColor: theme.color,
                          shadowColor: theme.color,
                        },
                      ]}
                    />

                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={[styles.energyLabel, { color: theme.color }]}
                    >
                      {item.classification ===
                      ActivityClassification.DoesNotServe
                        ? "LIFE LEAKS"
                        : theme.shortLabel}
                    </Text>
                  </View>

                  {/* DURATION */}

                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={styles.energyTime}
                  >
                    {formatDuration(item.minutes)}
                  </Text>

                  {/* PERCENTAGE */}

                  <Text style={styles.energyPercent}>
                    {Number(item.percentage.toFixed(1))}%
                  </Text>
                </View>
              );
            })}
          </View>

          {/* THREE-COLOR BALANCE BAR */}

          <View style={styles.balanceTrack}>
            {hasTrackedTime &&
              energyItems.map((item) => {
                const theme = CLASSIFICATION_THEME[item.classification];

                return (
                  <View
                    key={item.classification}
                    style={[
                      styles.balanceSegment,
                      {
                        flexGrow: item.minutes,
                        flexBasis: 0,
                        backgroundColor: theme.color,
                      },
                    ]}
                  />
                );
              })}
          </View>

          {/* BALANCE FOOTER */}

          <View style={styles.balanceFooter}>
            <Text style={styles.balanceFooterText}>Growth</Text>

            <Text style={styles.balanceFooterText}>Restoration</Text>

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
    paddingHorizontal: 20,
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
    gap: 8,
  },

  energyColumn: {
    flex: 1,
    minWidth: 0,
  },

  energyLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  energyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOpacity: 0.65,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  energyLabel: {
    flexShrink: 1,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  energyTime: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "600",
    marginTop: 12,
  },

  energyPercent: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 6,
  },

  // BALANCE BAR

  balanceTrack: {
    height: 5,
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "#20212C",
    marginTop: 24,
  },

  balanceSegment: {
    height: "100%",
    flexShrink: 1,
  },

  // BALANCE FOOTER

  balanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 11,
  },

  balanceFooterText: {
    color: COLORS.muted,
    fontSize: 10,
  },
});
