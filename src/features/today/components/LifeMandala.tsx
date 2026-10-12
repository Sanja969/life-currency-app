import { useMemo, useState } from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { UniverseArtwork } from "./universe/UniverseArtwork";
import { UniverseBlackHole } from "./universe/UniverseBlackHole";

import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";

import { Activity, ActivityClassification } from "@/types/activity";

import { formatDuration } from "@/utils/formatDuration";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type LifeMandalaProps = {
  activities: Activity[];
};

type UniverseCategory = {
  classification: ActivityClassification;
  title: string;
  duration: number;
  percentage: number;
  color: string;
  activities: Activity[];
  question: string;
};

type ArtworkType = "tree" | "lotus" | "vortex";

type WorldPosition = {
  top: number;
  left: number;
};

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const UNIVERSE_WIDTH = 340;
const UNIVERSE_HEIGHT = 420;

const WORLD_WIDTH = 140;
const ARTWORK_SIZE = 112;

const DEFINITIONS = [
  {
    classification: ActivityClassification.Serves,
    title: "Growing",
    type: "tree" as ArtworkType,
    question:
      "What part of yourself are you nurturing through these activities?",
  },
  {
    classification: ActivityClassification.Restores,
    title: "Restoring",
    type: "lotus" as ArtworkType,
    question: "What helps you feel genuinely restored?",
  },
  {
    classification: ActivityClassification.DoesNotServe,
    title: "Life Leaks",
    type: "vortex" as ArtworkType,
    question: "What might you be seeking in these moments?",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* DATA                                                                       */
/* -------------------------------------------------------------------------- */

function buildCategories(activities: Activity[]): UniverseCategory[] {
  const total = activities.reduce(
    (sum, activity) => sum + Math.max(0, activity.durationMinutes),
    0,
  );

  return DEFINITIONS.map((definition) => {
    const categoryActivities = activities.filter(
      (activity) => activity.classification === definition.classification,
    );

    const duration = categoryActivities.reduce(
      (sum, activity) => sum + Math.max(0, activity.durationMinutes),
      0,
    );

    return {
      classification: definition.classification,
      title: definition.title,
      question: definition.question,
      activities: categoryActivities,
      duration,
      percentage: total > 0 ? (duration / total) * 100 : 0,
      color: CLASSIFICATION_THEME[definition.classification].color,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* COSMIC BACKGROUND                                                          */
/* -------------------------------------------------------------------------- */

function UniverseBackground() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${UNIVERSE_WIDTH} ${UNIVERSE_HEIGHT}`}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id="universeAtmosphere">
          <Stop offset="0%" stopColor="#202044" stopOpacity={0.28} />
          <Stop offset="65%" stopColor="#101629" stopOpacity={0.1} />
          <Stop offset="100%" stopColor="#050812" stopOpacity={0} />
        </RadialGradient>

        <LinearGradient id="subtleOrbit">
          <Stop offset="0%" stopColor={COLORS.gold} stopOpacity={0} />
          <Stop offset="45%" stopColor={COLORS.gold} stopOpacity={0.18} />
          <Stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Atmospheric depth */}

      <Ellipse
        cx={170}
        cy={195}
        rx={158}
        ry={185}
        fill="url(#universeAtmosphere)"
      />

      {/* One broad orbital field */}

      <Ellipse
        cx={170}
        cy={194}
        rx={133}
        ry={164}
        fill="none"
        stroke="url(#subtleOrbit)"
        strokeWidth={0.8}
        transform="rotate(-18 170 194)"
      />

      {/* A secondary, barely visible gravitational curve */}

      <Path
        d="M38 234 C83 123 250 120 304 226"
        fill="none"
        stroke={COLORS.gold}
        strokeOpacity={0.075}
        strokeWidth={0.8}
      />

      {/* Sparse stars */}

      {Array.from({ length: 30 }, (_, index) => {
        const x = (index * 79 + 19) % UNIVERSE_WIDTH;
        const y = (index * 137 + 31) % UNIVERSE_HEIGHT;

        return (
          <G key={index}>
            <Circle
              cx={x}
              cy={y}
              r={index % 8 === 0 ? 1.3 : 0.6}
              fill={index % 4 === 0 ? COLORS.gold : "#C8D9FF"}
              fillOpacity={0.18 + (index % 5) * 0.1}
            />
          </G>
        );
      })}
    </Svg>
  );
}

/* -------------------------------------------------------------------------- */
/* ENERGY CONNECTIONS                                                        */
/* -------------------------------------------------------------------------- */

function UniverseEnergyConnections() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${UNIVERSE_WIDTH} ${UNIVERSE_HEIGHT}`}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="growingEnergy">
          <Stop offset="0%" stopColor="#B38CFF" stopOpacity={0} />
          <Stop offset="50%" stopColor="#B38CFF" stopOpacity={0.25} />
          <Stop offset="100%" stopColor="#F4C979" stopOpacity={0} />
        </LinearGradient>

        <LinearGradient id="restoringEnergy">
          <Stop offset="0%" stopColor="#7EFFF0" stopOpacity={0} />
          <Stop offset="50%" stopColor="#7EFFF0" stopOpacity={0.3} />
          <Stop offset="100%" stopColor="#F4C979" stopOpacity={0} />
        </LinearGradient>

        <LinearGradient id="leaksEnergy">
          <Stop offset="0%" stopColor="#FFD08A" stopOpacity={0} />
          <Stop offset="50%" stopColor="#FFD08A" stopOpacity={0.25} />
          <Stop offset="100%" stopColor="#F4C979" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Growing */}

      <Path
        d="M170 117 C165 135 166 147 170 158"
        stroke="url(#growingEnergy)"
        strokeWidth={1.2}
        fill="none"
      />

      {/* Restoring */}

      <Path
        d="M103 291 C119 267 128 247 145 227"
        stroke="url(#restoringEnergy)"
        strokeWidth={1.2}
        fill="none"
      />

      {/* Life Leaks */}

      <Path
        d="M237 291 C221 267 212 247 195 227"
        stroke="url(#leaksEnergy)"
        strokeWidth={1.2}
        fill="none"
      />
    </Svg>
  );
}

/* -------------------------------------------------------------------------- */
/* UNIVERSE WORLD                                                             */
/* -------------------------------------------------------------------------- */

function UniverseWorld({
  category,
  type,
  position,
  onPress,
}: {
  category: UniverseCategory;
  type: ArtworkType;
  position: WorldPosition;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Explore ${category.title}`}
      style={[styles.world, position]}
    >
      <Text style={[styles.worldTitle, { color: category.color }]}>
        {category.title.toUpperCase()}
      </Text>

      <UniverseArtwork
        type={type}
        color={category.color}
        duration={category.duration}
        percentage={category.percentage}
        activityCount={category.activities.length}
        size={ARTWORK_SIZE}
      />

      <View style={styles.worldStatistics}>
        <Text style={styles.worldDuration}>
          {formatDuration(category.duration)}
        </Text>

        <Text style={styles.worldPercentage}>
          {Math.round(category.percentage)}%
        </Text>
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* DETAIL MODAL                                                               */
/* -------------------------------------------------------------------------- */

function UniverseDetails({
  category,
  onClose,
}: {
  category: UniverseCategory | null;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={category !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetEyebrow}>EXPLORE YOUR UNIVERSE</Text>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close details"
            >
              <Ionicons name="close" size={24} color={COLORS.muted} />
            </Pressable>
          </View>

          {category && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.sheetTitle, { color: category.color }]}>
                {category.title}
              </Text>

              <Text style={styles.sheetDuration}>
                {formatDuration(category.duration)}
              </Text>

              <Text style={styles.sheetPercentage}>
                {Math.round(category.percentage)}% of recorded time
              </Text>

              <View style={styles.divider} />

              <Text style={styles.sheetSection}>MOMENTS TRACED</Text>

              {category.activities.length === 0 ? (
                <Text style={styles.emptyText}>
                  No activities recorded here today.
                </Text>
              ) : (
                category.activities.map((activity) => (
                  <View key={activity.id} style={styles.activityRow}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>

                    <Text style={styles.activityDuration}>
                      {formatDuration(activity.durationMinutes)}
                    </Text>
                  </View>
                ))
              )}

              <View style={styles.reflectionCard}>
                <Text style={styles.reflectionLabel}>
                  A QUESTION WORTH EXPLORING
                </Text>

                <Text style={styles.reflectionQuestion}>
                  {category.question}
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export function LifeMandala({ activities }: LifeMandalaProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<UniverseCategory | null>(null);

  const { width } = useWindowDimensions();

  const visualSize = Math.min(UNIVERSE_WIDTH, width - 48);
  const scale = visualSize / UNIVERSE_WIDTH;

  const categories = useMemo(() => buildCategories(activities), [activities]);

  const totalDuration = categories.reduce(
    (sum, category) => sum + category.duration,
    0,
  );

  const dominant = categories.reduce<UniverseCategory | null>(
    (current, category) =>
      !current || category.duration > current.duration ? category : current,
    null,
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR LIFE UNIVERSE</Text>

        <Text style={styles.subtitle}>Every moment shapes your universe.</Text>
      </View>

      {/* COSMIC SCENE */}

      <View
        style={[
          styles.universe,
          {
            width: visualSize,
            height: UNIVERSE_HEIGHT * scale,
          },
        ]}
      >
        <UniverseBackground />
        <UniverseEnergyConnections />

        <View
          style={[
            styles.worldLayer,
            {
              width: UNIVERSE_WIDTH,
              height: UNIVERSE_HEIGHT,
              left: (visualSize - UNIVERSE_WIDTH) / 2,
              top: (UNIVERSE_HEIGHT * scale - UNIVERSE_HEIGHT) / 2,
              transform: [{ scale }],
            },
          ]}
        >
          {/* GROWING */}
          <UniverseWorld
            category={categories[0]}
            type="tree"
            position={{ top: 14, left: 100 }}
            onPress={() => setSelectedCategory(categories[0])}
          />

          {/* RESTORING */}
          <UniverseWorld
            category={categories[1]}
            type="lotus"
            position={{ top: 202, left: 4 }}
            onPress={() => setSelectedCategory(categories[1])}
          />

          {/* LIFE LEAKS */}
          <UniverseWorld
            category={categories[2]}
            type="vortex"
            position={{ top: 202, left: 196 }}
            onPress={() => setSelectedCategory(categories[2])}
          />

          {/* CENTRAL GRAVITATIONAL CORE */}

          <View style={styles.blackHolePosition}>
            <UniverseBlackHole duration={totalDuration} size={140} />
          </View>
        </View>
      </View>

      {/* COSMIC INSIGHT — NO CARD */}

      <View style={styles.insight}>
        <Ionicons name="sparkles-outline" size={13} color={COLORS.gold} />

        <Text style={styles.insightLabel}>YOUR UNIVERSE SPEAKS</Text>
      </View>

      <Text style={styles.insightText}>
        {totalDuration === 0
          ? "Your universe begins with a single moment."
          : `Most of your observed time flowed into ${dominant?.title.toLowerCase()}.`}
      </Text>

      {/* DETAILS */}

      <UniverseDetails
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 25,
  },

  header: {
    marginBottom: 8,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
  },

  universe: {
    alignSelf: "center",
    position: "relative",
    overflow: "hidden",
  },

  worldLayer: {
    position: "absolute",
  },

  world: {
    position: "absolute",
    width: WORLD_WIDTH,
    alignItems: "center",
  },

  worldTitle: {
    color: COLORS.lightGold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  worldStatistics: {
    alignItems: "center",
    marginTop: -5,
  },

  worldDuration: {
    color: COLORS.lightGold,
    fontSize: 16,
    fontWeight: "700",
  },

  worldPercentage: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  blackHolePosition: {
    position: "absolute",
    top: 126,
    left: 100,
    zIndex: 2,
  },

  insight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 3,
  },

  insightLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  insightText: {
    color: COLORS.lightGold,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 9,
    paddingHorizontal: 24,
    opacity: 0.8,
  },

  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.75)",
  },

  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderColor: `${COLORS.gold}55`,
    paddingHorizontal: 23,
    paddingTop: 22,
    paddingBottom: 35,
    maxHeight: "85%",
  },

  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sheetEyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  sheetTitle: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 25,
  },

  sheetDuration: {
    color: COLORS.lightGold,
    fontSize: 29,
    fontWeight: "700",
    marginTop: 18,
  },

  sheetPercentage: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: `${COLORS.gold}25`,
    marginVertical: 23,
  },

  sheetSection: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.gold}15`,
  },

  activityTitle: {
    color: COLORS.text,
    fontSize: 13,
    flex: 1,
  },

  activityDuration: {
    color: COLORS.lightGold,
    fontSize: 12,
    marginLeft: 12,
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 16,
  },

  reflectionCard: {
    backgroundColor: `${COLORS.gold}0D`,
    borderWidth: 1,
    borderColor: `${COLORS.gold}30`,
    borderRadius: 12,
    padding: 17,
    marginTop: 25,
    marginBottom: 20,
  },

  reflectionLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  reflectionQuestion: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
});
