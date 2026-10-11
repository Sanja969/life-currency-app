import { StyleSheet, Text, View } from "react-native";

import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";
import { ActivityClassification } from "@/types/activity";

import { DailyProgressStat } from "../hooks/useProgress";

type WeeklyPatternProps = {
  days: DailyProgressStat[];
};

const MAX_BAR_HEIGHT = 118;

const growingTheme = CLASSIFICATION_THEME[ActivityClassification.Serves];

const restoringTheme = CLASSIFICATION_THEME[ActivityClassification.Restores];

const leakTheme = CLASSIFICATION_THEME[ActivityClassification.DoesNotServe];

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function WeeklyPattern({ days }: WeeklyPatternProps) {
  const today = new Date();

  const maxMinutes = Math.max(...days.map((day) => day.totalMinutes), 1);

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}

      <View style={styles.sectionHeader}>
        <View style={styles.headerRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionTitle}>7-DAY PATTERN</Text>
        </View>

        <Text style={styles.sectionDescription}>
          How your observed time changed each day
        </Text>
      </View>

      {/* CHART */}

      <View style={styles.chartContainer}>
        <View style={styles.chartTopAccent} />

        <View style={styles.barsRow}>
          {days.map((day) => {
            const totalHeight =
              day.totalMinutes > 0
                ? Math.max(8, (day.totalMinutes / maxMinutes) * MAX_BAR_HEIGHT)
                : 4;

            // CLASSIFICATION DURATIONS

            const growingMinutes = day.growingMinutes;
            const restoringMinutes = day.restoringMinutes;
            const leakMinutes = day.leakMinutes;

            // CLASSIFICATION RATIOS

            const growingRatio =
              day.totalMinutes > 0 ? growingMinutes / day.totalMinutes : 0;

            const restoringRatio =
              day.totalMinutes > 0 ? restoringMinutes / day.totalMinutes : 0;

            const leakRatio =
              day.totalMinutes > 0 ? leakMinutes / day.totalMinutes : 0;

            // BAR SEGMENTS

            const growingHeight = totalHeight * growingRatio;

            const restoringHeight = totalHeight * restoringRatio;

            const leakHeight = totalHeight * leakRatio;

            const isToday = isSameDay(day.date, today);

            const dayLabel = day.date.toLocaleDateString("en-US", {
              weekday: "short",
            });

            return (
              <View key={day.date.toISOString()} style={styles.dayColumn}>
                {/* BAR */}

                <View style={styles.barTrack}>
                  {day.totalMinutes > 0 ? (
                    <View style={[styles.barStack, { height: totalHeight }]}>
                      {/* LIFE LEAKS */}

                      {leakHeight > 0 && (
                        <View
                          style={{
                            height: leakHeight,
                            backgroundColor: leakTheme.color,
                          }}
                        />
                      )}

                      {/* RESTORING */}

                      {restoringHeight > 0 && (
                        <View
                          style={{
                            height: restoringHeight,
                            backgroundColor: restoringTheme.color,
                          }}
                        />
                      )}

                      {/* GROWING */}

                      {growingHeight > 0 && (
                        <View
                          style={{
                            height: growingHeight,
                            backgroundColor: growingTheme.color,
                          }}
                        />
                      )}
                    </View>
                  ) : (
                    <View style={styles.emptyBar} />
                  )}
                </View>

                {/* DAY LABEL */}

                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: isToday ? COLORS.gold : COLORS.muted,
                    },
                  ]}
                >
                  {dayLabel}
                </Text>

                {/* TODAY INDICATOR */}

                <View
                  style={[
                    styles.todayIndicator,
                    {
                      backgroundColor: isToday ? COLORS.gold : "transparent",
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {/* LEGEND */}

        <View style={styles.divider} />

        <View style={styles.legend}>
          {/* GROWING */}

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: growingTheme.color,
                },
              ]}
            />

            <Text style={styles.legendText}>Growing</Text>
          </View>

          {/* RESTORING */}

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: restoringTheme.color,
                },
              ]}
            />

            <Text style={styles.legendText}>Restoring</Text>
          </View>

          {/* LIFE LEAKS */}

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: leakTheme.color,
                },
              ]}
            />

            <Text style={styles.legendText}>Life Leaks</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },

  // HEADER

  sectionHeader: {
    marginBottom: 15,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
  },

  sectionTitle: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  sectionDescription: {
    color: COLORS.subtle,
    fontSize: 12,
    marginTop: 8,
  },

  // CHART

  chartContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 20,
    position: "relative",
  },

  chartTopAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 55,
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.65,
  },

  barsRow: {
    height: 155,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  dayColumn: {
    flex: 1,
    alignItems: "center",
  },

  barTrack: {
    width: 18,
    height: MAX_BAR_HEIGHT,
    backgroundColor: COLORS.border,
    justifyContent: "flex-end",
    overflow: "hidden",
  },

  barStack: {
    width: "100%",
    marginTop: "auto",
    overflow: "hidden",
  },

  emptyBar: {
    height: 4,
    backgroundColor: COLORS.subtle,
    marginTop: "auto",
  },

  dayLabel: {
    marginTop: 13,
    fontSize: 11,
    fontWeight: "600",
  },

  todayIndicator: {
    marginTop: 5,
    width: 3,
    height: 3,
  },

  // LEGEND

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 18,
  },

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 17,
    columnGap: 18,
    rowGap: 10,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  legendDot: {
    width: 7,
    height: 7,
  },

  legendText: {
    color: COLORS.muted,
    fontSize: 11,
  },
});
