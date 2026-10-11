import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ActivityClassification } from "@/types/activity";
import { CosmicPanel } from "@/components/ui/CosmicPanel";
import Svg, { Path } from "react-native-svg";
import { EnergyFilter } from "./EnergyFilter";

type ActivitiesHeaderProps = {
  growingPercent: number;
  leaksPercent: number;
  searchQuery: string;
  filter: "all" | ActivityClassification;
  errorMessage: string | null;
  setSearchQuery: (value: string) => void;
  setFilter: (value: "all" | ActivityClassification) => void;
};

const COLORS = {
  background: "#080A10",
  surface: "#111219",
  gold: "#D6AD65",
  lightGold: "#F3D49B",
  growing: "#8274E8",
  leaks: "#D88455",
  text: "#F5F0E7",
  muted: "#9295A5",
};

export function ActivitiesHeader({
  growingPercent,
  leaksPercent,
  searchQuery,
  filter,
  errorMessage,
  setSearchQuery,
  setFilter,
}: ActivitiesHeaderProps) {
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

      {/* ENERGY DISTRIBUTION */}

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.balanceContent}
      >
        <View style={styles.balanceHeader}>
          <Text style={styles.sectionLabel}>ACTIVITY DISTRIBUTION</Text>

          <Ionicons name="analytics-outline" size={18} color={COLORS.gold} />
        </View>

        <View style={styles.statsRow}>
          {/* GROWING */}

          <View style={styles.statColumn}>
            <View style={styles.statLabelRow}>
              <View
                style={[
                  styles.statDot,
                  {
                    backgroundColor: COLORS.growing,
                    shadowColor: COLORS.growing,
                  },
                ]}
              />

              <Text style={[styles.statLabel, { color: COLORS.growing }]}>
                GROWING
              </Text>
            </View>

            <Text style={styles.statValue}>{growingPercent}%</Text>

            <Text style={styles.statDescription}>of activities</Text>
          </View>

          {/* LIFE LEAKS */}

          <View style={styles.statColumnRight}>
            <View style={styles.statLabelRow}>
              <Text style={[styles.statLabel, { color: COLORS.leaks }]}>
                LIFE LEAKS
              </Text>

              <View
                style={[
                  styles.statDot,
                  {
                    backgroundColor: COLORS.leaks,
                    shadowColor: COLORS.leaks,
                  },
                ]}
              />
            </View>

            <Text style={styles.statValue}>{leaksPercent}%</Text>

            <Text style={styles.statDescription}>of activities</Text>
          </View>
        </View>

        {/* DISTRIBUTION BAR */}

        <View style={styles.balanceTrack}>
          <View
            style={[
              styles.balanceSegment,
              {
                width: `${growingPercent}%`,
                backgroundColor: COLORS.growing,
              },
            ]}
          />

          <View
            style={[
              styles.balanceSegment,
              {
                width: `${leaksPercent}%`,
                backgroundColor: COLORS.leaks,
              },
            ]}
          />
        </View>

        <View style={styles.balanceFooter}>
          <Text style={styles.balanceFooterText}>Growth</Text>

          <Text style={styles.balanceFooterText}>Life leaks</Text>
        </View>
      </CosmicPanel>

      {/* SEARCH */}
      {/* SEARCH */}

      <View style={styles.searchContainer}>
        {/* ANGULAR BACKGROUND */}

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
            fill="#111219"
            stroke="rgba(214,173,101,0.24)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />

          {/* GOLD ACCENT */}

          <Path
            d="M 12 0 L 38 0"
            stroke="#D6AD65"
            strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
          />
        </Svg>

        <Ionicons name="search-outline" size={20} color={COLORS.gold} />

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search your traces"
          placeholderTextColor="#777987"
          style={styles.searchInput}
          selectionColor={COLORS.gold}
          returnKeyType="search"
          accessibilityLabel="Search activities"
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
          label="Leaks"
          color={COLORS.leaks}
          selected={filter === ActivityClassification.DoesNotServe}
          onPress={() => setFilter(ActivityClassification.DoesNotServe)}
        />
      </View>

      {/* ERROR */}

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={COLORS.leaks}
          />

          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },

  // HEADER

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

  balanceContent: {
    paddingHorizontal: 22,
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
    gap: 12,
  },

  statColumn: {
    flex: 1,
    minWidth: 0,
  },

  statColumnRight: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },

  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  statDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    shadowOpacity: 0.65,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  statValue: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: -0.8,
    marginTop: 10,
  },

  statDescription: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },

  // DISTRIBUTION BAR

  balanceTrack: {
    height: 5,
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "#20212C",
    marginTop: 23,
  },

  balanceSegment: {
    height: "100%",
  },

  balanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  balanceFooterText: {
    color: COLORS.muted,
    fontSize: 10,
  },

  // SEARCH

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

  // FILTERS

  filtersContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },

  // ERROR

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(216,132,85,0.25)",
    backgroundColor: "rgba(216,132,85,0.08)",
    borderRadius: 12,
  },

  errorText: {
    flex: 1,
    color: "#E5A482",
    fontSize: 12,
    lineHeight: 18,
  },
});
