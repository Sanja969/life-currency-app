import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";

import { ActivityStatistics } from "@/types/activity";
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

const COLORS = {
  gold: "#D6AD65",
  growing: "#8274E8",
  leaks: "#D88455",
  text: "#F5F0E7",
  muted: "#9295A5",
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

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{title}</Text>

          <Text style={styles.cardSubtitle}>
            {count} {count === 1 ? "activity" : "activities"}
          </Text>
        </View>

        <View style={styles.cardValues}>
          <Text style={styles.duration}>{formatDuration(duration)}</Text>

          <Text style={[styles.percentage, { color: accent }]}>
            {safePercentage}%
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={17}
          color="#77716B"
          style={styles.chevron}
        />
      </View>

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
  const growingPercent = statistics.servesPercentage;

  const leakPercent =
    statistics.totalDurationMinutes > 0 ? 100 - growingPercent : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>TODAY'S ACTIVITIES</Text>

        <Pressable
          onPress={() => router.push("/activities")}
          hitSlop={10}
          style={styles.viewAll}
        >
          <Text style={styles.viewAllText}>View all</Text>

          <Ionicons name="arrow-forward" size={15} color={COLORS.gold} />
        </Pressable>
      </View>

      <EnergyCard
        title="Growing"
        count={statistics.servesCount}
        duration={statistics.servesDurationMinutes}
        percentage={growingPercent}
        accent={COLORS.growing}
        icon="leaf-outline"
      />

      <EnergyCard
        title="Life Leaks"
        count={statistics.doesNotServeCount}
        duration={statistics.doesNotServeDurationMinutes}
        percentage={leakPercent}
        accent={COLORS.leaks}
        icon="flame-outline"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

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
    color: "#F3D49B",
  },

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

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

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
