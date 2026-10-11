import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { COLORS } from "@/theme/colors";
import { formatDuration } from "@/utils/formatDuration";

import type { ProgressCategoryStat } from "../hooks/useProgress";

type LifeAreaBreakdownProps = {
  categories: ProgressCategoryStat[];
};

export function LifeAreaBreakdown({ categories }: LifeAreaBreakdownProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionTitle}>TIME BY LIFE AREA</Text>
        </View>

        <Text style={styles.sectionDescription}>
          Where your observed time is flowing
        </Text>
      </View>

      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="analytics-outline" size={23} color={COLORS.gold} />
          </View>

          <Text style={styles.emptyTitle}>No life areas observed yet</Text>

          <Text style={styles.emptyDescription}>
            Activities from this period will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {categories.map((item, index) => {
            const meta = getActivityCategoryMeta(item.category);

            const segments = [
              {
                key: "growing",
                minutes: item.growingMinutes,
                color: COLORS.growing,
              },
              {
                key: "restoring",
                minutes: item.restoringMinutes,
                color: COLORS.restoring,
              },
              {
                key: "leaks",
                minutes: item.leakMinutes,
                color: COLORS.leak,
              },
            ];

            return (
              <View key={item.category}>
                <View style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={meta.icon}
                        size={20}
                        color={COLORS.gold}
                      />
                    </View>

                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName} numberOfLines={1}>
                        {meta.label}
                      </Text>

                      <Text style={styles.categoryPercentage}>
                        {item.percentage}% of tracked time
                      </Text>
                    </View>

                    <Text style={styles.totalDuration}>
                      {formatDuration(item.totalMinutes)}
                    </Text>
                  </View>

                  <View style={styles.distributionBar}>
                    {item.totalMinutes > 0 &&
                      segments.map((segment) => (
                        <View
                          key={segment.key}
                          style={{
                            flex: segment.minutes,
                            height: "100%",
                            backgroundColor: segment.color,
                          }}
                        />
                      ))}
                  </View>

                  <View style={styles.durationDetails}>
                    <Text
                      style={[styles.durationText, { color: COLORS.growing }]}
                    >
                      Growing {formatDuration(item.growingMinutes)}
                    </Text>

                    <Text
                      style={[styles.durationText, { color: COLORS.restoring }]}
                    >
                      Restoring {formatDuration(item.restoringMinutes)}
                    </Text>

                    <Text style={[styles.durationText, { color: COLORS.leak }]}>
                      Leaks {formatDuration(item.leakMinutes)}
                    </Text>
                  </View>
                </View>

                {index < categories.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },

  header: {
    marginBottom: 16,
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

  list: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 18,
  },

  categoryItem: {
    paddingVertical: 20,
  },

  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.goldBackground,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  categoryInfo: {
    flex: 1,
    marginLeft: 13,
    minWidth: 0,
  },

  categoryName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },

  categoryPercentage: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },

  totalDuration: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },

  distributionBar: {
    height: 5,
    flexDirection: "row",
    backgroundColor: COLORS.border,
    overflow: "hidden",
    marginTop: 17,
    marginLeft: 55,
  },

  durationDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 8,
    marginTop: 11,
    marginLeft: 55,
  },

  durationText: {
    fontSize: 11,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 55,
  },

  emptyState: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  emptyIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.goldBackground,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
});
