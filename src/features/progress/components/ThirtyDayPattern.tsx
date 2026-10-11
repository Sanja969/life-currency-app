import { Text, View, StyleSheet } from "react-native";

import { formatDuration } from "@/utils/formatDuration";
import { PeriodProgressStat } from "../utils/progressStatistics";

type ThirtyDayPatternProps = {
  periods: PeriodProgressStat[];
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

const MAX_BAR_HEIGHT = 150;

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getPeriodLabel(startDate: Date, endDate: Date) {
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  if (sameMonth) {
    const month = startDate.toLocaleDateString("en-US", {
      month: "short",
    });

    return `${month} ${startDate.getDate()}–${endDate.getDate()}`;
  }

  return `${formatShortDate(startDate)}–${formatShortDate(endDate)}`;
}

export function ThirtyDayPattern({ periods }: ThirtyDayPatternProps) {
  const maxMinutes = Math.max(
    ...periods.map((period) => period.totalMinutes),
    1,
  );

  const totalMinutes = periods.reduce(
    (sum, period) => sum + period.totalMinutes,
    0,
  );

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}

      <View style={styles.sectionHeader}>
        <View style={styles.headerRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionTitle}>30-DAY PATTERN</Text>
        </View>

        <Text style={styles.sectionDescription}>
          How your tracked time changed across the last 30 days
        </Text>
      </View>

      {/* CHART */}

      <View style={styles.chartContainer}>
        <View style={styles.chartTopAccent} />

        {totalMinutes === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No activity yet</Text>

            <Text style={styles.emptyDescription}>
              Your 30-day pattern will form as you track your time.
            </Text>
          </View>
        ) : (
          <>
            {/* BARS */}

            <View style={styles.barsRow}>
              {periods.map((period, index) => {
                const totalHeight =
                  period.totalMinutes > 0
                    ? Math.max(
                        8,
                        (period.totalMinutes / maxMinutes) * MAX_BAR_HEIGHT,
                      )
                    : 4;

                const growingRatio =
                  period.totalMinutes > 0
                    ? period.growingMinutes / period.totalMinutes
                    : 0;

                const growingHeight = totalHeight * growingRatio;

                const leakHeight = totalHeight - growingHeight;

                return (
                  <View
                    key={`${period.startDate.toISOString()}-${index}`}
                    style={styles.periodColumn}
                  >
                    <Text numberOfLines={1} style={styles.durationLabel}>
                      {period.totalMinutes > 0
                        ? formatDuration(period.totalMinutes)
                        : ""}
                    </Text>

                    <View style={styles.barTrack}>
                      {period.totalMinutes > 0 ? (
                        <View
                          style={[styles.barStack, { height: totalHeight }]}
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
                  </View>
                );
              })}
            </View>

            {/* DATE LABELS */}

            <View style={styles.dateRow}>
              {periods.map((period, index) => (
                <View
                  key={`${period.startDate.toISOString()}-label-${index}`}
                  style={styles.dateColumn}
                >
                  <Text numberOfLines={2} style={styles.dateLabel}>
                    {getPeriodLabel(period.startDate, period.endDate)}
                  </Text>
                </View>
              ))}
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

                <Text style={styles.legendText}>Growing</Text>
              </View>

              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: COLORS.leaks }]}
                />

                <Text style={styles.legendText}>Life Leaks</Text>
              </View>
            </View>
          </>
        )}
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
    paddingTop: 25,
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
    height: 185,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  periodColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },

  durationLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 12,
  },

  barTrack: {
    width: 30,
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

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  dateColumn: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
  },

  dateLabel: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 12,
    textAlign: "center",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },

  emptyTitle: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "500",
  },

  emptyDescription: {
    color: COLORS.subtle,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 21,
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
