import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { CosmicPanel } from "@/components/ui/CosmicPanel";

import { COLORS } from "@/theme/colors";
import { ActivityCategory } from "@/types/activity";

import type { WeeklyIntentionProgress } from "@/types/weeklyIntention";

import { AddIntentionModal } from "./components/AddIntentionModal";
import { WeeklyIntentionCard } from "./components/WeeklyIntentionCard";

import { useWeeklyIntentions } from "./hooks/useWeeklyIntentions";
import { getWeekStart } from "./utils/weekUtils";
import { ScreenHeader } from "@/components/layout/ScreenHeader";

/*
 * CONSTANTS
 */

const FLOATING_BUTTON_SIZE = 52;

const WEEK_ARROW_BACKGROUND = COLORS.goldBackground;

/*
 * HELPERS
 */

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

/*
 * ALIGNMENT STAT
 */

type AlignmentStatProps = {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
};

function AlignmentStat({ label, value, icon, color }: AlignmentStatProps) {
  return (
    <View style={styles.alignmentStat}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={17} color={color} />

        <Text style={styles.statValue}>{value}</Text>
      </View>

      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/*
 * PLAN SCREEN
 */

export default function PlanScreen() {
  const {
    weekStart,
    intentions,
    intentionSummary,

    isLoading,
    isSaving,
    errorMessage,

    previousWeek,
    nextWeek,
    goToCurrentWeek,

    saveIntention,
    deleteIntention,
    refresh,
  } = useWeeklyIntentions();

  /*
   * LOCAL STATE
   */

  const [modalVisible, setModalVisible] = useState(false);

  const [editingIntention, setEditingIntention] =
    useState<WeeklyIntentionProgress | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  /*
   * DERIVED VALUES
   */

  const isCurrentWeek = weekStart === getWeekStart();

  const hasIntentions = intentions.length > 0;

  const usedCategories = new Set(
    intentions.map((intention) => intention.category),
  );

  const allCategoriesUsed =
    usedCategories.size >= Object.values(ActivityCategory).length;

  const isBusy = isSaving || isDeleting;

  /*
   * MODAL ACTIONS
   */

  function openAddModal() {
    if (isBusy) return;

    setEditingIntention(null);
    setModalVisible(true);
  }

  function openEditModal(intention: WeeklyIntentionProgress) {
    if (isBusy) return;

    setEditingIntention(intention);
    setModalVisible(true);
  }

  function closeModal() {
    if (isBusy) return;

    setModalVisible(false);
    setEditingIntention(null);
  }

  /*
   * DELETE INTENTION
   */

  function handleDelete(category: ActivityCategory) {
    if (isBusy) return;

    Alert.alert(
      "Delete intention?",
      "This removes the intention, but your tracked activities remain unchanged.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (isBusy) return;

            try {
              setIsDeleting(true);

              await deleteIntention(category);
            } catch (error) {
              console.error("Failed to delete intention:", error);

              Alert.alert(
                "Unable to delete",
                "Your intention could not be deleted.",
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }

  /*
   * RENDER
   */

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <ScreenHeader
              eyebrow="YOUR LIFE DIRECTION"
              title="Your "
              highlightedTitle="Plan"
              subtitle="Make room for what matters."
            />
          </View>

          {/* WEEK NAVIGATION */}

          <View style={styles.weekSection}>
            <View style={styles.weekLabelRow}>
              <Text style={styles.sectionLabel}>
                {isCurrentWeek ? "THIS WEEK" : "SELECTED WEEK"}
              </Text>

              {!isCurrentWeek && (
                <Pressable
                  onPress={goToCurrentWeek}
                  disabled={isBusy}
                  accessibilityRole="button"
                  accessibilityLabel="Back to this week"
                  hitSlop={8}
                >
                  <Text style={styles.backToCurrent}>Back to this week</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.weekNavigation}>
              {/* PREVIOUS WEEK */}

              <Pressable
                onPress={previousWeek}
                disabled={isBusy}
                accessibilityRole="button"
                accessibilityLabel="Previous week"
                style={({ pressed }) => [
                  styles.weekArrow,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="chevron-back" size={20} color={COLORS.gold} />
              </Pressable>

              {/* WEEK RANGE */}

              <View style={styles.weekCenter}>
                <Text style={styles.weekRange}>
                  {formatWeekRange(weekStart)}
                </Text>

                <Text style={styles.weekSubtitle}>
                  {isCurrentWeek
                    ? "Your current intentions"
                    : "Weekly intentions"}
                </Text>
              </View>

              {/* NEXT WEEK */}

              <Pressable
                onPress={nextWeek}
                disabled={isBusy}
                accessibilityRole="button"
                accessibilityLabel="Next week"
                style={({ pressed }) => [
                  styles.weekArrow,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.gold}
                />
              </Pressable>
            </View>
          </View>

          {/* LOADING */}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.gold} />
            </View>
          )}

          {/* ERROR */}

          {!isLoading && errorMessage && (
            <CosmicPanel
              variant="signal"
              accent={COLORS.leak}
              style={styles.errorPanel}
              contentStyle={styles.errorContent}
            >
              <Text style={styles.errorText}>{errorMessage}</Text>

              <Pressable
                onPress={() => void refresh()}
                accessibilityRole="button"
                accessibilityLabel="Try loading intentions again"
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </CosmicPanel>
          )}

          {/* WEEKLY ALIGNMENT */}

          {!isLoading && !errorMessage && hasIntentions && (
            <CosmicPanel
              variant="default"
              accent={COLORS.gold}
              style={styles.alignmentPanel}
              contentStyle={styles.alignmentContent}
            >
              {/* PANEL HEADER */}

              <View style={styles.alignmentHeader}>
                <View>
                  <Text style={styles.alignmentLabel}>WEEKLY ALIGNMENT</Text>

                  <Text style={styles.alignmentSubtitle}>
                    Your intentions at a glance
                  </Text>
                </View>

                <Ionicons
                  name="compass-outline"
                  size={21}
                  color={COLORS.gold}
                />
              </View>

              {/* TOTAL INTENTIONS */}

              <View style={styles.totalRow}>
                <Text style={styles.totalValue}>{intentionSummary.total}</Text>

                <View style={styles.totalDescription}>
                  <Text style={styles.totalTitle}>
                    {intentionSummary.total === 1
                      ? "Weekly intention"
                      : "Weekly intentions"}
                  </Text>

                  <Text style={styles.totalCaption}>
                    Shaping how you spend your time
                  </Text>
                </View>
              </View>

              {/* DIVIDER */}

              <View style={styles.alignmentDivider} />

              {/* STATUS GRID */}

              <View style={styles.statsGrid}>
                <AlignmentStat
                  label="Reached"
                  value={intentionSummary.reached}
                  icon="checkmark-circle-outline"
                  color={COLORS.restoring}
                />

                <AlignmentStat
                  label="In progress"
                  value={intentionSummary.inProgress}
                  icon="time-outline"
                  color={COLORS.gold}
                />

                <AlignmentStat
                  label="Within limit"
                  value={intentionSummary.withinLimit}
                  icon="shield-checkmark-outline"
                  color={COLORS.growing}
                />

                <AlignmentStat
                  label="Over limit"
                  value={intentionSummary.overLimit}
                  icon="alert-circle-outline"
                  color={COLORS.leak}
                />
              </View>

              {/* ALIGNMENT NOTE */}

              <Text style={styles.alignmentNote}>
                Based on the activities you've recorded. Your intentions are a
                guide, not a judgment.
              </Text>
            </CosmicPanel>
          )}

          {/* INTENTIONS HEADER */}

          {!isLoading && !errorMessage && (
            <View style={styles.intentionsHeader}>
              <Text style={styles.sectionLabel}>YOUR WEEKLY INTENTIONS</Text>

              <Text style={styles.intentionCount}>
                {intentions.length}{" "}
                {intentions.length === 1 ? "intention" : "intentions"}
              </Text>
            </View>
          )}

          {/* EMPTY STATE */}

          {!isLoading && !errorMessage && !hasIntentions && (
            <CosmicPanel variant="signal" contentStyle={styles.emptyContent}>
              <Ionicons name="compass-outline" size={30} color={COLORS.gold} />

              <Text style={styles.emptyTitle}>Start with an intention</Text>

              <Text style={styles.emptyDescription}>
                Choose where you want to dedicate more time or set a healthy
                limit. Small intentions can lead to meaningful changes.
              </Text>
            </CosmicPanel>
          )}

          {/* INTENTION LIST */}

          {!isLoading &&
            !errorMessage &&
            intentions.map((intention) => (
              <WeeklyIntentionCard
                key={intention.id}
                intention={intention}
                onEdit={() => openEditModal(intention)}
                onDelete={() => handleDelete(intention.category)}
              />
            ))}

          {/* FOOTER */}

          {!isLoading && !errorMessage && (
            <Text style={styles.footer}>
              Progress is about intention, not perfection.
            </Text>
          )}
        </ScrollView>

        {/* FLOATING ADD BUTTON */}

        {!isLoading && !errorMessage && !allCategoriesUsed && (
          <Pressable
            onPress={openAddModal}
            disabled={isBusy}
            accessibilityRole="button"
            accessibilityLabel="Add intention"
            style={({ pressed }) => [
              styles.floatingButton,
              {
                opacity: isBusy ? 0.5 : 1,
                transform: [
                  {
                    scale: pressed ? 0.94 : 1,
                  },
                ],
                shadowOpacity: pressed ? 0.4 : 0.2,
                shadowRadius: pressed ? 16 : 10,
              },
            ]}
          >
            <Svg
              width={FLOATING_BUTTON_SIZE}
              height={FLOATING_BUTTON_SIZE}
              viewBox="0 0 52 52"
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            >
              <Path
                d="
                    M 12 0
                    L 52 0
                    L 52 40
                    L 40 52
                    L 0 52
                    L 0 12
                    Z
                  "
                fill={COLORS.gold}
                stroke={COLORS.lightGold}
                strokeWidth={1}
              />

              <Path
                d="M 12 0 L 31 0"
                stroke={COLORS.lightGold}
                strokeWidth={1.5}
              />
            </Svg>

            <Ionicons name="add" size={27} color={COLORS.background} />
          </Pressable>
        )}

        {/* ADD / EDIT MODAL */}

        <AddIntentionModal
          visible={modalVisible}
          intention={editingIntention}
          existingCategories={intentions.map((item) => item.category)}
          isSaving={isBusy}
          onClose={closeModal}
          onSave={saveIntention}
        />
      </SafeAreaView>
    </View>
  );
}

/*
 * STYLES
 */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 170,
  },

  /*
   * HEADER
   */

  header: {
    paddingTop: 12,
    paddingBottom: 30,
  },

  /*
   * WEEK NAVIGATION
   */

  weekSection: {
    marginBottom: 25,
  },

  weekLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  sectionLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  backToCurrent: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "600",
  },

  weekNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weekArrow: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    backgroundColor: WEEK_ARROW_BACKGROUND,
  },

  pressed: {
    opacity: 0.75,
  },

  weekCenter: {
    flex: 1,
    alignItems: "center",
  },

  weekRange: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },

  weekSubtitle: {
    color: COLORS.subtle,
    fontSize: 11,
    marginTop: 5,
  },

  /*
   * WEEKLY ALIGNMENT
   */

  alignmentPanel: {
    marginBottom: 30,
  },

  alignmentContent: {
    paddingHorizontal: 22,
    paddingTop: 23,
    paddingBottom: 22,
  },

  alignmentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  alignmentLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  alignmentSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 7,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    gap: 15,
  },

  totalValue: {
    color: COLORS.text,
    fontSize: 42,
    fontWeight: "600",
    letterSpacing: -1.3,
  },

  totalDescription: {
    flex: 1,
  },

  totalTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },

  totalCaption: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  alignmentDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 23,
    marginBottom: 20,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  alignmentStat: {
    width: "47%",
    backgroundColor: COLORS.goldBackground,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  statValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "600",
  },

  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 9,
  },

  alignmentNote: {
    color: COLORS.subtle,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 20,
  },

  /*
   * INTENTIONS
   */

  intentionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  intentionCount: {
    color: COLORS.subtle,
    fontSize: 11,
  },

  /*
   * EMPTY STATE
   */

  emptyContent: {
    paddingHorizontal: 24,
    paddingVertical: 34,
    alignItems: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
    marginTop: 18,
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
  },

  /*
   * LOADING / ERROR
   */

  loadingContainer: {
    paddingVertical: 45,
    alignItems: "center",
  },

  errorPanel: {
    marginTop: 24,
  },

  errorContent: {
    padding: 18,
  },

  errorText: {
    color: COLORS.leak,
    fontSize: 13,
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 14,
  },

  retryText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: "600",
  },

  /*
   * FOOTER
   */

  footer: {
    color: COLORS.subtle,
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 19,
    textAlign: "center",
    marginTop: 32,
  },

  /*
   * FLOATING BUTTON
   */

  floatingButton: {
    position: "absolute",
    bottom: 92,
    right: 20,
    width: FLOATING_BUTTON_SIZE,
    height: FLOATING_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 8,
    zIndex: 10,
  },
});
