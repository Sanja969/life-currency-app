import { useEffect, useMemo, useState } from "react";

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
  G,
  Line,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";

import { Activity, ActivityClassification } from "@/types/activity";

import { formatDuration } from "@/utils/formatDuration";

type LifeMandalaProps = {
  activities: Activity[];
};

type MandalaSector = {
  classification: ActivityClassification;
  title: string;
  color: string;
  startAngle: number;
  endAngle: number;
  activities: Activity[];
  duration: number;
  question: string;
};

type MandalaStar = {
  activity: Activity;
  x: number;
  y: number;
  radius: number;
  color: string;
};

type Selection =
  | { type: "activity"; activity: Activity }
  | { type: "sector"; sector: MandalaSector }
  | { type: "overview" }
  | null;

const SIZE = 320;
const CENTER = SIZE / 2;

const INNER_RADIUS = 76;
const OUTER_RADIUS = 140;

const SECTOR_DEFINITIONS = [
  {
    classification: ActivityClassification.Serves,
    title: "Growing",
    startAngle: -150,
    endAngle: -30,
    question:
      "What part of yourself are you nurturing through these activities?",
  },
  {
    classification: ActivityClassification.Restores,
    title: "Restoring",
    startAngle: -30,
    endAngle: 90,
    question: "What helps you feel genuinely restored?",
  },
  {
    classification: ActivityClassification.DoesNotServe,
    title: "Life Leaks",
    startAngle: 90,
    endAngle: 210,
    question: "What might you be seeking in these moments?",
  },
] as const;

function polarPoint(radius: number, angleDegrees: number) {
  const radians = (angleDegrees * Math.PI) / 180;

  return {
    x: CENTER + Math.cos(radians) * radius,
    y: CENTER + Math.sin(radians) * radius,
  };
}

