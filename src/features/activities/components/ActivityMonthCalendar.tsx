import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";
import type { Activity } from "@/types/activity";

import { isSameCalendarDay } from "../hooks/useCalendarActivities";

type Props = {
  displayedMonth: Date;
  selectedDate: Date;
  activities: Activity[];
  onChangeMonth: (date: Date) => void;
  onSelectDate: (date: Date) => void;
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const CLASSIFICATION_ORDER = ["serves", "restores", "does_not_serve"] as const;

function getDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function ActivityMonthCalendar({
  displayedMonth,
  selectedDate,
  activities,
  onChangeMonth,
  onSelectDate,
}: Props) {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();

  const selectionScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    selectionScale.setValue(0.88);

    Animated.spring(selectionScale, {
      toValue: 1,
      friction: 6,
      tension: 110,
      useNativeDriver: true,
    }).start();
  }, [selectedDate.getTime(), selectionScale]);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const leadingDays = (firstDay.getDay() + 6) % 7;

    const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const day = index - leadingDays + 1;

      if (day < 1 || day > daysInMonth) {
        return null;
      }

      return new Date(year, month, day);
    });
  }, [year, month]);

  const dayClassifications = useMemo(() => {
    const result = new Map<string, Set<string>>();

    const monthStart = new Date(year, month, 1).getTime();

    const monthEnd = new Date(year, month + 1, 1).getTime();

    for (const activity of activities) {
      const start = activity.activityDate.getTime();

      const end = start + activity.durationMinutes * 60_000;

      if (start >= monthEnd || end <= monthStart) {
        continue;
      }

      const visibleStart = Math.max(start, monthStart);

      const visibleEnd = Math.min(end, monthEnd);

      let cursor = new Date(visibleStart);

      cursor = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
      );

      while (cursor.getTime() < visibleEnd) {
        const key = getDateKey(cursor);

        const classifications = result.get(key) ?? new Set<string>();

        classifications.add(activity.classification);

        result.set(key, classifications);

        cursor = new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          cursor.getDate() + 1,
        );
      }
    }

    return result;
  }, [activities, year, month]);

  const monthLabel = displayedMonth
    .toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  function changeMonth(offset: number) {
    onChangeMonth(new Date(year, month + offset, 1));
  }

  const today = new Date();

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        <Pressable
          onPress={() => changeMonth(-1)}
          accessibilityLabel="Previous month"
          accessibilityRole="button"
          hitSlop={12}
          style={styles.navigationButton}
        >
          <Ionicons name="chevron-back" size={19} color={COLORS.gold} />
        </Pressable>

        <View style={styles.monthTitleContainer}>
          <View style={styles.monthDecoration} />

          <Text style={styles.month}>{monthLabel}</Text>

          <View style={styles.monthDecoration} />
        </View>

        <Pressable
          onPress={() => changeMonth(1)}
          accessibilityLabel="Next month"
          accessibilityRole="button"
          hitSlop={12}
          style={styles.navigationButton}
        >
          <Ionicons name="chevron-forward" size={19} color={COLORS.gold} />
        </Pressable>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((day, index) => (
          <Text key={index} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const selected = isSameCalendarDay(date, selectedDate);

          const isToday = isSameCalendarDay(date, today);

          const classifications = dayClassifications.get(getDateKey(date));

          const colors = CLASSIFICATION_ORDER.filter((classification) =>
            classifications?.has(classification),
          ).map((classification) => CLASSIFICATION_THEME[classification].color);

          return (
            <Pressable
              key={getDateKey(date)}
              onPress={() => onSelectDate(date)}
              accessibilityRole="button"
              accessibilityLabel={date.toDateString()}
              accessibilityState={{
                selected,
              }}
              style={styles.dayCell}
            >
              <View style={styles.dateArea}>
                {selected && (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.selectedHalo,
                      {
                        transform: [
                          {
                            scale: selectionScale,
                          },
                        ],
                      },
                    ]}
                  />
                )}

                {selected && (
                  <View pointerEvents="none" style={styles.orbitRing} />
                )}

                <Animated.View
                  style={[
                    styles.dateCircle,
                    selected && styles.selectedCircle,
                    isToday && !selected && styles.todayCircle,
                    selected && {
                      transform: [
                        {
                          scale: selectionScale,
                        },
                      ],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      selected && styles.selectedDateText,
                      isToday && !selected && styles.todayDateText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </Animated.View>
              </View>

              <View style={styles.dots}>
                {colors.map((color) => (
                  <View
                    key={color}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: color,
                        shadowColor: color,
                      },
                    ]}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLine} />

        <View style={styles.footerStar}>
          <View style={styles.footerStarCore} />
        </View>

        <View style={styles.footerLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 17,
  },

  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  navigationButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  monthTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  monthDecoration: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gold,
    opacity: 0.55,
  },

  month: {
    color: COLORS.lightGold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  weekdays: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 4,
  },

  weekday: {
    flex: 1,
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: "14.285714%",
    height: 48,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  dateArea: {
    width: 40,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedHalo: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(221,178,103,0.13)",
  },

  orbitRing: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(236,196,126,0.55)",
  },

  dateCircle: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedCircle: {
    backgroundColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.45,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  todayCircle: {
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  dateText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },

  selectedDateText: {
    color: COLORS.background,
    fontWeight: "800",
  },

  todayDateText: {
    color: COLORS.lightGold,
  },

  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 7,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },

  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(221,178,103,0.12)",
  },

  footerStar: {
    width: 9,
    height: 9,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "45deg" }],
    borderWidth: 1,
    borderColor: "rgba(221,178,103,0.5)",
  },

  footerStarCore: {
    width: 2,
    height: 2,
    backgroundColor: COLORS.gold,
  },
});
