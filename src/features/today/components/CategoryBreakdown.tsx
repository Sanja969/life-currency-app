import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";

import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";

import {
  ActivityCategoryStatistics,
  ActivityClassification,
} from "@/types/activity";

import { formatDuration } from "@/utils/formatDuration";

type CategoryBreakdownProps = {
  categories: ActivityCategoryStatistics[];
};

const growingTheme =
  CLASSIFICATION_THEME[ActivityClassification.Serves];

const restoringTheme =
  CLASSIFICATION_THEME[ActivityClassification.Restores];

const leakTheme =
  CLASSIFICATION_THEME[ActivityClassification.DoesNotServe];

type EnergyLegendProps = {
  label: string;
  duration: number;
  color: string;
};

function EnergyLegend({
  label,
  duration,
  color,
}: EnergyLegendProps) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: color },
        ]}
      />

      <Text style={[styles.legendText, { color }]}>
        {label} {formatDuration(duration)}
      </Text>
    </View>
  );
}

export function CategoryBreakdown({
  categories,
}: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}

      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          WHERE YOUR LIFE WENT
        </Text>

        <Text style={styles.sectionSubtitle}>
          Your time across life areas
        </Text>
      </View>

      {/* ANALYTICS PANEL */}

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.panelContent}
      >
        {categories.map((item, index) => {
          const meta = getActivityCategoryMeta(
            item.category,
          );

          const total = item.totalDurationMinutes;

          // Calculate each classification independently.

          const growingRatio =
            total > 0
              ? item.servesDurationMinutes / total
              : 0;

          const restoringRatio =
            total > 0
              ? item.restoresDurationMinutes / total
              : 0;

          const leakRatio =
            total > 0
              ? item.doesNotServeDurationMinutes / total
              : 0;

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
                    <Text style={styles.categoryName}>
                      {meta.label}
                    </Text>

                    <Text style={styles.categoryPercentage}>
                      {item.percentage}% of tracked time
                    </Text>
                  </View>

                  <Text style={styles.duration}>
                    {formatDuration(total)}
                  </Text>
                </View>

                {/* ENERGY DISTRIBUTION */}

                <View style={styles.energySection}>
                  <View style={styles.energyTrack}>
                    {total > 0 && (
                      <>
                        {/* GROWING */}

                        <View
                          style={[
                            styles.energySegment,
                            {
                              width: `${growingRatio * 100}%`,
                              backgroundColor:
                                growingTheme.color,
                            },
                          ]}
                        />

                        {/* RESTORING */}

                        <View
                          style={[
                            styles.energySegment,
                            {
                              width: `${restoringRatio * 100}%`,
                              backgroundColor:
                                restoringTheme.color,
                            },
                          ]}
                        />

                        {/* LIFE LEAKS */}

                        <View
                          style={[
                            styles.energySegment,
                            {
                              width: `${leakRatio * 100}%`,
                              backgroundColor:
                                leakTheme.color,
                            },
                          ]}
                        />
                      </>
                    )}
                  </View>

                  {/* LEGEND */}

                  <View style={styles.legend}>
                    <EnergyLegend
                      label="Growing"
                      duration={
                        item.servesDurationMinutes
                      }
                      color={growingTheme.color}
                    />

                    <EnergyLegend
                      label="Restoring"
                      duration={
                        item.restoresDurationMinutes
                      }
                      color={restoringTheme.color}
                    />

                    <EnergyLegend
                      label="Leaks"
                      duration={
                        item.doesNotServeDurationMinutes
                      }
                      color={leakTheme.color}
                    />
                  </View>
                </View>
              </View>

              {/* DIVIDER */}

              {index < categories.length - 1 && (
                <View style={styles.divider} />
              )}
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

  panelContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
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
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 8,
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

  legendText: {
    fontSize: 10,
  },

  divider: {
    height: 1,
    marginLeft: 70,
    backgroundColor: "rgba(214,173,101,0.09)",
  },
});