import { Ionicons } from "@expo/vector-icons";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";

import { COLORS } from "@/theme/colors";

import type { WeeklyIntentionProgress } from "@/types/weeklyIntention";

import { formatDuration } from "@/utils/formatDuration";

type Props = {
  intention: WeeklyIntentionProgress;
  onEdit: () => void;
  onDelete: () => void;
};

/*
 * HELPERS
 */

function formatCategory(category: string): string {
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function clampPercentage(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

/*
 * WEEKLY INTENTION CARD
 */

export function WeeklyIntentionCard({ intention, onEdit, onDelete }: Props) {
  const isAtMost = intention.direction === "at_most";

  const isAtLeast = !isAtMost;

  const isOverLimit =
    isAtMost && intention.actualMinutes > intention.targetMinutes;

  const isReached =
    isAtLeast && intention.actualMinutes >= intention.targetMinutes;

  const progressBarPercent = clampPercentage(intention.progressPercent);

  const categoryLabel = formatCategory(intention.category);

  /*
   * COLORS
   */

  const accentColor = isOverLimit ? COLORS.leak : COLORS.gold;

  /*
   * STATUS TEXT
   */

  let statusText = "";

  if (isAtMost) {
    if (isOverLimit) {
      const exceededMinutes = intention.actualMinutes - intention.targetMinutes;

      statusText = `${formatDuration(
        exceededMinutes,
      )} beyond your intended limit`;
    } else {
      const remainingMinutes =
        intention.targetMinutes - intention.actualMinutes;

      statusText = `${formatDuration(
        remainingMinutes,
      )} remaining within your limit`;
    }
  } else {
    if (isReached) {
      statusText = "Intention reached";
    } else {
      statusText = `${formatDuration(
        intention.remainingMinutes,
      )} to reach your intention`;
    }
  }

  /*
   * RENDER
   */

  return (
    <CosmicPanel
      variant="default"
      accent={accentColor}
      style={styles.panel}
      contentStyle={styles.content}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.titleSection}>
          {/* CATEGORY */}

          <Text style={styles.category}>{categoryLabel}</Text>

          {/* DIRECTION */}

          <View style={styles.directionRow}>
            <Ionicons
              name={
                isAtMost ? "shield-checkmark-outline" : "trending-up-outline"
              }
              size={13}
              color={accentColor}
            />

            <Text style={[styles.directionLabel, { color: accentColor }]}>
              {isAtMost ? "AT MOST" : "AT LEAST"}
            </Text>

            <Text style={styles.directionTarget}>
              {formatDuration(intention.targetMinutes)}
            </Text>
          </View>
        </View>

        {/* ACTIONS */}

        <View style={styles.actions}>
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${categoryLabel} intention`}
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
            accessibilityLabel={`Delete ${categoryLabel} intention`}
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

      {/* TIME VALUES */}

      <View style={styles.timeRow}>
        <View>
          <Text style={styles.timeLabel}>RECORDED</Text>

          <Text style={styles.actualTime}>
            {formatDuration(intention.actualMinutes)}
          </Text>
        </View>

        <View style={styles.targetColumn}>
          <Text style={styles.timeLabel}>{isAtMost ? "LIMIT" : "TARGET"}</Text>

          <Text style={styles.targetTime}>
            {formatDuration(intention.targetMinutes)}
          </Text>
        </View>
      </View>

      {/* PROGRESS */}

      <View style={styles.progressSection}>
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: progressBarPercent,
          }}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressBarPercent}%` as `${number}%`,
                backgroundColor: accentColor,
              },
            ]}
          />
        </View>

        <Text style={[styles.progressPercent, { color: accentColor }]}>
          {intention.progressPercent}%
        </Text>
      </View>

      {/* STATUS */}

      <View style={styles.statusRow}>
        <Ionicons
          name={
            isOverLimit
              ? "alert-circle-outline"
              : isReached
                ? "checkmark-circle-outline"
                : "time-outline"
          }
          size={15}
          color={
            isOverLimit ? COLORS.leak : isReached ? COLORS.gold : COLORS.muted
          }
        />

        <Text
          style={[
            styles.statusText,
            (isOverLimit || isReached) && {
              color: accentColor,
            },
          ]}
        >
          {statusText}
        </Text>
      </View>

      {/* HELPER FOR AT MOST */}

      {isAtMost && (
        <Text style={styles.limitHint}>
          {isOverLimit
            ? "Your recorded time has exceeded this limit."
            : "Based on your recorded activities so far."}
        </Text>
      )}
    </CosmicPanel>
  );
}

/*
 * STYLES
 */

const styles = StyleSheet.create({
  panel: {
    marginBottom: 12,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 19,
    paddingBottom: 18,
  },

  /*
   * HEADER
   */

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  titleSection: {
    flex: 1,
    minWidth: 0,
  },

  category: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },

  directionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },

  directionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
  },

  directionTarget: {
    color: COLORS.muted,
    fontSize: 11,
    marginLeft: 4,
  },

  /*
   * ACTIONS
   */

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
    borderColor: COLORS.goldBorder,
    backgroundColor: COLORS.goldBackground,
  },

  pressed: {
    opacity: 0.7,
  },

  /*
   * TIME VALUES
   */

  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 24,
  },

  timeLabel: {
    color: COLORS.subtle,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.3,
  },

  actualTime: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "600",
    letterSpacing: -0.6,
    marginTop: 7,
  },

  targetColumn: {
    alignItems: "flex-end",
  },

  targetTime: {
    color: COLORS.gold,
    fontSize: 21,
    fontWeight: "600",
    marginTop: 7,
  },

  /*
   * PROGRESS
   */

  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 22,
  },

  progressTrack: {
    flex: 1,
    height: 5,
    overflow: "hidden",
    backgroundColor: COLORS.border,
  },

  progressFill: {
    height: "100%",
  },

  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 45,
    textAlign: "right",
  },

  /*
   * STATUS
   */

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },

  statusText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    flex: 1,
  },

  limitHint: {
    color: COLORS.subtle,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 8,
    marginLeft: 23,
  },
});
