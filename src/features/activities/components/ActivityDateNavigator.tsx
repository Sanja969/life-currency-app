import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { activityService } from "@/services/ActivityService";
import { COLORS } from "@/theme/colors";
import type { Activity } from "@/types/activity";

import { ActivityMonthCalendar } from "./ActivityMonthCalendar";

type Props = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function ActivityDateNavigator({ selectedDate, onSelectDate }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const [displayedMonth, setDisplayedMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const [monthActivities, setMonthActivities] = useState<Activity[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthKey = `${displayedMonth.getFullYear()}-${displayedMonth.getMonth()}`;

  /*
   * LOAD ACTIVITIES FOR THE MONTH SHOWN IN MODAL
   */

  const loadMonth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const start = new Date(
        displayedMonth.getFullYear(),
        displayedMonth.getMonth(),
        1,
      );

      const end = new Date(
        displayedMonth.getFullYear(),
        displayedMonth.getMonth() + 1,
        1,
      );

      const result = await activityService.getOverlappingActivities(start, end);

      setMonthActivities(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load calendar.");
    } finally {
      setIsLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    if (modalVisible) {
      void loadMonth();
    }
  }, [modalVisible, loadMonth]);

  /*
   * CALENDAR ACTIONS
   */

  function openCalendar() {
    setDisplayedMonth(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );

    setModalVisible(true);
  }

  function closeCalendar() {
    setModalVisible(false);
  }

  function selectDate(date: Date) {
    onSelectDate(date);
    closeCalendar();
  }

  /*
   * LABELS
   */

  const monthLabel = selectedDate
    .toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  const dateLabel = selectedDate
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <>
      {/* COMPACT DATE NAVIGATOR */}

      <View style={styles.container}>
        <View style={styles.monthRow}>
          <Text style={styles.sectionLabel}>YOUR TIMELINE</Text>

          <Pressable
            onPress={openCalendar}
            style={styles.monthButton}
            accessibilityRole="button"
            accessibilityLabel="Choose month and date"
          >
            <Ionicons name="calendar-outline" size={14} color={COLORS.gold} />

            <Text style={styles.monthText}>{monthLabel}</Text>

            <Ionicons name="chevron-down" size={13} color={COLORS.gold} />
          </Pressable>
        </View>

        <View style={styles.dateRow}>
          <Pressable
            onPress={() => onSelectDate(addDays(selectedDate, -1))}
            accessibilityRole="button"
            accessibilityLabel="Previous day"
            style={styles.arrowButton}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.gold} />
          </Pressable>

          <CosmicPanel
            variant="subtle"
            accent={COLORS.gold}
            style={styles.selectedDate}
            contentStyle={styles.selectedDateContent}
            onPress={openCalendar}
          >
            <View style={styles.dateStar} />

            <Text style={styles.dateText}>{dateLabel}</Text>

            {isToday && <Text style={styles.todayLabel}>TODAY</Text>}
          </CosmicPanel>

          <Pressable
            onPress={() => onSelectDate(addDays(selectedDate, 1))}
            accessibilityRole="button"
            accessibilityLabel="Next day"
            style={styles.arrowButton}
          >
            <Ionicons name="chevron-forward" size={20} color={COLORS.gold} />
          </Pressable>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerStar} />
          <View style={styles.dividerLine} />
        </View>
      </View>

      {/* CELESTIAL CALENDAR MODAL */}

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeCalendar}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeCalendar} />

          <SafeAreaView style={styles.modalSafeArea}>
            <CosmicPanel
              variant="signal"
              accent={COLORS.gold}
              style={styles.modalCard}
              contentStyle={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalEyebrow}>CELESTIAL JOURNAL</Text>

                  <Text style={styles.modalTitle}>Choose a moment</Text>
                </View>

                <Pressable
                  onPress={closeCalendar}
                  accessibilityRole="button"
                  accessibilityLabel="Close calendar"
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={20} color={COLORS.gold} />
                </Pressable>
              </View>

              <ActivityMonthCalendar
                displayedMonth={displayedMonth}
                selectedDate={selectedDate}
                activities={monthActivities}
                onChangeMonth={setDisplayedMonth}
                onSelectDate={selectDate}
              />

              {isLoading && (
                <ActivityIndicator style={styles.loading} color={COLORS.gold} />
              )}

              {error && (
                <Pressable
                  onPress={() => {
                    void loadMonth();
                  }}
                  style={styles.errorContainer}
                >
                  <Text style={styles.errorText}>{error} Tap to retry.</Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => selectDate(new Date())}
                style={styles.todayButton}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={15}
                  color={COLORS.gold}
                />

                <Text style={styles.todayButtonText}>RETURN TO TODAY</Text>
              </Pressable>
            </CosmicPanel>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },

  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.6,
  },

  monthButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 8,
  },

  monthText: {
    color: COLORS.lightGold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  arrowButton: {
    width: 38,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedDate: {
    flex: 1,
  },

  selectedDateContent: {
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  dateStar: {
    width: 7,
    height: 7,
    backgroundColor: COLORS.gold,
    transform: [{ rotate: "45deg" }],
    shadowColor: COLORS.gold,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },

  dateText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },

  todayLabel: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(221,178,103,0.12)",
  },

  dividerStar: {
    width: 6,
    height: 6,
    borderWidth: 1,
    borderColor: COLORS.gold,
    transform: [{ rotate: "45deg" }],
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.78)",
    paddingHorizontal: 16,
  },

  modalSafeArea: {
    width: "100%",
  },

  modalCard: {
    width: "100%",
  },

  modalContent: {
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalEyebrow: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "600",
    marginTop: 8,
  },

  closeButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  loading: {
    marginTop: 14,
  },

  errorContainer: {
    paddingVertical: 12,
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    textAlign: "center",
  },

  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.goldBorder,
  },

  todayButtonText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
});
