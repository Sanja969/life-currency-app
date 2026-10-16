import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Svg, {
  Circle,
  Line,
  Path,
} from "react-native-svg";

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { COLORS } from "@/theme/colors";

import type { WeeklyIntentionProgress } from "@/types/weeklyIntention";
import { formatDuration } from "@/utils/formatDuration";

type Props = {
  intentions: WeeklyIntentionProgress[];
  onAddIntention?: () => void;
};

type Status = "growing" | "reached" | "withinLimit" | "overLimit";

type Point = {
  x: number;
  y: number;
};

const GOLD = COLORS.gold;
const REACHED = COLORS.restoring;
const PROTECTED = COLORS.growing;
const EXCEEDED = COLORS.leak;

const GROW_FIELD_HEIGHT = 166;
const STAR_SIZE = 34;

function formatCategory(category: string): string {
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatus(intention: WeeklyIntentionProgress): Status {
  if (intention.direction === "at_most") {
    return intention.actualMinutes > intention.targetMinutes
      ? "overLimit"
      : "withinLimit";
  }

  return intention.actualMinutes >= intention.targetMinutes
    ? "reached"
    : "growing";
}

function getStatusColor(status: Status): string {
  switch (status) {
    case "reached":
      return REACHED;
    case "withinLimit":
      return PROTECTED;
    case "overLimit":
      return EXCEEDED;
    default:
      return GOLD;
  }
}

function getStatusLabel(status: Status): string {
  switch (status) {
    case "reached":
      return "REACHED";
    case "withinLimit":
      return "WITHIN LIMIT";
    case "overLimit":
      return "OVER LIMIT";
    default:
      return "IN PROGRESS";
  }
}

function getProgress(intention: WeeklyIntentionProgress): number {
  if (intention.targetMinutes <= 0) {
    return intention.actualMinutes > 0 ? 1 : 0;
  }

  return Math.min(
    Math.max(intention.actualMinutes / intention.targetMinutes, 0),
    1,
  );
}

function getDetail(intention: WeeklyIntentionProgress): string {
  const difference =
    intention.targetMinutes - intention.actualMinutes;

  if (intention.direction === "at_most") {
    return difference >= 0
      ? `${formatDuration(difference)} left within your limit`
      : `${formatDuration(Math.abs(difference))} over your limit`;
  }

  return difference <= 0
    ? "Intention reached"
    : `${formatDuration(difference)} remaining to reach your goal`;
}

/*
 * DETERMINISTIC CONSTELLATION LAYOUT
 *
 * Points are generated from a stable pattern.
 * Each point represents one intention.
 */

function getStarPositions(count: number): Point[] {
  if (count <= 0) return [];

  if (count === 1) {
    return [{ x: 0.5, y: 0.5 }];
  }

  if (count === 2) {
    return [
      { x: 0.28, y: 0.58 },
      { x: 0.73, y: 0.35 },
    ];
  }

  if (count === 3) {
    return [
      { x: 0.22, y: 0.7 },
      { x: 0.49, y: 0.23 },
      { x: 0.79, y: 0.63 },
    ];
  }

  if (count === 4) {
    return [
      { x: 0.2, y: 0.3 },
      { x: 0.7, y: 0.18 },
      { x: 0.81, y: 0.77 },
      { x: 0.29, y: 0.82 },
    ];
  }

  const base: Point[] = [
    { x: 0.18, y: 0.32 },
    { x: 0.72, y: 0.17 },
    { x: 0.5, y: 0.54 },
    { x: 0.81, y: 0.82 },
    { x: 0.2, y: 0.8 },
    { x: 0.46, y: 0.1 },
    { x: 0.93, y: 0.46 },
    { x: 0.43, y: 0.92 },
  ];

  return Array.from({ length: count }, (_, index) => {
    const point = base[index % base.length];

    return {
      x: point.x,
      y: point.y,
    };
  });
}

/*
 * ANIMATED GROW STAR
 */

type GrowStarProps = {
  intention: WeeklyIntentionProgress;
  index: number;
  selected: boolean;
  onPress: () => void;
};

function GrowStar({
  intention,
  index,
  selected,
  onPress,
}: GrowStarProps) {
  const reducedMotion = useReducedMotion();
  const glow = useSharedValue(1);

  const status = getStatus(intention);
  const reached = status === "reached";
  const color = getStatusColor(status);
  const progress = getProgress(intention);

  useEffect(() => {
    cancelAnimation(glow);

    if (reducedMotion || !reached) {
      glow.value = 1;
      return;
    }

    glow.value = withRepeat(
      withTiming(0.75, {
        duration: 2800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    return () => cancelAnimation(glow);
  }, [glow, reached, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: selected ? 1.12 : 1 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${formatCategory(
        intention.category,
      )}, ${getStatusLabel(status)}`}
      style={styles.starTouch}
    >
      <Animated.View style={animatedStyle}>
        <Svg
          width={STAR_SIZE}
          height={STAR_SIZE}
          viewBox="0 0 34 34"
        >
          <Circle
            cx={17}
            cy={17}
            r={16}
            fill={color}
            opacity={selected ? 0.22 : 0.08}
          />

          <Path
            d="M17 3 L20.5 13.5 L31 17 L20.5 20.5 L17 31 L13.5 20.5 L3 17 L13.5 13.5 Z"
            fill={color}
            opacity={0.45 + progress * 0.55}
          />

          <Circle
            cx={17}
            cy={17}
            r={3}
            fill={COLORS.lightGold}
          />

          {selected && (
            <Circle
              cx={17}
              cy={17}
              r={16}
              stroke={color}
              strokeWidth={1}
              fill="none"
            />
          )}
        </Svg>
      </Animated.View>

      <View style={styles.starNumber}>
        <Text style={styles.starNumberText}>
          {index + 1}
        </Text>
      </View>
    </Pressable>
  );
}

/*
 * GROW CONSTELLATION
 */

type GrowProps = {
  intentions: WeeklyIntentionProgress[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function GrowConstellation({
  intentions,
  selectedId,
  onSelect,
}: GrowProps) {
  const [fieldWidth, setFieldWidth] = useState(0);

  const positions = useMemo(
    () => getStarPositions(intentions.length),
    [intentions.length],
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.growSymbol}>
          <Ionicons
            name="sparkles-outline"
            size={17}
            color={GOLD}
          />
        </View>

        <View style={styles.sectionHeaderText}>
          <Text style={styles.growTitle}>GROW</Text>
          <Text style={styles.sectionSubtitle}>
            Time you want to invest
          </Text>
        </View>

        <Text style={styles.sectionCount}>
          {intentions.length}
        </Text>
      </View>

      {intentions.length === 0 ? (
        <Text style={styles.emptySection}>
          No growth intentions yet.
        </Text>
      ) : (
        <>
          <View
            style={styles.growField}
            onLayout={(event) =>
              setFieldWidth(event.nativeEvent.layout.width)
            }
          >
            {fieldWidth > 0 && (
              <>
                <Svg
                  width={fieldWidth}
                  height={GROW_FIELD_HEIGHT}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                >
                  {positions.slice(0, -1).map((point, index) => {
                    const next = positions[index + 1];

                    return (
                      <Line
                        key={`line-${index}`}
                        x1={point.x * fieldWidth}
                        y1={point.y * GROW_FIELD_HEIGHT}
                        x2={next.x * fieldWidth}
                        y2={next.y * GROW_FIELD_HEIGHT}
                        stroke={GOLD}
                        strokeWidth={1}
                        opacity={0.26}
                      />
                    );
                  })}

                  <Circle
                    cx={fieldWidth * 0.36}
                    cy={36}
                    r={1}
                    fill={COLORS.lightGold}
                    opacity={0.5}
                  />

                  <Circle
                    cx={fieldWidth * 0.9}
                    cy={95}
                    r={1}
                    fill={COLORS.lightGold}
                    opacity={0.4}
                  />

                  <Circle
                    cx={fieldWidth * 0.1}
                    cy={125}
                    r={0.8}
                    fill={COLORS.lightGold}
                    opacity={0.45}
                  />
                </Svg>

                {intentions.map((intention, index) => {
                  const position = positions[index];

                  return (
                    <View
                      key={intention.id}
                      style={[
                        styles.positionedStar,
                        {
                          left: position.x * fieldWidth - 22,
                          top:
                            position.y * GROW_FIELD_HEIGHT - 22,
                        },
                      ]}
                    >
                      <GrowStar
                        intention={intention}
                        index={index}
                        selected={
                          selectedId === String(intention.id)
                        }
                        onPress={() =>
                          onSelect(String(intention.id))
                        }
                      />
                    </View>
                  );
                })}
              </>
            )}
          </View>

          {/* COMPACT LEGEND */}

          <View style={styles.growLegend}>
            {intentions.map((intention, index) => {
              const status = getStatus(intention);
              const selected =
                selectedId === String(intention.id);

              return (
                <Pressable
                  key={intention.id}
                  onPress={() =>
                    onSelect(String(intention.id))
                  }
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[
                    styles.legendItem,
                    selected && styles.legendItemSelected,
                  ]}
                >
                  <View style={styles.legendNumber}>
                    <Text style={styles.legendNumberText}>
                      {index + 1}
                    </Text>
                  </View>

                  <View style={styles.legendInformation}>
                    <Text
                      style={styles.legendCategory}
                      numberOfLines={1}
                    >
                      {formatCategory(intention.category)}
                    </Text>

                    <Text style={styles.legendTime}>
                      {formatDuration(intention.actualMinutes)}
                      {" / "}
                      {formatDuration(intention.targetMinutes)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.legendStatusDot,
                      {
                        backgroundColor: getStatusColor(status),
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* SELECTED GROW INTENTION */}

          {intentions
            .filter(
              (intention) =>
                String(intention.id) === selectedId,
            )
            .map((intention) => (
              <View
                key={intention.id}
                style={styles.detailPanel}
              >
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>
                    {formatCategory(intention.category)}
                  </Text>

                  <Text
                    style={[
                      styles.detailStatus,
                      {
                        color: getStatusColor(
                          getStatus(intention),
                        ),
                      },
                    ]}
                  >
                    {getStatusLabel(getStatus(intention))}
                  </Text>
                </View>

                <Text style={styles.detailDescription}>
                  {getDetail(intention)}
                </Text>
              </View>
            ))}
        </>
      )}
    </View>
  );
}

/*
 * PROTECT ORBIT
 */

type ProtectOrbitProps = {
  intention: WeeklyIntentionProgress;
  selected: boolean;
  onPress: () => void;
};

function ProtectOrbit({
  intention,
  selected,
  onPress,
}: ProtectOrbitProps) {
  const status = getStatus(intention);
  const color = getStatusColor(status);
  const progress = getProgress(intention);

  const circumference = 2 * Math.PI * 22;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${formatCategory(
        intention.category,
      )}, ${getStatusLabel(status)}`}
      style={[
        styles.protectOrbit,
        selected && styles.protectOrbitSelected,
      ]}
    >
      <Svg width={58} height={58} viewBox="0 0 58 58">
        <Circle
          cx={29}
          cy={29}
          r={22}
          stroke={color}
          strokeWidth={3}
          opacity={0.18}
          fill="none"
        />

        <Circle
          cx={29}
          cy={29}
          r={22}
          stroke={color}
          strokeWidth={3.5}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          rotation={-90}
          origin="29, 29"
          fill="none"
        />

        <Circle
          cx={29}
          cy={29}
          r={8}
          fill={color}
          opacity={0.12}
        />

        <Circle
          cx={29}
          cy={29}
          r={4}
          fill={color}
        />
      </Svg>

      <View style={styles.protectInformation}>
        <Text
          style={styles.protectCategory}
          numberOfLines={1}
        >
          {formatCategory(intention.category)}
        </Text>

        <Text style={styles.protectTime}>
          {formatDuration(intention.actualMinutes)}
          {" / "}
          {formatDuration(intention.targetMinutes)}
        </Text>

        <Text
          style={[
            styles.protectStatus,
            { color },
          ]}
        >
          {getStatusLabel(status)}
        </Text>

        <Text style={styles.protectDetail}>
          {getDetail(intention)}
        </Text>
      </View>
    </Pressable>
  );
}

/*
 * PROTECT SECTION
 */

type ProtectProps = {
  intentions: WeeklyIntentionProgress[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function ProtectSection({
  intentions,
  selectedId,
  onSelect,
}: ProtectProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.protectSymbol}>
          <Ionicons
            name="shield-outline"
            size={17}
            color={PROTECTED}
          />
        </View>

        <View style={styles.sectionHeaderText}>
          <Text style={styles.protectTitle}>
            PROTECT
          </Text>

          <Text style={styles.sectionSubtitle}>
            Time you want to keep within limits
          </Text>
        </View>

        <Text style={styles.sectionCount}>
          {intentions.length}
        </Text>
      </View>

      {intentions.length === 0 ? (
        <Text style={styles.emptySection}>
          No time limits set yet.
        </Text>
      ) : (
        <View style={styles.protectList}>
          {intentions.map((intention) => (
            <ProtectOrbit
              key={intention.id}
              intention={intention}
              selected={
                selectedId === String(intention.id)
              }
              onPress={() =>
                onSelect(String(intention.id))
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}

/*
 * MAIN
 */

export function IntentionConstellation({
  intentions,
  onAddIntention,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const growIntentions = useMemo(
    () =>
      intentions.filter(
        (intention) => intention.direction === "at_least",
      ),
    [intentions],
  );

  const protectIntentions = useMemo(
    () =>
      intentions.filter(
        (intention) => intention.direction === "at_most",
      ),
    [intentions],
  );

  useEffect(() => {
    if (
      selectedId !== null &&
      !intentions.some(
        (intention) =>
          String(intention.id) === selectedId,
      )
    ) {
      setSelectedId(null);
    }
  }, [intentions, selectedId]);

  function handleSelect(id: string) {
    setSelectedId((current) =>
      current === id ? null : id,
    );
  }

  if (intentions.length === 0) {
    return (
      <CosmicPanel
        variant="signal"
        accent={GOLD}
        style={styles.panel}
        contentStyle={styles.emptyContent}
      >
        <Ionicons
          name="sparkles-outline"
          size={30}
          color={GOLD}
        />

        <Text style={styles.emptyTitle}>
          Every constellation begins with a single star.
        </Text>

        <Text style={styles.emptyDescription}>
          Choose where to invest your time or create a limit.
        </Text>

        {onAddIntention && (
          <Pressable
            onPress={onAddIntention}
            accessibilityRole="button"
            style={styles.addButton}
          >
            <Ionicons
              name="add"
              size={17}
              color={COLORS.background}
            />

            <Text style={styles.addButtonText}>
              Set your first intention
            </Text>
          </Pressable>
        )}
      </CosmicPanel>
    );
  }

  return (
    <CosmicPanel
      variant="default"
      accent={GOLD}
      style={styles.panel}
      contentStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          YOUR INTENTION CONSTELLATION
        </Text>

        <Text style={styles.title}>
          The future you're shaping
        </Text>

        <Text style={styles.subtitle}>
          Grow what matters. Protect your time.
        </Text>
      </View>

      <GrowConstellation
        intentions={growIntentions}
        selectedId={selectedId}
        onSelect={handleSelect}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />

        <Ionicons
          name="star-outline"
          size={13}
          color={GOLD}
        />

        <View style={styles.dividerLine} />
      </View>

      <ProtectSection
        intentions={protectIntentions}
        selectedId={selectedId}
        onSelect={handleSelect}
      />

      <Text style={styles.footer}>
        Tap a star or orbit to explore your intention.
      </Text>
    </CosmicPanel>
  );
}

/*
 * STYLES
 */

const styles = StyleSheet.create({
  panel: {
    marginBottom: 24,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 20,
  },

  header: {
    marginBottom: 24,
  },

  eyebrow: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "600",
    marginTop: 9,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  section: {
    marginBottom: 8,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  growSymbol: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: GOLD,
  },

  protectSymbol: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: PROTECTED,
  },

  sectionHeaderText: {
    flex: 1,
  },

  growTitle: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },

  protectTitle: {
    color: PROTECTED,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  sectionCount: {
    color: COLORS.subtle,
    fontSize: 12,
  },

  growField: {
    height: GROW_FIELD_HEIGHT,
    position: "relative",
    marginTop: 10,
  },

  positionedStar: {
    position: "absolute",
    width: 44,
    height: 44,
  },

  starTouch: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  starNumber: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  starNumberText: {
    color: GOLD,
    fontSize: 9,
    fontWeight: "700",
  },

  growLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  legendItem: {
    width: "48%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.goldBackground,
  },

  legendItemSelected: {
    borderColor: GOLD,
  },

  legendNumber: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  legendNumberText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "700",
  },

  legendInformation: {
    flex: 1,
    minWidth: 0,
  },

  legendCategory: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "600",
  },

  legendTime: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },

  legendStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  detailPanel: {
    marginTop: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    backgroundColor: COLORS.goldBackground,
  },

  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  detailTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  detailStatus: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  detailDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 7,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.goldBorder,
  },

  protectList: {
    marginTop: 15,
    gap: 10,
  },

  protectOrbit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.goldBackground,
  },

  protectOrbitSelected: {
    borderColor: PROTECTED,
  },

  protectInformation: {
    flex: 1,
    minWidth: 0,
  },

  protectCategory: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },

  protectTime: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  protectStatus: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.7,
    marginTop: 6,
  },

  protectDetail: {
    color: COLORS.subtle,
    fontSize: 10,
    marginTop: 5,
  },

  emptySection: {
    color: COLORS.subtle,
    fontSize: 11,
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },

  footer: {
    color: COLORS.subtle,
    fontSize: 10,
    textAlign: "center",
    marginTop: 20,
  },

  emptyContent: {
    paddingHorizontal: 24,
    paddingVertical: 34,
    alignItems: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 18,
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 12,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: GOLD,
    paddingHorizontal: 18,
    paddingVertical: 13,
    marginTop: 24,
  },

  addButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: "700",
  },
});