function createSectorPath(
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number,
) {
  const outerStart = polarPoint(outerRadius, startAngle);
  const outerEnd = polarPoint(outerRadius, endAngle);
  const innerEnd = polarPoint(innerRadius, endAngle);
  const innerStart = polarPoint(innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function getStarRadius(duration: number) {
  return Math.min(7.5, 3.5 + Math.sqrt(Math.max(0, duration) / 15));
}

function buildSectors(activities: Activity[]): MandalaSector[] {
  return SECTOR_DEFINITIONS.map((definition) => {
    const sectorActivities = activities
      .filter(
        (activity) => activity.classification === definition.classification,
      )
      .sort((a, b) => {
        const difference =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

        return difference || a.id - b.id;
      });

    return {
      ...definition,
      color: CLASSIFICATION_THEME[definition.classification].color,
      activities: sectorActivities,
      duration: sectorActivities.reduce(
        (sum, activity) => sum + Math.max(0, activity.durationMinutes),
        0,
      ),
    };
  });
}

/**
 * Each activity gets one star.
 *
 * Angle:
 *   Position in the classification's recorded sequence.
 *
 * Radius:
 *   Relative duration, distributed across multiple radial levels.
 *
 * Small alternating offsets:
 *   Help separate nearby stars without introducing randomness.
 */
function buildStars(sectors: MandalaSector[]): MandalaStar[] {
  const maxDuration = Math.max(
    1,
    ...sectors.flatMap((sector) =>
      sector.activities.map((activity) =>
        Math.max(0, activity.durationMinutes),
      ),
    ),
  );

  return sectors.flatMap((sector) => {
    const count = sector.activities.length;

    return sector.activities.map((activity, index) => {
      const fraction = (index + 1) / (count + 1);

      const angle =
        sector.startAngle +
        10 +
        fraction * (sector.endAngle - sector.startAngle - 20);

      const normalizedDuration = Math.sqrt(
        Math.max(0, activity.durationMinutes) / maxDuration,
      );

      const durationRadius = INNER_RADIUS + 15 + normalizedDuration * 35;

      const radialOffset = [-7, 5, 0, 8, -3][index % 5];

      const radius = Math.max(
        INNER_RADIUS + 9,
        Math.min(OUTER_RADIUS - 9, durationRadius + radialOffset),
      );

      const point = polarPoint(radius, angle);

      return {
        activity,
        x: point.x,
        y: point.y,
        radius: getStarRadius(activity.durationMinutes),
        color: sector.color,
      };
    });
  });
}

function getDailyInsight(sectors: MandalaSector[]) {
  const total = sectors.reduce((sum, sector) => sum + sector.duration, 0);

  if (total === 0) {
    return "Your story begins with a single moment.";
  }

  const sorted = [...sectors].sort((a, b) => b.duration - a.duration);

  if (sorted[0].duration === sorted[1].duration) {
    return "Your recorded time is shared across different parts of life.";
  }

  const insights: Record<ActivityClassification, string> = {
    [ActivityClassification.Serves]:
      "Growth shaped most of your recorded time today.",

    [ActivityClassification.Restores]:
      "Restoration shaped most of your recorded time today.",

    [ActivityClassification.DoesNotServe]:
      "Life Leaks occupied the largest share of your recorded time today.",
  };

  return insights[sorted[0].classification];
}

export function LifeMandala({ activities }: LifeMandalaProps) {
  const [selection, setSelection] = useState<Selection>(null);

  const { width } = useWindowDimensions();

  const visualSize = Math.min(SIZE, Math.max(240, width - 64));

  const sectors = useMemo(() => buildSectors(activities), [activities]);

  const stars = useMemo(() => buildStars(sectors), [sectors]);

  const insight = useMemo(() => getDailyInsight(sectors), [sectors]);

  const totalDuration = sectors.reduce(
    (sum, sector) => sum + sector.duration,
    0,
  );

  const totalActivities = activities.length;

  const reducedMotion = useReducedMotion();

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      pulse.value = 1;
      return;
    }

    pulse.value = withRepeat(
      withTiming(1.045, {
        duration: 2800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(pulse);
    };
  }, [pulse, reducedMotion]);

  const animatedCoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const selectedActivity =
    selection?.type === "activity" ? selection.activity : null;

  const selectedSector = selection?.type === "sector" ? selection.sector : null;

  const selectedColor = selectedActivity
    ? CLASSIFICATION_THEME[selectedActivity.classification].color
    : (selectedSector?.color ?? COLORS.gold);

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>YOUR LIFE MANDALA</Text>

        <Text style={styles.subtitle}>Every moment leaves a trace.</Text>
      </View>

      {/* MAIN MANDALA */}

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.panel}
      >
        <View
          style={[
            styles.visual,
            {
              width: visualSize,
              height: visualSize,
            },
          ]}
        >
          <Svg
            width={visualSize}
            height={visualSize}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
          >
            <Defs>
              <RadialGradient id="mandalaCenterGlow">
                <Stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.2} />

                <Stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
              </RadialGradient>
            </Defs>

            {/* ORBITAL GUIDES */}

            {[76, 108, 140].map((radius) => (
              <Circle
                key={radius}
                cx={CENTER}
                cy={CENTER}
                r={radius}
                fill="none"
                stroke={COLORS.gold}
                strokeOpacity={0.09}
                strokeWidth={0.8}
              />
            ))}

            {/* CLASSIFICATION SECTORS */}

            {sectors.map((sector) => {
              const share =
                totalDuration > 0 ? sector.duration / totalDuration : 0;

              return (
                <Path
                  key={sector.classification}
                  d={createSectorPath(
                    sector.startAngle,
                    sector.endAngle,
                    INNER_RADIUS,
                    OUTER_RADIUS,
                  )}
                  fill={sector.color}
                  fillOpacity={0.025 + share * 0.13}
                  stroke={sector.color}
                  strokeOpacity={0.1 + share * 0.2}
                  strokeWidth={1}
                  onPress={() =>
                    setSelection({
                      type: "sector",
                      sector,
                    })
                  }
                />
              );
            })}

            {/* CONNECTIONS */}

            {sectors.map((sector) => {
              const sectorStars = stars.filter(
                (star) =>
                  star.activity.classification === sector.classification,
              );

              return (
                <G key={sector.classification}>
                  {sectorStars.slice(0, -1).map((star, index) => {
                    const next = sectorStars[index + 1];

                    return (
                      <Line
                        key={star.activity.id}
                        x1={star.x}
                        y1={star.y}
                        x2={next.x}
                        y2={next.y}
                        stroke={sector.color}
                        strokeOpacity={0.24}
                        strokeWidth={0.9}
                      />
                    );
                  })}
                </G>
              );
            })}

            {/* ACTIVITY STARS */}

            {stars.map((star) => (
              <G
                key={star.activity.id}
                onPress={() =>
                  setSelection({
                    type: "activity",
                    activity: star.activity,
                  })
                }
              >
                {/* SOFT HALO */}

                <Circle
                  cx={star.x}
                  cy={star.y}
                  r={star.radius * 3}
                  fill={star.color}
                  fillOpacity={0.045}
                />

                <Circle
                  cx={star.x}
                  cy={star.y}
                  r={star.radius * 1.7}
                  fill={star.color}
                  fillOpacity={0.1}
                />

                {/* STAR */}

                <Circle
                  cx={star.x}
                  cy={star.y}
                  r={star.radius}
                  fill={star.color}
                  fillOpacity={0.95}
                />

                <Circle
                  cx={star.x}
                  cy={star.y}
                  r={star.radius * 0.32}
                  fill="#FFFFFF"
                  fillOpacity={0.75}
                />
              </G>
            ))}

            {/* CENTER GLOW */}

            <Circle
              cx={CENTER}
              cy={CENTER}
              r={72}
              fill="url(#mandalaCenterGlow)"
              pointerEvents="none"
            />

            {/* CENTER BACKGROUND */}

            <Circle
              cx={CENTER}
              cy={CENTER}
              r={57}
              fill={COLORS.background}
              fillOpacity={0.97}
              stroke={COLORS.gold}
              strokeOpacity={0.38}
              strokeWidth={1}
            />
          </Svg>

          {/* INTERACTIVE CENTER */}

          <Pressable
            onPress={() => setSelection({ type: "overview" })}
            accessibilityRole="button"
            accessibilityLabel="Explore today's recorded time"
            style={[
              styles.centerContent,
              {
                width: visualSize * (114 / SIZE),
                height: visualSize * (114 / SIZE),
                left: visualSize / 2 - visualSize * (57 / SIZE),
                top: visualSize / 2 - visualSize * (57 / SIZE),
              },
            ]}
          >
            <Animated.View style={animatedCoreStyle}>
              <Text
                style={styles.centerTime}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatDuration(totalDuration)}
              </Text>
            </Animated.View>

            <Text style={styles.centerLabel}>TIME OBSERVED</Text>
          </Pressable>
        </View>

        {/* INTERACTIVE LEGEND */}

        <View style={styles.sectorButtons}>
          {sectors.map((sector) => (
            <Pressable
              key={sector.classification}
              onPress={() =>
                setSelection({
                  type: "sector",
                  sector,
                })
              }
              style={styles.sectorButton}
              accessibilityRole="button"
              accessibilityLabel={`Explore ${sector.title}`}
            >
              <View
                style={[styles.sectorDot, { backgroundColor: sector.color }]}
              />

              <Text style={styles.sectorLabel}>{sector.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* COMPACT ACTIVITY SUMMARY */}

        <Text style={styles.activityCount}>
          {totalActivities === 0
            ? "Your universe begins with a moment"
            : `${totalActivities} ${
                totalActivities === 1 ? "moment" : "moments"
              } traced · Tap to explore`}
        </Text>

        {/* INLINE INSIGHT */}

        <View style={styles.inlineInsight}>
          <Ionicons name="sparkles-outline" size={14} color={COLORS.gold} />

          <Text style={styles.inlineInsightText}>{insight}</Text>
        </View>
      </CosmicPanel>

      {/* DETAIL MODAL */}

      <Modal
        visible={selection !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelection(null)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelection(null)}
          />

          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View
                style={[styles.sheetDot, { backgroundColor: selectedColor }]}
              />

              <Pressable
                onPress={() => setSelection(null)}
                accessibilityRole="button"
                accessibilityLabel="Close details"
              >
                <Ionicons name="close" size={24} color={COLORS.muted} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.sheetScroll}
            >
              {selection?.type === "overview" ? (
                <>
                  <Text style={styles.sheetEyebrow}>TODAY'S TRACE</Text>

                  <Text style={styles.sheetTitle}>Your recorded day</Text>

                  <Text style={styles.sheetDuration}>
                    {formatDuration(totalDuration)}
                  </Text>

                  <Text style={styles.sheetDescription}>
                    {totalActivities}{" "}
                    {totalActivities === 1 ? "activity" : "activities"} traced
                    today
                  </Text>

                  <View style={styles.overviewBreakdown}>
                    {sectors.map((sector) => (
                      <View
                        key={sector.classification}
                        style={styles.overviewRow}
                      >
                        <View style={styles.overviewLabel}>
                          <View
                            style={[
                              styles.sectorDot,
                              {
                                backgroundColor: sector.color,
                              },
                            ]}
                          />

                          <Text style={styles.overviewText}>
                            {sector.title}
                          </Text>
                        </View>

                        <Text style={styles.overviewValue}>
                          {formatDuration(sector.duration)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : selectedActivity ? (
                <>
                  <Text style={styles.sheetEyebrow}>A MOMENT IN YOUR LIFE</Text>

                  <Text style={styles.sheetTitle}>
                    {selectedActivity.title}
                  </Text>

                  <Text
                    style={[
                      styles.sheetClassification,
                      { color: selectedColor },
                    ]}
                  >
                    {
                      CLASSIFICATION_THEME[selectedActivity.classification]
                        .label
                    }
                  </Text>

                  <Text style={styles.sheetDuration}>
                    {formatDuration(selectedActivity.durationMinutes)}
                  </Text>

                  <View style={styles.reflectionCard}>
                    <Text style={styles.reflectionLabel}>
                      A MOMENT OF REFLECTION
                    </Text>

                    <Text style={styles.reflectionQuestion}>
                      What did this moment contribute to your day?
                    </Text>
                  </View>
                </>
              ) : selectedSector ? (
                <>
                  <Text style={styles.sheetEyebrow}>EXPLORE YOUR PATTERN</Text>

                  <Text style={styles.sheetTitle}>{selectedSector.title}</Text>

                  <Text style={styles.sheetDuration}>
                    {formatDuration(selectedSector.duration)}
                  </Text>

                  <Text style={styles.sheetDescription}>
                    {selectedSector.activities.length}{" "}
                    {selectedSector.activities.length === 1
                      ? "activity"
                      : "activities"}{" "}
                    recorded in this classification today.
                  </Text>

                  <View style={styles.reflectionCard}>
                    <Text style={styles.reflectionLabel}>
                      A QUESTION WORTH EXPLORING
                    </Text>

                    <Text style={styles.reflectionQuestion}>
                      {selectedSector.question}
                    </Text>
                  </View>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    width: "100%",
  },

  header: {
    marginBottom: 13,
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
  },

  panel: {
    paddingHorizontal: 0,
    paddingTop: 6,
    paddingBottom: 20,
    alignItems: "center",
  },

  visual: {
    alignSelf: "center",
    position: "relative",
  },

  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },

  centerTime: {
    color: COLORS.lightGold,
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: -0.8,
    textAlign: "center",
  },

  centerLabel: {
    color: COLORS.gold,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 5,
  },

  sectorButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 8,
    marginTop: 1,
  },

  sectorButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 3,
  },

  sectorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  sectorLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "600",
  },

  activityCount: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
    textAlign: "center",
  },

  inlineInsight: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.gold}20`,
    width: "100%",
    justifyContent: "center",
  },

  inlineInsightText: {
    color: COLORS.lightGold,
    fontSize: 11,
    lineHeight: 17,
    flexShrink: 1,
    textAlign: "center",
  },

  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.72)",
  },

  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderColor: `${COLORS.gold}55`,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 40,
    maxHeight: "80%",
  },

  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sheetDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
  },

  sheetScroll: {
    flexGrow: 0,
  },

  sheetEyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginTop: 24,
  },

  sheetTitle: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "600",
    marginTop: 9,
  },

  sheetClassification: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
  },

  sheetDuration: {
    color: COLORS.lightGold,
    fontSize: 26,
    fontWeight: "600",
    marginTop: 23,
  },

  sheetDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },

  overviewBreakdown: {
    marginTop: 23,
    gap: 16,
  },

  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  overviewLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  overviewText: {
    color: COLORS.text,
    fontSize: 13,
  },

  overviewValue: {
    color: COLORS.lightGold,
    fontSize: 13,
    fontWeight: "600",
  },

  reflectionCard: {
    backgroundColor: `${COLORS.gold}10`,
    borderWidth: 1,
    borderColor: `${COLORS.gold}35`,
    padding: 18,
    marginTop: 25,
    borderRadius: 12,
  },

  reflectionLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  reflectionQuestion: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 25,
    marginTop: 12,
  },
});
