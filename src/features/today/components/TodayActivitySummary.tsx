import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";

import { ActivityClassification, ActivityStatistics } from "@/types/activity";

import { formatDuration } from "@/utils/formatDuration";

type TodayActivitySummaryProps = {
  statistics: ActivityStatistics;
};

type EnergyCardProps = {
  title: string;
  count: number;
  duration: number;
  percentage: number;
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function EnergyCard({
  title,
  count,
  duration,
  percentage,
  accent,
  icon,
}: EnergyCardProps) {
  const safePercentage = Math.max(0, Math.min(100, percentage));

  return (
    <CosmicPanel
      variant="subtle"
      accent={accent}
      onPress={() => router.push("/activities")}
      style={styles.card}
      contentStyle={styles.cardContent}
    >
      {/* CARD HEADER */}

      <View style={styles.cardRow}>
        <View
          style={[
            styles.iconContainer,
            {
              borderColor: `${accent}55`,
              backgroundColor: `${accent}15`,
            },
          ]}
        >
          <Ionicons name={icon} size={20} color={accent} />
        </View>

        {/* ACTIVITY INFO */}

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{title}</Text>

          <Text style={styles.cardSubtitle}>
            {count} {count === 1 ? "activity" : "activities"}
          </Text>
        </View>

        {/* DURATION AND PERCENTAGE */}

        <View style={styles.cardValues}>
          <Text style={styles.duration}>{formatDuration(duration)}</Text>

          <Text style={[styles.percentage, { color: accent }]}>
            {Math.round(safePercentage)}%
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={17}
          color={COLORS.subtle}
          style={styles.chevron}
        />
      </View>

      {/* ENERGY BAR */}

      <View style={styles.energyTrack}>
        <View
          style={[
            styles.energyFill,
            {
              width: `${safePercentage}%`,
              backgroundColor: accent,
            },
          ]}
        />
      </View>
    </CosmicPanel>
  );
}

export function TodayActivitySummary({
  statistics,
}: TodayActivitySummaryProps) {
  // CENTRALIZED CLASSIFICATION THEMES

  const growingTheme = CLASSIFICATION_THEME[ActivityClassification.Serves];

  const restoringTheme = CLASSIFICATION_THEME[ActivityClassification.Restores];

  const leakTheme = CLASSIFICATION_THEME[ActivityClassification.DoesNotServe];

  // STATISTICS

  const growingPercent = statistics.servesPercentage;

  const restoringPercent = statistics.restoresPercentage;

  const leakPercent = statistics.doesNotServePercentage;

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.sectionTitle}>TODAY'S ACTIVITIES</Text>

        <Pressable
          onPress={() => router.push("/activities")}
          accessibilityRole="button"
          accessibilityLabel="View all activities"
          hitSlop={10}
          style={styles.viewAll}
        >
          <Text style={styles.viewAllText}>View all</Text>

          <Ionicons name="arrow-forward" size={15} color={COLORS.gold} />
        </Pressable>
      </View>

      {/* GROWING */}

      <EnergyCard
        title={growingTheme.label}
        count={statistics.servesCount}
        duration={statistics.servesDurationMinutes}
        percentage={growingPercent}
        accent={growingTheme.color}
        icon="leaf-outline"
      />

      {/* RESTORING */}

      <EnergyCard
        title={restoringTheme.label}
        count={statistics.restoresCount}
        duration={statistics.restoresDurationMinutes}
        percentage={restoringPercent}
        accent={restoringTheme.color}
        icon="water-outline"
      />

      {/* LIFE LEAKS */}

      <EnergyCard
        title={leakTheme.label}
        count={statistics.doesNotServeCount}
        duration={statistics.doesNotServeDurationMinutes}
        percentage={leakPercent}
        accent={leakTheme.color}
        icon="flame-outline"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  // HEADER

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: COLORS.gold,
  },

  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  viewAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.lightGold,
  },

  // CARDS

  card: {
    marginBottom: 11,
  },

  cardContent: {
    paddingHorizontal: 15,
    paddingTop: 17,
    paddingBottom: 14,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  // ICON

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ACTIVITY INFO

  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.muted,
  },

  // VALUES

  cardValues: {
    alignItems: "flex-end",
  },

  duration: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
  },

  percentage: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },

  chevron: {
    marginLeft: 8,
  },

  // ENERGY BAR

  energyTrack: {
    height: 3,
    backgroundColor: "#252530",
    marginTop: 14,
    overflow: "hidden",
    borderRadius: 2,
  },

  energyFill: {
    height: "100%",
    borderRadius: 2,
  },
});
