import { useState } from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";

import {
  Constellation,
  ConstellationPoint,
} from "./Constellation";

import {
  ConstellationInsight,
  ConstellationInsightData,
} from "./ConstellationInsight";

import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";

import {
  ActivityClassification,
  ActivityStatistics,
} from "@/types/activity";

type InnerUniverseProps = {
  statistics: ActivityStatistics;
};

const GROWTH_POINTS: ConstellationPoint[] = [
  { x: 24, y: 72 },
  { x: 48, y: 36 },
  { x: 72, y: 56 },
  { x: 96, y: 20 },
  { x: 111, y: 73 },
];

const RESTORATION_POINTS: ConstellationPoint[] = [
  { x: 22, y: 38 },
  { x: 46, y: 18 },
  { x: 76, y: 42 },
  { x: 96, y: 72 },
  { x: 54, y: 84 },
];

const LEAK_POINTS: ConstellationPoint[] = [
  { x: 22, y: 22 },
  { x: 55, y: 44 },
  { x: 95, y: 25 },
  { x: 106, y: 75 },
  { x: 44, y: 86 },
];

export function InnerUniverse({
  statistics,
}: InnerUniverseProps) {
  const [selectedInsight, setSelectedInsight] =
    useState<ConstellationInsightData | null>(null);

  const growingTheme =
    CLASSIFICATION_THEME[ActivityClassification.Serves];

  const restoringTheme =
    CLASSIFICATION_THEME[ActivityClassification.Restores];

  const leakTheme =
    CLASSIFICATION_THEME[ActivityClassification.DoesNotServe];

  const growth: ConstellationInsightData = {
    title: "Growth",
    color: growingTheme.color,
    count: statistics.servesCount,
    duration: statistics.servesDurationMinutes,
    description:
      "These are the activities you've identified as supporting your growth.",
    question:
      "What part of yourself are you nurturing through these activities?",
  };

  const restoration: ConstellationInsightData = {
    title: "Restoration",
    color: restoringTheme.color,
    count: statistics.restoresCount,
    duration: statistics.restoresDurationMinutes,
    description:
      "These are the moments you've chosen to classify as restoring.",
    question:
      "What helps you feel restored, beyond simply taking a break?",
  };

  const lifeLeaks: ConstellationInsightData = {
    title: "Life Leaks",
    color: leakTheme.color,
    count: statistics.doesNotServeCount,
    duration: statistics.doesNotServeDurationMinutes,
    description:
      "These are activities you've identified as taking time away from what matters to you.",
    question:
      "What do you think you're looking for in these moments?",
  };

  const hasActivities = statistics.totalDurationMinutes > 0;

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <Text style={styles.title}>
        YOUR INNER UNIVERSE
      </Text>

      <Text style={styles.subtitle}>
        Discover the patterns shaping your life.
      </Text>

      {/* UNIVERSE */}

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.panel}
      >
        <View style={styles.universe}>
          {/* GROWTH */}

          <View style={styles.growthPosition}>
            <Constellation
              title="Growth"
              color={growth.color}
              points={GROWTH_POINTS}
              active={growth.count > 0}
              onPress={() => setSelectedInsight(growth)}
            />
          </View>

          {/* RESTORATION */}

          <View style={styles.restorationPosition}>
            <Constellation
              title="Restoration"
              color={restoration.color}
              points={RESTORATION_POINTS}
              active={restoration.count > 0}
              onPress={() => setSelectedInsight(restoration)}
            />
          </View>

          {/* LIFE LEAKS */}

          <View style={styles.leaksPosition}>
            <Constellation
              title="Life Leaks"
              color={lifeLeaks.color}
              points={LEAK_POINTS}
              active={lifeLeaks.count > 0}
              onPress={() => setSelectedInsight(lifeLeaks)}
            />
          </View>

          {/* FOOTER */}

          <Text style={styles.footer}>
            {hasActivities
              ? "TOUCH A CONSTELLATION TO EXPLORE"
              : "YOUR UNIVERSE BEGINS WITH A MOMENT"}
          </Text>
        </View>
      </CosmicPanel>

      {/* INSIGHT MODAL */}

      <ConstellationInsight
        visible={selectedInsight !== null}
        data={selectedInsight}
        onClose={() => setSelectedInsight(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    width: "100%",
  },

  title: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 7,
    marginBottom: 15,
  },

  panel: {
    padding: 0,
  },

  universe: {
    height: 325,
    position: "relative",
    overflow: "hidden",
  },

  growthPosition: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    left: "50%",
    marginLeft: -70,
  },

  restorationPosition: {
    position: "absolute",
    bottom: 45,
    left: 2,
  },

  leaksPosition: {
    position: "absolute",
    bottom: 45,
    right: 2,
  },

  footer: {
    position: "absolute",
    bottom: 18,
    alignSelf: "center",
    color: COLORS.subtle,
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1,
  },
});