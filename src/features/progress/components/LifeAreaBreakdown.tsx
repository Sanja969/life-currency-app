import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { formatDuration } from "@/utils/formatDuration";
import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";

import { ProgressCategoryStat } from "../hooks/useProgress";

type LifeAreaBreakdownProps = {
  categories: ProgressCategoryStat[];
};

const COLORS = {
  surface: "#11141D",
  border: "#252936",
  text: "#F5F0E8",
  muted: "#9295A3",
  subtle: "#686C7A",
  gold: "#D6AD65",
  growing: "#8274E8",
  leaks: "#D88455",
  track: "#20242F",
};

export function LifeAreaBreakdown({ categories }: LifeAreaBreakdownProps) {
  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionTitle}>TIME BY LIFE AREA</Text>
        </View>

        <Text style={styles.sectionDescription}>
          Where your observed time is flowing
        </Text>
      </View>

      {/* EMPTY STATE */}

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
        /* CATEGORY LIST */

        <View style={styles.list}>
          {categories.map((item, index) => {
            const meta = getActivityCategoryMeta(item.category);

            const growingPercent =
              item.totalMinutes > 0
                ? Math.round((item.growingMinutes / item.totalMinutes) * 100)
                : 0;

            const leakPercent =
              item.totalMinutes > 0 ? 100 - growingPercent : 0;

            return (
              <View key={item.category}>
                <View style={styles.categoryItem}>
                  {/* CATEGORY HEADER */}

                  <View style={styles.categoryHeader}>
                    {/* ICON */}

                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={meta.icon}
                        size={20}
                        color={COLORS.gold}
                      />
                    </View>

                    {/* NAME + PERCENTAGE */}

                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName} numberOfLines={1}>
                        {meta.label}
                      </Text>

                      <Text style={styles.categoryPercentage}>
                        {item.percentage}% of tracked time
                      </Text>
                    </View>

                    {/* TOTAL DURATION */}

                    <Text style={styles.totalDuration}>
                      {formatDuration(item.totalMinutes)}
                    </Text>
                  </View>

                  {/* DISTRIBUTION BAR */}

                  <View style={styles.distributionBar}>
                    {item.totalMinutes > 0 && (
                      <>
                        <View
                          style={{
                            height: "100%",
                            width: `${growingPercent}%`,
                            backgroundColor: COLORS.growing,
                          }}
                        />

                        <View
                          style={{
                            height: "100%",
                            width: `${leakPercent}%`,
                            backgroundColor: COLORS.leaks,
                          }}
                        />
                      </>
                    )}
                  </View>

                  {/* DURATION DETAILS */}

                  <View style={styles.durationDetails}>
                    <Text style={styles.growingDuration}>
                      Growing {formatDuration(item.growingMinutes)}
                    </Text>

                    <Text style={styles.leakDuration}>
                      Leaks {formatDuration(item.leakMinutes)}
                    </Text>
                  </View>
                </View>

                {/* DIVIDER */}

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
    backgroundColor: "#24231F",
    borderWidth: 1,
    borderColor: "#383125",
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
    backgroundColor: COLORS.track,
    overflow: "hidden",
    marginTop: 17,
    marginLeft: 55,
  },

  durationDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 11,
    marginLeft: 55,
  },

  growingDuration: {
    color: COLORS.growing,
    fontSize: 11,
  },

  leakDuration: {
    color: COLORS.leaks,
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
    backgroundColor: "#24231F",
    borderWidth: 1,
    borderColor: "#383125",
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
