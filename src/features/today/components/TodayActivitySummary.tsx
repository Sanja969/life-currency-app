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

type ActivityRowProps = {
  title: string;
  count: number;
  duration: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  isLast?: boolean;
};

function ActivityRow({
  title,
  count,
  duration,
  color,
  icon,
  isLast = false,
}: ActivityRowProps) {
  return (
    <Pressable
      onPress={() => router.push("/activities")}
      accessibilityRole="button"
      accessibilityLabel={`View ${title} activities`}
      style={({ pressed }) => [
        styles.activityRow,
        !isLast && styles.rowBorder,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: `${color}14`,
            borderColor: `${color}40`,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>

      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle}>{title}</Text>

        <Text style={styles.activityCount}>
          {count} {count === 1 ? "activity" : "activities"}
        </Text>
      </View>

      <Text style={styles.duration}>{formatDuration(duration)}</Text>

      <Ionicons
        name="chevron-forward"
        size={16}
        color={COLORS.subtle}
        style={styles.chevron}
      />
    </Pressable>
  );
}

export function TodayActivitySummary({
  statistics,
}: TodayActivitySummaryProps) {
  const growing = CLASSIFICATION_THEME[ActivityClassification.Serves];

  const restoring = CLASSIFICATION_THEME[ActivityClassification.Restores];

  const leaks = CLASSIFICATION_THEME[ActivityClassification.DoesNotServe];

  return (
    <View style={styles.container}>
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

      <CosmicPanel
        variant="subtle"
        accent={COLORS.gold}
        contentStyle={styles.panelContent}
      >
        <ActivityRow
          title={growing.label}
          count={statistics.servesCount}
          duration={statistics.servesDurationMinutes}
          color={growing.color}
          icon="leaf-outline"
        />

        <ActivityRow
          title={restoring.label}
          count={statistics.restoresCount}
          duration={statistics.restoresDurationMinutes}
          color={restoring.color}
          icon="water-outline"
        />

        <ActivityRow
          title={leaks.label}
          count={statistics.doesNotServeCount}
          duration={statistics.doesNotServeDurationMinutes}
          color={leaks.color}
          icon="flame-outline"
          isLast
        />
      </CosmicPanel>
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
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  viewAllText: {
    color: COLORS.lightGold,
    fontSize: 12,
    fontWeight: "600",
  },

  panelContent: {
    paddingHorizontal: 15,
    paddingVertical: 2,
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 73,
    paddingVertical: 12,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.gold}15`,
  },

  pressed: {
    opacity: 0.65,
  },

  iconContainer: {
    width: 37,
    height: 37,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },

  activityTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },

  activityCount: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },

  duration: {
    color: COLORS.lightGold,
    fontSize: 14,
    fontWeight: "600",
  },

  chevron: {
    marginLeft: 8,
  },
});
