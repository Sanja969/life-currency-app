import { useMemo } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import type { Activity } from "@/types/activity";

import { getActivityGaps, type ActivityGap } from "@/utils/activityGaps";

import { formatDuration } from "@/utils/formatDuration";
import { COLORS } from "@/theme/colors";

type TheSpaceBetweenProps = {
  activities: Activity[];
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function GapRow({ gap }: { gap: ActivityGap }) {
  function handlePress() {
    router.push({
      pathname: "/activities/new",
      params: {
        gapStart: gap.start.toISOString(),
        gapDuration: String(gap.durationMinutes),
      },
    });
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Remember ${formatDuration(gap.durationMinutes)} of unrecorded time`}
      style={({ pressed }) => [styles.gapRow, pressed && styles.pressed]}
    >
      <View style={styles.gapSymbol}>
        <Ionicons name="sparkles-outline" size={17} color={COLORS.gold} />
      </View>

      <View style={styles.gapContent}>
        <Text style={styles.gapTime}>
          {formatTime(gap.start)} — {formatTime(gap.end)}
        </Text>

        <Text style={styles.gapDuration}>
          {formatDuration(gap.durationMinutes)} · Unrecorded
        </Text>

        <Text style={styles.gapAction}>Remember this moment</Text>
      </View>

      <Ionicons name="add" size={20} color={COLORS.gold} />
    </Pressable>
  );
}

export function TheSpaceBetween({ activities }: TheSpaceBetweenProps) {
  const gaps = useMemo(() => getActivityGaps(activities), [activities]);

  if (gaps.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles-outline" size={15} color={COLORS.gold} />

        <Text style={styles.sectionTitle}>THE SPACE BETWEEN</Text>
      </View>

      <Text style={styles.subtitle}>Not every moment needs a label.</Text>

      <View style={styles.gapsContainer}>
        {gaps.map((gap) => (
          <GapRow key={gap.id} gap={gap} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 8,
  },

  sectionTitle: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
  },

  gapsContainer: {
    borderTopWidth: 1,
    borderTopColor: `${COLORS.gold}25`,
  },

  gapRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.gold}18`,
  },

  gapSymbol: {
    width: 36,
    alignItems: "flex-start",
  },

  gapContent: {
    flex: 1,
    gap: 5,
  },

  gapTime: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },

  gapDuration: {
    color: COLORS.muted,
    fontSize: 12,
  },

  gapAction: {
    color: COLORS.lightGold,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginTop: 3,
  },

  pressed: {
    opacity: 0.65,
  },
});
