import { Text, View, StyleSheet } from "react-native";

import { DailyProgressStat } from "../hooks/useProgress";

type WeeklyPatternProps = {
  days: DailyProgressStat[];
};

const COLORS = {
  surface: "#11141D",
  border: "#252936",
  track: "#20242F",
  growing: "#8274E8",
  leaks: "#D88455",
  gold: "#D6AD65",
  text: "#F5F0E8",
  muted: "#9295A3",
  subtle: "#686C7A",
};

const MAX_BAR_HEIGHT = 118;

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function WeeklyPattern({ days }: WeeklyPatternProps) {
  const today = new Date();

  const maxMinutes = Math.max(
    ...days.map((day) => day.totalMinutes),
    1,
  );

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}

      <View style={styles.sectionHeader}>
        <View style={styles.headerRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionTitle}>
            7-DAY PATTERN
          </Text>
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
                ? Math.max(
                    8,
                    (day.totalMinutes / maxMinutes) *
                      MAX_BAR_HEIGHT,
                  )
                : 4;

            const growingRatio =
              day.totalMinutes > 0
                ? day.growingMinutes / day.totalMinutes
                : 0;

            const growingHeight = totalHeight * growingRatio;
            const leakHeight = totalHeight - growingHeight;

            const isToday = isSameDay(day.date, today);

            const dayLabel = day.date.toLocaleDateString(
              "en-US",
              {
                weekday: "short",
              },
            );

            return (
              <View
                key={day.date.toISOString()}
                style={styles.dayColumn}
              >
                {/* BAR */}

                <View style={styles.barTrack}>
                  {day.totalMinutes > 0 ? (
                    <View
                      style={[
                        styles.barStack,
                        { height: totalHeight },
                      ]}
                    >
                      {leakHeight > 0 && (
                        <View
                          style={{
                            height: leakHeight,
                            backgroundColor: COLORS.leaks,
                          }}
                        />
                      )}

                      {growingHeight > 0 && (
                        <View
                          style={{
                            height: growingHeight,
                            backgroundColor: COLORS.growing,
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
                      color: isToday
                        ? COLORS.gold
                        : COLORS.muted,
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
                      backgroundColor: isToday
                        ? COLORS.gold
                        : "transparent",
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
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: COLORS.growing },
              ]}
            />

            <Text style={styles.legendText}>
              Growing
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: COLORS.leaks },
              ]}
            />

            <Text style={styles.legendText}>
              Life Leaks
            </Text>
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
    backgroundColor: COLORS.track,
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
    backgroundColor: "#343845",
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

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 18,
  },

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 17,
    gap: 24,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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