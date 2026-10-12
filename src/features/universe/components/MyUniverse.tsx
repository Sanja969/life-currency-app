import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { UniverseArtwork } from "@/features/today/components/universe/UniverseArtwork";

import { COLORS } from "@/theme/colors";
import { formatDuration } from "@/utils/formatDuration";

import { useMyUniverse } from "../hooks/useMyUniverse";

import { type UniverseWorldStats } from "../utils/universeEvolution";

type WorldType = "tree" | "lotus" | "vortex";

type WorldConfig = {
  key: string;
  label: string;
  type: WorldType;
  color: string;
  stats: UniverseWorldStats;
};

function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getPreviousMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function getNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function isCurrentMonth(date: Date): boolean {
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function UniverseWorld({ world }: { world: WorldConfig }) {
  return (
    <View style={styles.worldContainer}>
      <UniverseArtwork
        type={world.type}
        color={world.color}
        duration={world.stats.totalMinutes}
        percentage={world.stats.percentage}
        activityCount={world.stats.activityCount}
        size={100}
        mode="lifetime"
      />

      <Text style={[styles.worldLabel, { color: world.color }]}>
        {world.label}
      </Text>

      <Text style={styles.worldDuration}>
        {formatDuration(world.stats.totalMinutes)}
      </Text>

      <Text style={styles.worldPercentage}>
        {Math.round(world.stats.percentage)}%
      </Text>
    </View>
  );
}

export function MyUniverse() {
  const { universe, selectedMonth, setSelectedMonth, isLoading, errorMessage } =
    useMyUniverse();

  const worlds = useMemo<WorldConfig[]>(() => {
    if (!universe) {
      return [];
    }

    return [
      {
        key: "growing",
        label: "GROWING",
        type: "tree",
        color: COLORS.growing,
        stats: universe.growing,
      },
      {
        key: "restoring",
        label: "RESTORING",
        type: "lotus",
        color: COLORS.restoring,
        stats: universe.restoring,
      },
      {
        key: "leaks",
        label: "LIFE LEAKS",
        type: "vortex",
        color: COLORS.leak,
        stats: universe.leaks,
      },
    ];
  }, [universe]);

  const canGoForward = !isCurrentMonth(selectedMonth);

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionLabel}>MY UNIVERSE</Text>
        </View>

        <Text style={styles.subtitle}>
          A universe shaped by how you spend your time.
        </Text>
      </View>

      {/* MONTH NAVIGATION */}

      <View style={styles.monthNavigation}>
        <Pressable
          onPress={() =>
            setSelectedMonth((current) => getPreviousMonth(current))
          }
          style={styles.monthArrow}
          accessibilityLabel="Previous month"
        >
          <Ionicons name="chevron-back" size={19} color={COLORS.gold} />
        </Pressable>

        <View style={styles.monthLabelContainer}>
          <Text style={styles.monthLabel}>{formatMonth(selectedMonth)}</Text>

          <Text style={styles.monthSubtitle}>
            {isCurrentMonth(selectedMonth)
              ? "YOUR UNIVERSE TODAY"
              : "COSMIC MEMORY"}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            if (canGoForward) {
              setSelectedMonth((current) => getNextMonth(current));
            }
          }}
          disabled={!canGoForward}
          style={styles.monthArrow}
          accessibilityLabel="Next month"
        >
          <Ionicons
            name="chevron-forward"
            size={19}
            color={canGoForward ? COLORS.gold : COLORS.subtle}
          />
        </Pressable>
      </View>

      {/* LOADING */}

      {isLoading && !universe && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.gold} />
        </View>
      )}

      {/* ERROR */}

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {/* UNIVERSE */}

      {universe && (
        <>
          <View style={styles.universeContainer}>
            {/* BACKGROUND STARS */}

            <View style={styles.starOne} />
            <View style={styles.starTwo} />
            <View style={styles.starThree} />
            <View style={styles.starFour} />
            <View style={styles.starFive} />

            {/* THREE WORLDS */}

            <View style={styles.worldsRow}>
              {worlds.map((world) => (
                <UniverseWorld key={world.key} world={world} />
              ))}
            </View>

            {/* TOTAL TIME */}

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>
                TIME INVESTED IN YOUR UNIVERSE
              </Text>

              <Text style={styles.totalValue}>
                {formatDuration(universe.totalMinutes)}
              </Text>

              <Text style={styles.totalActivities}>
                {universe.totalActivities} recorded activities
              </Text>
            </View>
          </View>

          {/* YOUR TIME, VISUALIZED */}

          <View style={styles.insightContainer}>
            <View style={styles.insightHeader}>
              <Ionicons name="sparkles-outline" size={15} color={COLORS.gold} />

              <Text style={styles.insightTitle}>YOUR TIME, VISUALIZED</Text>
            </View>

            <Text style={styles.insightDescription}>
              Every activity shapes your universe.
              {"\n\n"}
              Growing reflects time spent developing yourself. Restoring
              represents time dedicated to rest and renewal. Life Leaks reveal
              where your time slips away.
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    marginBottom: 8,
  },

  header: {
    marginBottom: 18,
  },

  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
  },

  sectionLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  subtitle: {
    color: COLORS.subtle,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },

  monthArrow: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  monthLabelContainer: {
    alignItems: "center",
  },

  monthLabel: {
    color: COLORS.lightGold,
    fontSize: 15,
    fontWeight: "600",
  },

  monthSubtitle: {
    color: COLORS.subtle,
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginTop: 5,
  },

  universeContainer: {
    minHeight: 270,
    paddingTop: 20,
    paddingBottom: 25,
    overflow: "hidden",
    position: "relative",
  },

  worldsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  worldContainer: {
    flex: 1,
    alignItems: "center",
  },

  worldLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 3,
  },

  worldDuration: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },

  worldPercentage: {
    color: COLORS.subtle,
    fontSize: 11,
    marginTop: 3,
  },

  totalContainer: {
    alignItems: "center",
    marginTop: 29,
  },

  totalLabel: {
    color: COLORS.subtle,
    fontSize: 9,
    letterSpacing: 1.3,
    fontWeight: "600",
  },

  totalValue: {
    color: COLORS.lightGold,
    fontSize: 26,
    fontWeight: "700",
    marginTop: 7,
  },

  totalActivities: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  insightContainer: {
    paddingTop: 22,
    paddingBottom: 26,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },

  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  insightTitle: {
    color: COLORS.lightGold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  insightDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 21,
    marginTop: 15,
  },

  loadingContainer: {
    paddingVertical: 50,
  },

  errorText: {
    color: COLORS.leak,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 20,
  },

  starOne: {
    position: "absolute",
    top: 18,
    left: "12%",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.5,
  },

  starTwo: {
    position: "absolute",
    top: 42,
    right: "18%",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.restoring,
    opacity: 0.5,
  },

  starThree: {
    position: "absolute",
    top: 120,
    left: "6%",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.text,
    opacity: 0.35,
  },

  starFour: {
    position: "absolute",
    top: 95,
    right: "7%",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.45,
  },

  starFive: {
    position: "absolute",
    top: 170,
    left: "50%",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.restoring,
    opacity: 0.4,
  },
});
