import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";

import { COLORS } from "@/theme/colors";

import type { ActivityCategory } from "@/types/activity";
import type { WeeklyIntentionProgress } from "@/types/weeklyIntention";

import { formatDuration } from "@/utils/formatDuration";

import { useIntentionAlignment } from "../hooks/useIntentionAlignment";

import { EnergyThread } from "./EnergyThread";

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

type CarryForwardCardProps = {
  intentions: WeeklyIntentionProgress[];
  selectedCategories: ActivityCategory[];
  isCarryingForward: boolean;
  errorMessage: string | null;
  onToggle: (category: ActivityCategory) => void;
  onContinue: () => void;
};

type IntentionAlignmentProps = {
  weekStart: string;
  isCurrentWeek: boolean;
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function formatWeekRange(weekStart: string): string {
  const [year, month, day] = weekStart.split("-").map(Number);

  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 6);

  const startLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}

// -----------------------------------------------------------------------------
// ENERGY INTENTION ROW
// -----------------------------------------------------------------------------

function IntentionRow({
  intention,
  isCurrentWeek,
}: {
  intention: WeeklyIntentionProgress;
  isCurrentWeek: boolean;
}) {
  const categoryMeta = getActivityCategoryMeta(
    intention.category,
  );

  const isMinimum = intention.direction === "at_least";

  const target = Math.max(intention.targetMinutes, 1);
  const actual = Math.max(intention.actualMinutes, 0);

  const percentage = Math.round((actual / target) * 100);

  const completed =
    isMinimum && actual >= intention.targetMinutes;

  const overLimit =
    !isMinimum && actual > intention.targetMinutes;

  const remaining = Math.max(
    intention.targetMinutes - actual,
    0,
  );

  const exceeded = Math.max(
    actual - intention.targetMinutes,
    0,
  );

  const color = isMinimum
    ? COLORS.gold
    : overLimit
      ? COLORS.leak
      : COLORS.restoring;

  let description: string;

  if (isMinimum) {
    if (completed) {
      description = "Intention fulfilled";
    } else if (isCurrentWeek) {
      description = `${formatDuration(remaining)} to go`;
    } else {
      description = `${formatDuration(remaining)} below target`;
    }
  } else if (overLimit) {
    description = `${formatDuration(exceeded)} over limit`;
  } else if (isCurrentWeek) {
    description = `${formatDuration(remaining)} left`;
  } else {
    description = "Within limit";
  }

  return (
    <View style={styles.energyRow}>
      {/* CATEGORY + PERCENTAGE */}

      <View style={styles.energyHeader}>
        <Text
          style={styles.energyCategory}
          numberOfLines={1}
        >
          {categoryMeta.label}
        </Text>

        <Text
          style={[
            styles.energyPercentage,
            { color },
          ]}
        >
          {percentage}%
          {!isMinimum ? " USED" : ""}
        </Text>
      </View>

      {/* TARGET */}

      <Text style={styles.energyTarget}>
        {isMinimum ? "At least" : "At most"}{" "}
        {formatDuration(intention.targetMinutes)} this week
      </Text>

      {/* ENERGY THREAD */}

      <View style={styles.energyThreadContainer}>
        <EnergyThread
          progress={percentage}
          color={color}
          completed={completed}
          height={34}
        />
      </View>

      {/* RECORDED + REMAINING */}

      <View style={styles.energyFooter}>
        <Text style={styles.energyRecorded}>
          {formatDuration(actual)} recorded
        </Text>

        <Text
          style={[
            styles.energyRemaining,
            {
              color: overLimit
                ? COLORS.leak
                : completed
                  ? COLORS.growing
                  : COLORS.muted,
            },
          ]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// CARRY FORWARD CARD
// -----------------------------------------------------------------------------

function CarryForwardCard({
  intentions,
  selectedCategories,
  isCarryingForward,
  errorMessage,
  onToggle,
  onContinue,
}: CarryForwardCardProps) {
  if (intentions.length === 0) {
    return null;
  }

  const selectedCount = selectedCategories.length;

  return (
    <CosmicPanel
      variant="subtle"
      accent={COLORS.gold}
      contentStyle={styles.carryContent}
    >
      {/* HEADER */}

      <View style={styles.carryHeader}>
        <View style={styles.carryIcon}>
          <Ionicons
            name="arrow-redo-outline"
            size={19}
            color={COLORS.gold}
          />
        </View>

        <View style={styles.carryHeaderText}>
          <Text style={styles.carryTitle}>
            Pick up where you left off.
          </Text>

          <Text style={styles.carryDescription}>
            Bring last week's intentions into this week.
          </Text>
        </View>
      </View>

      {/* SELECTABLE INTENTIONS */}

      <View style={styles.carryList}>
        {intentions.map((intention) => {
          const categoryMeta = getActivityCategoryMeta(
            intention.category,
          );

          const isSelected = selectedCategories.includes(
            intention.category,
          );

          const directionLabel =
            intention.direction === "at_least"
              ? "At least"
              : "At most";

          return (
            <Pressable
              key={intention.id}
              disabled={isCarryingForward}
              onPress={() => onToggle(intention.category)}
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: isSelected,
                disabled: isCarryingForward,
              }}
              style={({ pressed }) => [
                styles.carryRow,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={13}
                    color={COLORS.gold}
                  />
                )}
              </View>

              <Text
                style={styles.carryCategory}
                numberOfLines={1}
              >
                {categoryMeta.label}
              </Text>

              <Text style={styles.carryTarget}>
                {directionLabel}{" "}
                {formatDuration(intention.targetMinutes)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ERROR */}

      {errorMessage && (
        <Text style={styles.carryError}>
          {errorMessage}
        </Text>
      )}

      {/* CONTINUE ACTION */}

      <Pressable
        disabled={selectedCount === 0 || isCarryingForward}
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityState={{
          disabled: selectedCount === 0 || isCarryingForward,
        }}
        style={({ pressed }) => [
          styles.carryAction,
          (pressed || selectedCount === 0) && {
            opacity: 0.5,
          },
        ]}
      >
        {isCarryingForward ? (
          <ActivityIndicator
            size="small"
            color={COLORS.gold}
          />
        ) : (
          <>
            <Text style={styles.actionText}>
              CONTINUE SELECTED ({selectedCount})
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color={COLORS.gold}
            />
          </>
        )}
      </Pressable>
    </CosmicPanel>
  );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function IntentionAlignment({
  weekStart,
  isCurrentWeek,
}: IntentionAlignmentProps) {
  const {
    intentions,
    previousIntentions,
    selectedCategories,
    isLoading,
    isRefreshing,
    isCarryingForward,
    errorMessage,
    carryError,
    toggleCategory,
    carryForward,
  } = useIntentionAlignment({
    weekStart,
    isCurrentWeek,
  });

  const [showAll, setShowAll] = useState(false);

  const hasIntentions = intentions.length > 0;

  const hasPreviousIntentions =
    previousIntentions.length > 0;

  const visibleIntentions = showAll
    ? intentions
    : intentions.slice(0, 3);

  function openPlan() {
    router.push("/(tabs)/plan");
  }

  // ---------------------------------------------------------------------------
  // SECTION HEADER
  // ---------------------------------------------------------------------------

  const sectionHeader = (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.goldDot} />

        <Text style={styles.sectionLabel}>
          LIVING YOUR INTENTIONS
        </Text>

        {isRefreshing && (
          <ActivityIndicator
            size="small"
            color={COLORS.gold}
          />
        )}
      </View>

      <Text style={styles.sectionDescription}>
        {formatWeekRange(weekStart)}
        {"  ·  "}
        {isCurrentWeek ? "This week" : "Last week"}
      </Text>
    </View>
  );

  // ---------------------------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <View style={styles.container}>
        {sectionHeader}

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            color={COLORS.gold}
            size="small"
          />
        </View>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------------------------

  if (errorMessage) {
    return (
      <View style={styles.container}>
        {sectionHeader}

        <CosmicPanel
          variant="subtle"
          contentStyle={styles.messageContent}
        >
          <Ionicons
            name="alert-circle-outline"
            size={22}
            color={COLORS.leak}
          />

          <Text style={styles.errorText}>
            Unable to load your weekly intentions.
          </Text>
        </CosmicPanel>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // CARRY FORWARD
  // ---------------------------------------------------------------------------

  if (
    isCurrentWeek &&
    !hasIntentions &&
    hasPreviousIntentions
  ) {
    return (
      <View style={styles.container}>
        {sectionHeader}

        <CarryForwardCard
          intentions={previousIntentions}
          selectedCategories={selectedCategories}
          isCarryingForward={isCarryingForward}
          errorMessage={carryError}
          onToggle={toggleCategory}
          onContinue={carryForward}
        />

        <Pressable
          onPress={openPlan}
          accessibilityRole="button"
          style={styles.createNewLink}
        >
          <Text style={styles.createNewText}>
            CREATE A NEW INTENTION
          </Text>

          <Ionicons
            name="arrow-forward"
            size={14}
            color={COLORS.muted}
          />
        </Pressable>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------------------------

  if (!hasIntentions) {
    return (
      <View style={styles.container}>
        {sectionHeader}

        <CosmicPanel
          variant="signal"
          accent={COLORS.gold}
          contentStyle={styles.emptyContent}
        >
          <View style={styles.emptyHeader}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="compass-outline"
                size={22}
                color={COLORS.gold}
              />
            </View>

            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyTitle}>
                Give your time a direction.
              </Text>

              <Text style={styles.emptyDescription}>
                Choose what you'd like to make more room for this week.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={openPlan}
            accessibilityRole="button"
            style={styles.emptyAction}
          >
            <Text style={styles.actionText}>
              CREATE AN INTENTION
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color={COLORS.gold}
            />
          </Pressable>
        </CosmicPanel>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // INTENTIONS
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {sectionHeader}

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.panelContent}
      >
        {/* INTRO */}

        <View style={styles.intro}>
          <View style={styles.introTitleRow}>
            <Ionicons
              name="sparkles-outline"
              size={17}
              color={COLORS.gold}
            />

            <Text style={styles.introTitle}>
              Your Intentions in Motion
            </Text>
          </View>

          <Text style={styles.introDescription}>
            See how your time aligns with what matters to you.
          </Text>
        </View>

        {/* ENERGY THREADS */}

        <View style={styles.energyList}>
          {visibleIntentions.map((intention, index) => (
            <View key={intention.id}>
              {index > 0 && (
                <View style={styles.energyDivider} />
              )}

              <IntentionRow
                intention={intention}
                isCurrentWeek={isCurrentWeek}
              />
            </View>
          ))}
        </View>

        {/* SHOW ALL */}

        {intentions.length > 3 && (
          <Pressable
            onPress={() => setShowAll((current) => !current)}
            accessibilityRole="button"
            accessibilityState={{
              expanded: showAll,
            }}
            style={({ pressed }) => [
              styles.showAllAction,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.showAllText}>
              {showAll
                ? "SHOW LESS"
                : `SHOW ALL (${intentions.length})`}
            </Text>

            <Ionicons
              name={
                showAll
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={15}
              color={COLORS.gold}
            />
          </Pressable>
        )}

        {/* FOOTER */}

        <View style={styles.footer}>
          <Ionicons
            name="information-circle-outline"
            size={13}
            color={COLORS.subtle}
          />

          <Text style={styles.footerText}>
            {isCurrentWeek
              ? "Based on recorded time · This week is still unfolding."
              : "Based on recorded time · Completed week."}
          </Text>
        </View>

        {/* PLAN LINK */}

        <Pressable
          onPress={openPlan}
          accessibilityRole="button"
          accessibilityLabel="View your weekly plan"
          style={({ pressed }) => [
            styles.planAction,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.actionText}>
            VIEW YOUR PLAN
          </Text>

          <Ionicons
            name="arrow-forward"
            size={16}
            color={COLORS.gold}
          />
        </Pressable>
      </CosmicPanel>

      {/* CARRY FORWARD */}

      {isCurrentWeek && hasPreviousIntentions && (
        <View style={styles.carrySection}>
          <CarryForwardCard
            intentions={previousIntentions}
            selectedCategories={selectedCategories}
            isCarryingForward={isCarryingForward}
            errorMessage={carryError}
            onToggle={toggleCategory}
            onContinue={carryForward}
          />
        </View>
      )}
    </View>
  );
}

// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  sectionHeader: {
    marginBottom: 13,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 5,
    height: 5,
    backgroundColor: COLORS.gold,
  },

  sectionLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  sectionDescription: {
    color: COLORS.subtle,
    fontSize: 11,
    marginTop: 7,
  },

  panelContent: {
    padding: 0,
  },

  // ---------------------------------------------------------------------------
  // INTRO
  // ---------------------------------------------------------------------------

  intro: {
    paddingHorizontal: 18,
    paddingTop: 19,
    paddingBottom: 10,
  },

  introTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  introTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
  },

  introDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
  },

  // ---------------------------------------------------------------------------
  // ENERGY THREADS
  // ---------------------------------------------------------------------------

  energyList: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },

  energyRow: {
    paddingVertical: 15,
  },

  energyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  energyCategory: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    flexShrink: 1,
  },

  energyPercentage: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  energyTarget: {
    color: COLORS.subtle,
    fontSize: 10,
    marginTop: 6,
  },

  energyThreadContainer: {
    marginTop: 8,
    width: "100%",
  },

  energyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 1,
  },

  energyRecorded: {
    color: COLORS.muted,
    fontSize: 10,
    flexShrink: 1,
  },

  energyRemaining: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "right",
    flexShrink: 1,
  },

  energyDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.45,
  },

  // ---------------------------------------------------------------------------
  // SHOW ALL
  // ---------------------------------------------------------------------------

  showAllAction: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  showAllText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  // ---------------------------------------------------------------------------
  // FOOTER
  // ---------------------------------------------------------------------------

  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  footerText: {
    flex: 1,
    color: COLORS.subtle,
    fontSize: 10,
    lineHeight: 16,
  },

  planAction: {
    borderTopWidth: 1,
    borderTopColor: COLORS.goldBorder,
    minHeight: 49,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  actionText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.3,
  },

  // ---------------------------------------------------------------------------
  // LOADING + ERROR
  // ---------------------------------------------------------------------------

  loadingContainer: {
    paddingVertical: 28,
    alignItems: "center",
  },

  messageContent: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  errorText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
  },

  // ---------------------------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------------------------

  emptyContent: {
    padding: 19,
  },

  emptyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
  },

  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTextContainer: {
    flex: 1,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },

  emptyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },

  // ---------------------------------------------------------------------------
  // CARRY FORWARD
  // ---------------------------------------------------------------------------

  carrySection: {
    marginTop: 14,
  },

  carryContent: {
    padding: 18,
  },

  carryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  carryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  carryHeaderText: {
    flex: 1,
  },

  carryTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },

  carryDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  carryList: {
    marginTop: 17,
    gap: 7,
  },

  carryRow: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.muted,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxSelected: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldBorder,
  },

  carryCategory: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },

  carryTarget: {
    color: COLORS.muted,
    fontSize: 10,
  },

  carryAction: {
    marginTop: 17,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.goldBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 35,
  },

  carryError: {
    color: COLORS.leak,
    fontSize: 11,
    marginTop: 12,
  },

  createNewLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
  },

  createNewText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
});