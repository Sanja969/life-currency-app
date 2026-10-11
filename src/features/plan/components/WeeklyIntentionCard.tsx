import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { WeeklyIntentionProgress } from "@/types/weeklyIntention";
import { formatDuration } from "@/utils/formatDuration";

type Props = {
  intention: WeeklyIntentionProgress;
  onEdit: () => void;
  onDelete: () => void;
};

const COLORS = {
  gold: "#D6AD65",
  text: "#F5F0E8",
  muted: "#9295A3",
  subtle: "#686C7A",
  border: "#252936",
  surface: "#11141D",
  leak: "#D88455",
};

function formatCategory(category: string): string {
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function WeeklyIntentionCard({ intention, onEdit, onDelete }: Props) {
  const isCompleted = intention.actualMinutes >= intention.targetMinutes;

  const progressBarPercent = Math.min(
    Math.max(intention.progressPercent, 0),
    100,
  );

  return (
    <View style={styles.container}>
      {/* LEFT ACCENT */}

      <View style={styles.leftAccent} />

      {/* CONTENT */}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.category}>
              {formatCategory(intention.category)}
            </Text>

            <Text style={styles.description}>
              {formatDuration(intention.actualMinutes)} invested
              {" · "}
              {formatDuration(intention.targetMinutes)} intended
            </Text>
          </View>

          {/* ACTIONS */}

          <View style={styles.actions}>
            <Pressable
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${intention.category} intention`}
              hitSlop={6}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="pencil-outline" size={16} color={COLORS.gold} />
            </Pressable>

            <Pressable
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${intention.category} intention`}
              hitSlop={6}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.leak} />
            </Pressable>
          </View>
        </View>

        {/* PROGRESS */}

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressBarPercent}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.progressPercent}>
            {intention.progressPercent}%
          </Text>
        </View>

        {/* FOOTER */}

        <Text style={[styles.remaining, isCompleted && styles.completed]}>
          {isCompleted
            ? "Intention fulfilled"
            : `${formatDuration(intention.remainingMinutes)} remaining`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 120,
  },

  leftAccent: {
    width: 2,
    backgroundColor: COLORS.gold,
    opacity: 0.8,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 17,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  titleSection: {
    flex: 1,
    minWidth: 0,
  },

  category: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },

  description: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },

  actions: {
    flexDirection: "row",
    gap: 7,
  },

  actionButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#383326",
    backgroundColor: "#211D18",
  },

  pressed: {
    opacity: 0.7,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
  },

  progressTrack: {
    flex: 1,
    height: 5,
    overflow: "hidden",
    backgroundColor: COLORS.border,
  },

  progressFill: {
    height: "100%",
    backgroundColor: COLORS.gold,
  },

  progressPercent: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "600",
    minWidth: 38,
    textAlign: "right",
  },

  remaining: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 10,
  },

  completed: {
    color: COLORS.gold,
  },
});
