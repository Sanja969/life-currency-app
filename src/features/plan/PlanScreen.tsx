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

import { ActivityCategory } from "@/types/activity";
import { WeeklyIntentionProgress } from "@/types/weeklyIntention";

import { formatDuration } from "@/utils/formatDuration";

import { AddIntentionModal } from "./components/AddIntentionModal";
import { WeeklyIntentionCard } from "./components/WeeklyIntentionCard";

import { useWeeklyIntentions } from "./hooks/useWeeklyIntentions";
import { getWeekStart } from "./utils/weekUtils";

const COLORS = {
  background: "#080A10",
  gold: "#D6AD65",
  lightGold: "#F3D49B",
  text: "#F5F0E8",
  muted: "#9295A3",
  subtle: "#686C7A",
  border: "#252936",
  surface: "#11141D",
  growing: "#8274E8",
};

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

export default function PlanScreen() {
  const {
    weekStart,
    intentions,
    isLoading,
    isSaving,
    errorMessage,
    totalTargetMinutes,
    totalActualMinutes,
    previousWeek,
    nextWeek,
    goToCurrentWeek,
    saveIntention,
    deleteIntention,
    refresh,
  } = useWeeklyIntentions();

  const [modalVisible, setModalVisible] = useState(false);

  const [editingIntention, setEditingIntention] =
    useState<WeeklyIntentionProgress | null>(null);

  const isCurrentWeek = weekStart === getWeekStart();

  const allCategoriesUsed =
    intentions.length === Object.values(ActivityCategory).length;

  const hasIntentions = intentions.length > 0;

  const totalProgressPercent =
    totalTargetMinutes > 0
      ? Math.round((totalActualMinutes / totalTargetMinutes) * 100)
      : 0;

  const progressBarPercent = Math.min(Math.max(totalProgressPercent, 0), 100);

  function openAddModal() {
    setEditingIntention(null);
    setModalVisible(true);
  }

  function openEditModal(intention: WeeklyIntentionProgress) {
    setEditingIntention(intention);
    setModalVisible(true);
  }

  function handleDelete(category: ActivityCategory) {
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
            try {
              await deleteIntention(category);
            } catch (error) {
              console.error("Failed to delete intention:", error);

              Alert.alert(
                "Unable to delete",
                "Your intention could not be deleted.",
              );
            }
          },
        },
      ],
    );
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.eyebrowRow}>
              <View style={styles.goldDot} />

              <Text style={styles.eyebrow}>YOUR LIFE DIRECTION</Text>
            </View>

            <Text style={styles.title}>Your Plan</Text>

            <Text style={styles.subtitle}>Make room for what matters.</Text>
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
                  accessibilityRole="button"
                  accessibilityLabel="Back to this week"
                  hitSlop={8}
                >
                  <Text style={styles.backToCurrent}>Back to this week</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.weekNavigation}>
              <Pressable
                onPress={previousWeek}
                accessibilityRole="button"
                accessibilityLabel="Previous week"
                style={({ pressed }) => [
                  styles.weekArrow,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="chevron-back" size={20} color={COLORS.gold} />
              </Pressable>

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

              <Pressable
                onPress={nextWeek}
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
              accent="#D88455"
              style={{ marginTop: 24 }}
            >
              <Text style={styles.errorText}>{errorMessage}</Text>

              <Pressable
                onPress={() => void refresh()}
                style={{ marginTop: 14 }}
              >
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </CosmicPanel>
          )}

          {/* WEEKLY INVESTMENT */}

          {!isLoading && !errorMessage && hasIntentions && (
            <CosmicPanel
              variant="default"
              accent={COLORS.gold}
              style={styles.investmentPanel}
              contentStyle={styles.investmentContent}
            >
              <View style={styles.investmentHeader}>
                <Text style={styles.investmentLabel}>
                  WEEKLY TIME INVESTMENT
                </Text>

                <Ionicons
                  name="hourglass-outline"
                  size={18}
                  color={COLORS.gold}
                />
              </View>

              <View style={styles.investmentStats}>
                <View>
                  <Text style={styles.investedValue}>
                    {formatDuration(totalActualMinutes)}
                  </Text>

                  <Text style={styles.statCaption}>Invested</Text>
                </View>

                <View style={styles.intendedColumn}>
                  <Text style={styles.intendedValue}>
                    {formatDuration(totalTargetMinutes)}
                  </Text>

                  <Text style={styles.statCaption}>Intended</Text>
                </View>
              </View>

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

              <View style={styles.progressFooter}>
                <Text style={styles.progressDescription}>
                  Of your weekly intention
                </Text>

                <Text style={styles.progressPercentage}>
                  {totalProgressPercent}%
                </Text>
              </View>
            </CosmicPanel>
          )}

          {/* SECTION HEADER */}

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
                Choose where you want to invest your time this week. Small
                intentions can lead to meaningful changes.
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
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Add intention"
            style={({ pressed }) => ({
              ...styles.floatingButton,
              opacity: isSaving ? 0.5 : 1,
              transform: [
                {
                  scale: pressed ? 0.94 : 1,
                },
              ],
              shadowOpacity: pressed ? 0.4 : 0.2,
              shadowRadius: pressed ? 16 : 10,
            })}
          >
            <Svg
              width={52}
              height={52}
              viewBox="0 0 52 52"
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            >
              <Path
                d="M 12 0 L 52 0 L 52 40 L 40 52 L 0 52 L 0 12 Z"
                fill={COLORS.gold}
                stroke={COLORS.lightGold}
                strokeWidth={1}
              />

              <Path d="M 12 0 L 31 0" stroke="#FFF0C8" strokeWidth={1.5} />
            </Svg>

            <Ionicons name="add" size={27} color={COLORS.background} />
          </Pressable>
        )}

        {/* MODAL */}

        <AddIntentionModal
          visible={modalVisible}
          intention={editingIntention}
          existingCategories={intentions.map((item) => item.category)}
          isSaving={isSaving}
          onClose={() => setModalVisible(false)}
          onSave={saveIntention}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 170,
  },

  // HEADER

  header: {
    paddingTop: 12,
    paddingBottom: 30,
  },

  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

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
    lineHeight: 22,
    marginTop: 8,
  },

  // WEEK NAVIGATION

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
    borderColor: "#383326",
    backgroundColor: "#211D18",
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

  // INVESTMENT

  investmentPanel: {
    marginBottom: 30,
  },

  investmentContent: {
    paddingHorizontal: 22,
    paddingTop: 23,
    paddingBottom: 22,
  },

  investmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  investmentLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  investmentStats: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 23,
  },

  investedValue: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: "600",
    letterSpacing: -1,
  },

  intendedValue: {
    color: COLORS.gold,
    fontSize: 25,
    fontWeight: "600",
    letterSpacing: -0.5,
  },

  intendedColumn: {
    alignItems: "flex-end",
  },

  statCaption: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },

  progressTrack: {
    height: 5,
    overflow: "hidden",
    backgroundColor: "#20212C",
    marginTop: 25,
  },

  progressFill: {
    height: "100%",
    backgroundColor: COLORS.gold,
  },

  progressFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 11,
  },

  progressDescription: {
    color: COLORS.muted,
    fontSize: 11,
  },

  progressPercentage: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "600",
  },

  // INTENTIONS

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

  // EMPTY STATE

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

  // ERROR

  loadingContainer: {
    paddingVertical: 45,
    alignItems: "center",
  },

  errorText: {
    color: "#D88455",
    fontSize: 13,
    lineHeight: 20,
  },

  retryText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: "600",
  },

  // FOOTER

  footer: {
    color: COLORS.subtle,
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 19,
    textAlign: "center",
    marginTop: 32,
  },

  // FLOATING BUTTON

  floatingButton: {
    position: "absolute",
    bottom: 92,
    right: 20,
    width: 52,
    height: 52,
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
