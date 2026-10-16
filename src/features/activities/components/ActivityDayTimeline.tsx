import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";
import type { Activity } from "@/types/activity";

type Props = {
  selectedDate: Date;
  activities: Activity[];
};

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (remaining === 0) return `${hours}h`;

  return `${hours}h ${remaining}m`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getClassificationLabel(
  classification: Activity["classification"],
): string {
  switch (classification) {
    case "serves":
      return "GROWING";

    case "restores":
      return "RESTORING";

    case "does_not_serve":
      return "LIFE LEAKS";

    default:
      return "";
  }
}

export function ActivityDayTimeline({ selectedDate, activities }: Props) {
  const dayStart = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  ).getTime();

  const dayEnd = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate() + 1,
  ).getTime();

  /*
   * ONLY THE PORTION OF AN ACTIVITY
   * THAT BELONGS TO THE SELECTED DAY.
   */

  const entries = activities
    .map((activity) => {
      const start = activity.activityDate.getTime();

      const end = start + activity.durationMinutes * 60_000;

      const visibleStart = Math.max(start, dayStart);
      const visibleEnd = Math.min(end, dayEnd);

      return {
        activity,
        visibleStart,
        minutes: Math.round((visibleEnd - visibleStart) / 60_000),
      };
    })
    .filter((entry) => entry.minutes > 0)
    .sort((a, b) => a.visibleStart - b.visibleStart);

  const dateLabel = selectedDate
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  const totalMinutes = entries.reduce(
    (total, entry) => total + entry.minutes,
    0,
  );

  return (
    <View style={styles.container}>
      {/* DAY HEADER */}

      <View style={styles.dayHeader}>
        <View>
          <Text style={styles.dayEyebrow}>MOMENTS IN TIME</Text>

          <Text style={styles.dateLabel}>{dateLabel}</Text>
        </View>

        {entries.length > 0 && (
          <View style={styles.dayTotal}>
            <Text style={styles.dayTotalValue}>
              {formatMinutes(totalMinutes)}
            </Text>

            <Text style={styles.dayTotalLabel}>RECORDED</Text>
          </View>
        )}
      </View>

      {/* EMPTY DAY */}

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyOrbit}>
            <View style={styles.emptyCore} />
          </View>

          <Text style={styles.emptyTitle}>An unwritten constellation</Text>

          <Text style={styles.emptyDescription}>
            This day is waiting for its first trace.
          </Text>
        </View>
      ) : (
        /*
         * CONSTELLATION TIMELINE
         */

        <View style={styles.timeline}>
          {entries.map(({ activity, visibleStart, minutes }, index) => {
            const theme = CLASSIFICATION_THEME[activity.classification];

            const isLast = index === entries.length - 1;

            return (
              <Pressable
                key={activity.id}
                onPress={() => router.push(`/activities/${activity.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`View ${activity.title}`}
                style={({ pressed }) => [
                  styles.entry,
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                {/* TIME */}

                <View style={styles.timeColumn}>
                  <Text style={styles.time}>{formatTime(visibleStart)}</Text>
                </View>

                {/* CONSTELLATION AXIS */}

                <View style={styles.axis}>
                  <View
                    style={[
                      styles.nodeHalo,
                      {
                        borderColor: `${theme.color}55`,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.node,
                        {
                          backgroundColor: theme.color,
                          shadowColor: theme.color,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.nodeCore,
                          {
                            backgroundColor: theme.coreLight,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {!isLast && (
                    <View
                      style={[
                        styles.connection,
                        {
                          backgroundColor: `${theme.color}45`,
                        },
                      ]}
                    />
                  )}
                </View>

                {/* ACTIVITY */}

                <View style={styles.entryContent}>
                  <View style={styles.classificationRow}>
                    <Text
                      style={[
                        styles.classification,
                        {
                          color: theme.color,
                        },
                      ]}
                    >
                      {getClassificationLabel(activity.classification)}
                    </Text>

                    <View
                      style={[
                        styles.classificationLine,
                        {
                          backgroundColor: `${theme.color}35`,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.title} numberOfLines={2}>
                    {activity.title}
                  </Text>

                  <View style={styles.durationRow}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={COLORS.muted}
                    />

                    <Text style={styles.duration}>
                      {formatMinutes(minutes)}
                    </Text>
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={15}
                  color={COLORS.subtle}
                  style={styles.chevron}
                />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  /*
   * DAY HEADER
   */

  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },

  dayEyebrow: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.6,
    marginBottom: 8,
  },

  dateLabel: {
    color: COLORS.lightGold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  dayTotal: {
    alignItems: "flex-end",
  },

  dayTotalValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },

  dayTotalLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginTop: 4,
  },

  /*
   * TIMELINE
   */

  timeline: {
    paddingTop: 2,
  },

  entry: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 94,
  },

  timeColumn: {
    width: 48,
    paddingTop: 9,
  },

  time: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "500",
  },

  axis: {
    width: 28,
    alignItems: "center",
    alignSelf: "stretch",
  },

  nodeHalo: {
    width: 23,
    height: 23,
    borderRadius: 11.5,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  node: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.9,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  nodeCore: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  connection: {
    width: 1,
    flex: 1,
    marginTop: 4,
    marginBottom: 3,
  },

  /*
   * ACTIVITY CONTENT
   */

  entryContent: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 2,
    paddingBottom: 22,
  },

  classificationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  classification: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  classificationLine: {
    flex: 1,
    height: 1,
  },

  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
    marginTop: 8,
  },

  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },

  duration: {
    color: COLORS.muted,
    fontSize: 11,
  },

  chevron: {
    marginTop: 31,
    marginLeft: 6,
  },

  /*
   * EMPTY STATE
   */

  empty: {
    alignItems: "center",
    paddingVertical: 36,
  },

  emptyOrbit: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: "rgba(221, 178, 103, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    transform: [{ rotate: "35deg" }],
  },

  emptyCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
});
