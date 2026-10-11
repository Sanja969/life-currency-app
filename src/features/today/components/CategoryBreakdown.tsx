import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { ActivityCategoryStatistics } from "@/types/activity";
import { formatDuration } from "@/utils/formatDuration";
import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { CosmicPanel } from "@/components/ui/CosmicPanel";

type CategoryBreakdownProps = {
  categories: ActivityCategoryStatistics[];
};

const COLORS = {
  surface: "#11131B",
  gold: "#D6AD65",
  growing: "#8274E8",
  leaks: "#D88455",
  text: "#F5F0E7",
  muted: "#9295A5",
};

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}

      <View style={styles.header}>
        <Text style={styles.sectionTitle}>WHERE YOUR LIFE WENT</Text>

        <Text style={styles.sectionSubtitle}>Your time across life areas</Text>
      </View>

      {/* ANALYTICS PANEL */}

      <CosmicPanel
        variant="default"
        accent="#D6AD65"
        contentStyle={{
          paddingHorizontal: 0,

          paddingVertical: 0,
        }}
      >
        {categories.map((item, index) => {
          const meta = getActivityCategoryMeta(item.category);

          const growingRatio =
            item.totalDurationMinutes > 0
              ? item.servesDurationMinutes / item.totalDurationMinutes
              : 0;

          const leakRatio = 1 - growingRatio;

          return (
            <View key={item.category}>
              <View style={styles.categoryRow}>
                {/* CATEGORY HEADER */}

                <View style={styles.rowHeader}>
                  <View style={styles.iconOuter}>
                    <View style={styles.iconInner}>
                      <Ionicons
                        name={meta.icon}
                        size={19}
                        color={COLORS.gold}
                      />
                    </View>
                  </View>

                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{meta.label}</Text>

                    <Text style={styles.categoryPercentage}>
                      {item.percentage}% of tracked time
                    </Text>
                  </View>

                  <Text style={styles.duration}>
                    {formatDuration(item.totalDurationMinutes)}
                  </Text>
                </View>

                {/* ENERGY DISTRIBUTION */}

                <View style={styles.energySection}>
                  <View style={styles.energyTrack}>
                    {item.totalDurationMinutes > 0 && (
                      <>
                        <View
                          style={[
                            styles.energySegment,
                            {
                              width: `${growingRatio * 100}%`,
                              backgroundColor: COLORS.growing,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.energySegment,
                            {
                              width: `${leakRatio * 100}%`,
                              backgroundColor: COLORS.leaks,
                            },
                          ]}
                        />
                      </>
                    )}
                  </View>

                  {/* LEGEND */}

                  <View style={styles.legend}>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: COLORS.growing },
                        ]}
                      />

                      <Text style={styles.growingText}>
                        Growing {formatDuration(item.servesDurationMinutes)}
                      </Text>
                    </View>

                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: COLORS.leaks },
                        ]}
                      />

                      <Text style={styles.leaksText}>
                        Leak {formatDuration(item.doesNotServeDurationMinutes)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* DIVIDER */}

              {index < categories.length - 1 && <View style={styles.divider} />}
            </View>
          );
        })}
      </CosmicPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
  },

  header: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: COLORS.gold,
  },

  sectionSubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.muted,
  },

  panel: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.13)",
    borderRadius: 20,
    overflow: "hidden",
  },

  categoryRow: {
    paddingHorizontal: 16,
    paddingVertical: 17,
  },

  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconOuter: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(214,173,101,0.07)",
    alignItems: "center",
    justifyContent: "center",
  },

  categoryInfo: {
    flex: 1,
    marginLeft: 12,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },

  categoryPercentage: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.muted,
  },

  duration: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8,
  },

  energySection: {
    marginLeft: 54,
    marginTop: 12,
  },

  energyTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#24232D",
    overflow: "hidden",
    flexDirection: "row",
  },

  energySegment: {
    height: "100%",
  },

  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  legendDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  growingText: {
    fontSize: 10,
    color: COLORS.growing,
  },

  leaksText: {
    fontSize: 10,
    color: COLORS.leaks,
  },

  divider: {
    height: 1,
    marginLeft: 70,
    backgroundColor: "rgba(214,173,101,0.09)",
  },
});
