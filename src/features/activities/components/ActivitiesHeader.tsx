import { Ionicons } from "@expo/vector-icons";

import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import Svg, { Path } from "react-native-svg";

import { ActivityClassification } from "@/types/activity";
import { CosmicPanel } from "@/components/ui/CosmicPanel";

import { COLORS } from "@/theme/colors";
import { CLASSIFICATION_THEME } from "@/theme/classification";

import { EnergyFilter } from "./EnergyFilter";

import type { ActivityFilter } from "../hooks/useActivities";

type ActivitiesHeaderProps = {
  growingPercent: number;
  restoringPercent: number;
  leaksPercent: number;

  searchQuery: string;
  filter: ActivityFilter;
  errorMessage: string | null;

  setSearchQuery: (value: string) => void;
  setFilter: (value: ActivityFilter) => void;
};

type DistributionItem = {
  label: string;
  shortLabel: string;
  percent: number;
  color: string;
};

export function ActivitiesHeader({
  growingPercent,
  restoringPercent,
  leaksPercent,
  searchQuery,
  filter,
  errorMessage,
  setSearchQuery,
  setFilter,
}: ActivitiesHeaderProps) {
  /*
   * TIME DISTRIBUTION
   */

  const distribution: DistributionItem[] = [
    {
      label: "GROWING",
      shortLabel: "Growth",
      percent: growingPercent,
      color: CLASSIFICATION_THEME[ActivityClassification.Serves].color,
    },
    {
      label: "RESTORING",
      shortLabel: "Restoring",
      percent: restoringPercent,
      color: CLASSIFICATION_THEME[ActivityClassification.Restores].color,
    },
    {
      label: "LIFE LEAKS",
      shortLabel: "Life leaks",
      percent: leaksPercent,
      color: CLASSIFICATION_THEME[ActivityClassification.DoesNotServe].color,
    },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.eyebrowRow}>
          <View style={styles.goldDot} />

          <Text style={styles.eyebrow}>YOUR LIFE JOURNAL</Text>
        </View>

        <Text style={styles.title}>Your Life Trace</Text>

        <Text style={styles.subtitle}>Every moment leaves a trace.</Text>
      </View>

      {/* TIME DISTRIBUTION */}

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.balanceContent}
      >
        <View style={styles.balanceHeader}>
          <Text style={styles.sectionLabel}>TIME DISTRIBUTION</Text>

          <Ionicons name="analytics-outline" size={18} color={COLORS.gold} />
        </View>

        {/* THREE CLASSIFICATIONS */}

        <View style={styles.statsRow}>
          {distribution.map((item) => (
            <View key={item.label} style={styles.statColumn}>
              <View style={styles.statLabelRow}>
                <View
                  style={[
                    styles.statDot,
                    {
                      backgroundColor: item.color,
                      shadowColor: item.color,
                    },
                  ]}
                />

                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.statLabel,
                    {
                      color: item.color,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </View>

              <Text style={styles.statValue}>{item.percent}%</Text>

              <Text style={styles.statDescription}>of tracked time</Text>
            </View>
          ))}
        </View>

        {/* DISTRIBUTION BAR */}

        <View style={styles.balanceTrack}>
          {distribution.map((item) => (
            <View
              key={item.label}
              style={[
                styles.balanceSegment,
                {
                  width: `${Math.max(0, item.percent)}%` as `${number}%`,
                  backgroundColor: item.color,
                },
              ]}
            />
          ))}
        </View>

        {/* DISTRIBUTION LEGEND */}

        <View style={styles.balanceFooter}>
          {distribution.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: item.color,
                  },
                ]}
              />

              <Text style={styles.balanceFooterText}>{item.shortLabel}</Text>
            </View>
          ))}
        </View>
      </CosmicPanel>

      {/* SEARCH */}

      <View style={styles.searchContainer}>
        <Svg
          style={StyleSheet.absoluteFill}
          width="100%"
          height="100%"
          viewBox="0 0 100 48"
          preserveAspectRatio="none"
          pointerEvents="none"
        >
          <Path
            d="M 12 0 L 100 0 L 100 36 L 88 48 L 0 48 L 0 12 Z"
            fill={COLORS.surface}
            stroke={COLORS.goldBorder}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />

          <Path
            d="M 12 0 L 38 0"
            stroke={COLORS.gold}
            strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
          />
        </Svg>

        <Ionicons name="search-outline" size={20} color={COLORS.gold} />

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search your traces"
          placeholderTextColor={COLORS.subtle}
          style={styles.searchInput}
          selectionColor={COLORS.gold}
          returnKeyType="search"
          accessibilityLabel="Search activities"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => setSearchQuery("")}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={COLORS.muted}
            />
          </Pressable>
        )}
      </View>

      {/* FILTERS */}

      <View style={styles.filtersContainer}>
        <EnergyFilter
          label="All"
          selected={filter === "all"}
          onPress={() => setFilter("all")}
        />

        <EnergyFilter
          label="Growing"
          color={COLORS.growing}
          selected={filter === ActivityClassification.Serves}
          onPress={() => setFilter(ActivityClassification.Serves)}
        />

        <EnergyFilter
          label="Restoring"
          color={COLORS.restoring}
          selected={filter === ActivityClassification.Restores}
          onPress={() => setFilter(ActivityClassification.Restores)}
        />

        <EnergyFilter
          label="Leaks"
          color={COLORS.leak}
          selected={filter === ActivityClassification.DoesNotServe}
          onPress={() => setFilter(ActivityClassification.DoesNotServe)}
        />
      </View>

      {/* ERROR */}

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={18} color={COLORS.leak} />

          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
}

/*
 * STYLES
 */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },

  /*
   * HEADER
   */

  header: {
    paddingTop: 12,
    paddingBottom: 24,
  },

  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  title: {
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "600",
    letterSpacing: -1.1,
    marginTop: 15,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },

  /*
   * TIME DISTRIBUTION
   */

  balanceContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 21,
  },

  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  sectionLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  statColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },

  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOpacity: 0.65,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  statValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: -0.8,
    marginTop: 11,
  },

  statDescription: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
    textAlign: "center",
  },

  /*
   * DISTRIBUTION BAR
   */

  balanceTrack: {
    height: 5,
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: COLORS.border,
    marginTop: 23,
  },

  balanceSegment: {
    height: "100%",
  },

  balanceFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
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

  balanceFooterText: {
    color: COLORS.muted,
    fontSize: 10,
  },

  /*
   * SEARCH
   */

  searchContainer: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 0,
    fontSize: 14,
    color: COLORS.text,
  },

  /*
   * FILTERS
   */

  filtersContainer: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 24,
  },

  /*
   * ERROR
   */

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    backgroundColor: COLORS.dangerBackground,
    borderRadius: 12,
  },

  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 12,
    lineHeight: 18,
  },
});
