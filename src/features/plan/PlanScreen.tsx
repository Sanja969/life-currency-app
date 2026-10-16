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

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { CosmicPanel } from "@/components/ui/CosmicPanel";

import { COLORS } from "@/theme/colors";
import { ActivityCategory } from "@/types/activity";

import type { WeeklyIntentionProgress } from "@/types/weeklyIntention";

import { AddIntentionModal } from "./components/AddIntentionModal";
import { IntentionConstellation } from "./components/IntentionConstellation";
import { WeeklyIntentionCard } from "./components/WeeklyIntentionCard";

import { useWeeklyIntentions } from "./hooks/useWeeklyIntentions";
import { getWeekStart } from "./utils/weekUtils";

/*
 * CONSTANTS
 */

const FLOATING_BUTTON_SIZE = 52;

const WEEK_ARROW_BACKGROUND = COLORS.goldBackground;

type IntentionSegment = "grow" | "protect";

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
 * PLAN SCREEN
 */

export default function PlanScreen() {
  const {
    weekStart,
    intentions,

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

  const [activeSegment, setActiveSegment] = useState<IntentionSegment>("grow");

  /*
   * DERIVED VALUES
   */

  const isCurrentWeek = weekStart === getWeekStart();

  const hasIntentions = intentions.length > 0;

  const growIntentions = intentions.filter(
    (intention) => intention.direction === "at_least",
  );

  const protectIntentions = intentions.filter(
    (intention) => intention.direction === "at_most",
  );

  const visibleIntentions =
    activeSegment === "grow" ? growIntentions : protectIntentions;

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

          {/* INTENTION CONSTELLATION */}

          {!isLoading && !errorMessage && (
            <IntentionConstellation
              intentions={intentions}
              onAddIntention={openAddModal}
            />
          )}

          {/* INTENTIONS HEADER + SEGMENTS */}

          {!isLoading && !errorMessage && hasIntentions && (
            <>
              <View style={styles.intentionsHeader}>
                <Text style={styles.sectionLabel}>YOUR WEEKLY INTENTIONS</Text>

                <Text style={styles.intentionCount}>
                  {intentions.length}{" "}
                  {intentions.length === 1 ? "intention" : "intentions"}
                </Text>
              </View>

              {/* GROW / PROTECT SEGMENTED CONTROL */}

              <View style={styles.segmentedControl}>
                <Pressable
                  onPress={() => setActiveSegment("grow")}
                  accessibilityRole="tab"
                  accessibilityState={{
                    selected: activeSegment === "grow",
                  }}
                  style={[
                    styles.segment,
                    activeSegment === "grow" && styles.segmentActiveGrow,
                  ]}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={16}
                    color={
                      activeSegment === "grow" ? COLORS.gold : COLORS.muted
                    }
                  />

                  <Text
                    style={[
                      styles.segmentText,
                      activeSegment === "grow" && styles.segmentTextGrow,
                    ]}
                  >
                    GROW
                  </Text>

                  <View
                    style={[
                      styles.segmentBadge,
                      activeSegment === "grow" && styles.segmentBadgeGrow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentBadgeText,
                        activeSegment === "grow" && styles.segmentBadgeTextGrow,
                      ]}
                    >
                      {growIntentions.length}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => setActiveSegment("protect")}
                  accessibilityRole="tab"
                  accessibilityState={{
                    selected: activeSegment === "protect",
                  }}
                  style={[
                    styles.segment,
                    activeSegment === "protect" && styles.segmentActiveProtect,
                  ]}
                >
                  <Ionicons
                    name="shield-outline"
                    size={16}
                    color={
                      activeSegment === "protect"
                        ? COLORS.growing
                        : COLORS.muted
                    }
                  />

                  <Text
                    style={[
                      styles.segmentText,
                      activeSegment === "protect" && styles.segmentTextProtect,
                    ]}
                  >
                    PROTECT
                  </Text>

                  <View
                    style={[
                      styles.segmentBadge,
                      activeSegment === "protect" && styles.segmentBadgeProtect,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentBadgeText,
                        activeSegment === "protect" &&
                          styles.segmentBadgeTextProtect,
                      ]}
                    >
                      {protectIntentions.length}
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* FILTERED INTENTION LIST */}

              {visibleIntentions.length > 0 ? (
                <View style={styles.cardsContainer}>
                  {visibleIntentions.map((intention) => (
                    <WeeklyIntentionCard
                      key={intention.id}
                      intention={intention}
                      onEdit={() => openEditModal(intention)}
                      onDelete={() => handleDelete(intention.category)}
                    />
                  ))}
                </View>
              ) : (
                <CosmicPanel
                  variant="subtle"
                  accent={
                    activeSegment === "grow" ? COLORS.gold : COLORS.growing
                  }
                  style={styles.emptySegmentPanel}
                  contentStyle={styles.emptySegmentContent}
                >
                  <Ionicons
                    name={
                      activeSegment === "grow"
                        ? "sparkles-outline"
                        : "shield-outline"
                    }
                    size={27}
                    color={
                      activeSegment === "grow" ? COLORS.gold : COLORS.growing
                    }
                  />

                  <Text style={styles.emptySegmentTitle}>
                    {activeSegment === "grow"
                      ? "Nothing to grow yet"
                      : "No limits set yet"}
                  </Text>

                  <Text style={styles.emptySegmentDescription}>
                    {activeSegment === "grow"
                      ? "Choose where you'd like to invest more of your time."
                      : "Create a boundary for the time you want to protect."}
                  </Text>

                  {!allCategoriesUsed && (
                    <Pressable
                      onPress={openAddModal}
                      disabled={isBusy}
                      accessibilityRole="button"
                      accessibilityLabel="Add intention"
                      style={({ pressed }) => [
                        styles.emptySegmentButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons name="add" size={17} color={COLORS.gold} />

                      <Text style={styles.emptySegmentButtonText}>
                        Add intention
                      </Text>
                    </Pressable>
                  )}
                </CosmicPanel>
              )}
            </>
          )}

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
          defaultDirection={activeSegment === "grow" ? "at_least" : "at_most"}
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
   * INTENTIONS HEADER
   */

  intentionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  intentionCount: {
    color: COLORS.subtle,
    fontSize: 11,
  },

  /*
   * SEGMENTED CONTROL
   */

  segmentedControl: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    backgroundColor: COLORS.goldBackground,
  },

  segment: {
    flex: 1,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },

  segmentActiveGrow: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.goldBorder,
  },

  segmentActiveProtect: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.growing,
  },

  segmentText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
  },

  segmentTextGrow: {
    color: COLORS.gold,
  },

  segmentTextProtect: {
    color: COLORS.growing,
  },

  segmentBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: COLORS.border,
  },

  segmentBadgeGrow: {
    backgroundColor: COLORS.goldBackground,
  },

  segmentBadgeProtect: {
    backgroundColor: COLORS.goldBackground,
  },

  segmentBadgeText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  segmentBadgeTextGrow: {
    color: COLORS.gold,
  },

  segmentBadgeTextProtect: {
    color: COLORS.growing,
  },

  cardsContainer: {
    marginTop: 2,
  },

  /*
   * EMPTY SEGMENT
   */

  emptySegmentPanel: {
    marginBottom: 12,
  },

  emptySegmentContent: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 32,
  },

  emptySegmentTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
  },

  emptySegmentDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
  },

  emptySegmentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    backgroundColor: COLORS.goldBackground,
  },

  emptySegmentButtonText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "600",
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
