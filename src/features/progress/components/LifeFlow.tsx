import { useEffect, useMemo, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

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

import { CosmicPanel } from "@/components/ui/CosmicPanel";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";

import type {
  ProgressCategoryStat,
  ProgressPeriod,
  ProgressStatistics,
} from "@/features/progress/hooks/useProgress";

import { COLORS } from "@/theme/colors";

/*
 * TYPES
 */

type Props = {
  statistics: ProgressStatistics;
  period: ProgressPeriod;
};

type GroupedCategory = {
  key: string;
  label: string;
  totalMinutes: number;
  share: number;
};

type FlowNode = {
  key: string;
  label: string;

  totalMinutes: number;
  share: number;
  color: string;

  groupedCategories?: GroupedCategory[];
};

type PositionedNode = FlowNode & {
  x: number;
  y: number;
};

type PlanetTouchProps = {
  node: PositionedNode;
  scale: number;
  selected: boolean;
  onPress: () => void;
};

/*
 * PERIOD LABELS
 */

const PERIOD_LABELS: Record<ProgressPeriod, string> = {
  thisWeek: "This week",
  lastWeek: "Last week",
  thisMonth: "This month",
  lastMonth: "Last month",
};

/*
 * SVG DIMENSIONS
 */

const W = 350;
const H = 395;

const CENTER_X = 175;
const CORE_Y = 94;
const FLOW_START_Y = 159;

/*
 * HELPERS
 */

function formatMinutes(value: number): string {
  const total = Math.max(0, Math.round(value));

  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/*
 * DOMINANT CLASSIFICATION COLOR
 */

function getDominantColor(
  growingMinutes: number,
  restoringMinutes: number,
  leakMinutes: number,
): string {
  const maximum = Math.max(growingMinutes, restoringMinutes, leakMinutes);

  if (maximum <= 0) {
    return COLORS.gold;
  }

  if (growingMinutes === maximum) {
    return COLORS.growing;
  }

  if (restoringMinutes === maximum) {
    return COLORS.restoring;
  }

  return COLORS.leak;
}

/*
 * BUILD FLOW NODES
 *
 * Maximum five visible planets.
 *
 * If there are more than five categories:
 * - Show four largest categories.
 * - Group the rest into "+N Areas".
 */

function buildNodes(
  categories: ProgressCategoryStat[],
  totalMinutes: number,
): FlowNode[] {
  const sorted = [...categories]
    .filter((category) => category.totalMinutes > 0)
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  const visible = sorted.length <= 5 ? sorted : sorted.slice(0, 4);

  const nodes: FlowNode[] = visible.map((category) => ({
    key: String(category.category),

    label: getActivityCategoryMeta(category.category).label,

    totalMinutes: category.totalMinutes,

    share: totalMinutes > 0 ? category.totalMinutes / totalMinutes : 0,

    color: getDominantColor(
      category.growingMinutes,
      category.restoringMinutes,
      category.leakMinutes,
    ),
  }));

  /*
   * GROUPED CATEGORIES
   */

  if (sorted.length > 5) {
    const remaining = sorted.slice(4);

    const groupedCategories: GroupedCategory[] = remaining.map((category) => ({
      key: String(category.category),

      label: getActivityCategoryMeta(category.category).label,

      totalMinutes: category.totalMinutes,

      share: totalMinutes > 0 ? category.totalMinutes / totalMinutes : 0,
    }));

    const sum = (
      field:
        | "totalMinutes"
        | "growingMinutes"
        | "restoringMinutes"
        | "leakMinutes",
    ) => remaining.reduce((total, category) => total + category[field], 0);

    const remainingMinutes = sum("totalMinutes");

    const growingMinutes = sum("growingMinutes");
    const restoringMinutes = sum("restoringMinutes");
    const leakMinutes = sum("leakMinutes");

    nodes.push({
      key: "__more__",

      label: `+${remaining.length} Areas`,

      totalMinutes: remainingMinutes,

      share: totalMinutes > 0 ? remainingMinutes / totalMinutes : 0,

      color: getDominantColor(growingMinutes, restoringMinutes, leakMinutes),

      groupedCategories,
    });
  }

  return nodes;
}

/*
 * POSITION NODES
 */

function getPositionedNodes(nodes: FlowNode[]): PositionedNode[] {
  const count = nodes.length;

  if (count === 0) {
    return [];
  }

  const positions =
    count === 1
      ? [{ x: 175, y: 263 }]
      : count === 2
        ? [
            { x: 100, y: 263 },
            { x: 250, y: 263 },
          ]
        : count === 3
          ? [
              { x: 65, y: 267 },
              { x: 175, y: 281 },
              { x: 285, y: 267 },
            ]
          : count === 4
            ? [
                { x: 42, y: 263 },
                { x: 130, y: 281 },
                { x: 220, y: 281 },
                { x: 308, y: 263 },
              ]
            : [
                { x: 35, y: 255 },
                { x: 105, y: 278 },
                { x: 175, y: 292 },
                { x: 245, y: 278 },
                { x: 315, y: 255 },
              ];

  return nodes.map((node, index) => ({
    ...node,
    ...positions[index],
  }));
}

/*
 * CREATE FLOW PATH
 */

function createFlowPath(endX: number, endY: number): string {
  const direction = endX - CENTER_X;

  return [
    `M ${CENTER_X} ${FLOW_START_Y}`,
    `C ${CENTER_X + direction * 0.08} 194,`,
    `${endX} ${endY - 77},`,
    `${endX} ${endY}`,
  ].join(" ");
}

/*
 * HOLOGRAPHIC FLOW
 */

function HolographicFlow({
  node,
  index,
  selected,
  dimmed,
}: {
  node: PositionedNode;
  index: number;
  selected: boolean;
  dimmed: boolean;
}) {
  const path = createFlowPath(node.x, node.y);

  /*
   * Flow width represents the category's
   * share of total recorded time.
   */

  const flowWidth = 2.5 + Math.pow(node.share, 0.8) * 40;

  return (
    <G opacity={1}>
      {/* OUTER ATMOSPHERIC GLOW */}

      <Path
        d={path}
        stroke={node.color}
        strokeWidth={flowWidth + 26}
        strokeOpacity={selected ? 0.16 : 0.055}
        fill="none"
        strokeLinecap="round"
      />

      {/* SECONDARY GLOW */}

      <Path
        d={path}
        stroke={node.color}
        strokeWidth={flowWidth + 12}
        strokeOpacity={selected ? 0.27 : 0.12}
        fill="none"
        strokeLinecap="round"
      />

      {/* MAIN ENERGY STREAM */}

      <Path
        d={path}
        stroke={`url(#lifeFlowGradient${index})`}
        strokeWidth={flowWidth}
        strokeOpacity={selected ? 1 : 0.95}
        fill="none"
        strokeLinecap="round"
      />

      {/* INNER LIGHT */}

      <Path
        d={path}
        stroke={node.color}
        strokeWidth={Math.max(2, flowWidth * 0.22)}
        strokeOpacity={0.9}
        fill="none"
        strokeLinecap="round"
      />

      {/* LIGHT FILAMENT */}

      <Path
        d={path}
        stroke={COLORS.text}
        strokeWidth={1}
        strokeOpacity={selected ? 0.85 : 0.38}
        fill="none"
      />

      {/* PLANET ATMOSPHERE */}

      <Circle
        cx={node.x}
        cy={node.y}
        r={selected ? 34 : 28}
        fill={node.color}
        fillOpacity={selected ? 0.17 : 0.055}
      />

      {/* OUTER ORBIT */}

      <Ellipse
        cx={node.x}
        cy={node.y}
        rx={selected ? 31 : 26}
        ry={selected ? 12 : 9}
        rotation={-25}
        origin={`${node.x}, ${node.y}`}
        fill="none"
        stroke={node.color}
        strokeWidth={selected ? 1.5 : 0.8}
        strokeOpacity={selected ? 0.85 : 0.5}
      />

      {/* PLANET SHADOW */}

      <Circle
        cx={node.x}
        cy={node.y}
        r={selected ? 18 : 15}
        fill={COLORS.background}
        stroke={node.color}
        strokeOpacity={0.45}
        strokeWidth={1}
      />

      {/* PLANET SURFACE */}

      <Circle
        cx={node.x}
        cy={node.y}
        r={selected ? 15 : 12}
        fill={`url(#planetGradient${index})`}
        stroke={node.color}
        strokeWidth={selected ? 1.8 : 0.8}
      />

      {/* SURFACE HIGHLIGHT */}

      <Circle
        cx={node.x - 4}
        cy={node.y - 4}
        r={3}
        fill={COLORS.text}
        fillOpacity={0.35}
      />

      {/* SELECTED PLANET GLOW */}

      {selected && (
        <Circle
          cx={node.x}
          cy={node.y}
          r={27}
          fill="none"
          stroke={COLORS.gold}
          strokeWidth={1}
          strokeOpacity={0.75}
          strokeDasharray="3 5"
        />
      )}
    </G>
  );
}

/*
 * INTERACTIVE PLANET
 *
 * The transparent touch area sits over
 * the SVG planet.
 *
 * Animation provides immediate feedback
 * without changing the chart's layout.
 */

function PlanetTouch({ node, scale, selected, onPress }: PlanetTouchProps) {
  const pressScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: pressScale.value,
      },
    ],
  }));

  function handlePress() {
    pressScale.value = withSequence(
      withTiming(1.12, {
        duration: 120,
      }),
      withSpring(1, {
        damping: 11,
        stiffness: 220,
      }),
    );

    onPress();
  }

  return (
    <Animated.View
      style={[
        styles.nodeTouch,
        {
          left: node.x * scale - 38,
          top: node.y * scale - 30,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${node.label}, ${formatMinutes(
          node.totalMinutes,
        )}, ${formatPercentage(node.share)}`}
        accessibilityHint="Tap to reveal category details"
        accessibilityState={{
          selected,
        }}
        style={styles.planetPressable}
      >
        {/* CATEGORY LABEL */}

        <View pointerEvents="none" style={styles.nodeLabel}>
          <Text
            numberOfLines={2}
            style={[
              styles.nodeName,
              {
                color: selected ? COLORS.lightGold : node.color,
              },
            ]}
          >
            {node.label}
          </Text>

          {/* RECORDED TIME */}

          <Text style={styles.nodeTime}>
            {formatMinutes(node.totalMinutes)}
          </Text>

          {/* SHARE */}

          <Text style={styles.nodeShare}>{formatPercentage(node.share)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/*
 * SELECTED NODE DETAILS
 */

function SelectedNodeDetails({
  node,
  onClose,
}: {
  node: PositionedNode;
  onClose: () => void;
}) {
  const isGrouped = node.groupedCategories !== undefined;

  return (
    <CosmicPanel
      variant="default"
      accent={node.color}
      contentStyle={styles.details}
    >
      {/* HEADER */}

      <View style={styles.detailsHeader}>
        <Text style={styles.detailsTitle}>
          {isGrouped ? "More categories" : node.label}
        </Text>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close details"
          hitSlop={10}
        >
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      {/* TOTAL TIME */}

      <Text style={styles.detailsTotal}>
        {formatMinutes(node.totalMinutes)} recorded
      </Text>

      {/* GROUPED CATEGORIES */}

      {isGrouped ? (
        <View style={styles.groupedList}>
          {node.groupedCategories?.map((category, index) => (
            <View key={category.key}>
              <View style={styles.groupedRow}>
                <View style={styles.groupedCategoryInfo}>
                  <View
                    style={[
                      styles.groupedDot,
                      {
                        backgroundColor: node.color,
                      },
                    ]}
                  />

                  <Text style={styles.groupedCategoryName}>
                    {category.label}
                  </Text>
                </View>

                <View style={styles.groupedCategoryValues}>
                  <Text style={styles.groupedCategoryTime}>
                    {formatMinutes(category.totalMinutes)}
                  </Text>

                  <Text style={styles.groupedCategoryShare}>
                    {formatPercentage(category.share)}
                  </Text>
                </View>
              </View>

              {index < (node.groupedCategories?.length ?? 0) - 1 && (
                <View style={styles.groupedDivider} />
              )}
            </View>
          ))}
        </View>
      ) : (
        /* INDIVIDUAL CATEGORY */

        <View style={styles.categorySummary}>
          <View
            style={[
              styles.categoryAccent,
              {
                backgroundColor: node.color,
              },
            ]}
          />

          <Text style={styles.categorySummaryText}>
            {formatPercentage(node.share)} of your total recorded time.
          </Text>
        </View>
      )}
    </CosmicPanel>
  );
}

/*
 * MAIN COMPONENT
 */

export function LifeFlow({ statistics, period }: Props) {
  const { width } = useWindowDimensions();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  /*
   * Reset selection when period changes.
   */

  useEffect(() => {
    setSelectedKey(null);
  }, [period]);

  /*
   * RESPONSIVE SVG
   */

  const size = Math.min(width - 40, W);

  const scale = size / W;

  /*
   * BUILD NODES
   */

  const nodes = useMemo(
    () => buildNodes(statistics.categoryStats, statistics.totalMinutes),
    [statistics.categoryStats, statistics.totalMinutes],
  );

  const positionedNodes = useMemo(() => getPositionedNodes(nodes), [nodes]);

  const selectedNode =
    positionedNodes.find((node) => node.key === selectedKey) ?? null;

  const strongest = positionedNodes[0] ?? null;

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.heading}>
        <View style={styles.headingSquare} />

        <Text style={styles.eyebrow}>YOUR LIFE FLOW</Text>
      </View>

      <Text style={styles.subtitle}>
        Explore where your time flows.
        {"\n"}
        Tap a planet to reveal more.
      </Text>

      {/* HOLOGRAPHIC SCENE */}

      <View
        style={[
          styles.scene,
          {
            width: size,
            height: H * scale,
          },
        ]}
      >
        <Svg
          width={size}
          height={H * scale}
          viewBox={`0 0 ${W} ${H}`}
          pointerEvents="none"
        >
          <Defs>
            {/* CORE AURA */}

            <RadialGradient id="lifeFlowCoreAura">
              <Stop
                offset="0%"
                stopColor={COLORS.lightGold}
                stopOpacity={0.16}
              />

              <Stop offset="70%" stopColor={COLORS.gold} stopOpacity={0.06} />

              <Stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
            </RadialGradient>

            {/* GOLD ORBIT */}

            <LinearGradient id="lifeFlowGoldOrbit" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.04} />

              <Stop
                offset="50%"
                stopColor={COLORS.lightGold}
                stopOpacity={0.5}
              />

              <Stop offset="100%" stopColor={COLORS.gold} stopOpacity={0.05} />
            </LinearGradient>

            {/* FLOW GRADIENTS */}

            {positionedNodes.map((node, index) => (
              <LinearGradient
                key={node.key}
                id={`lifeFlowGradient${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <Stop offset="0%" stopColor={node.color} stopOpacity={0.28} />

                <Stop offset="35%" stopColor={node.color} stopOpacity={0.9} />

                <Stop offset="70%" stopColor={node.color} stopOpacity={1} />

                <Stop offset="100%" stopColor={node.color} stopOpacity={0.72} />
              </LinearGradient>
            ))}

            {/* PLANET GRADIENTS */}

            {positionedNodes.map((node, index) => (
              <RadialGradient
                key={`planet-gradient-${node.key}`}
                id={`planetGradient${index}`}
                cx="32%"
                cy="25%"
                rx="75%"
                ry="75%"
                fx="25%"
                fy="20%"
              >
                <Stop offset="0%" stopColor={COLORS.text} stopOpacity={0.95} />

                <Stop offset="18%" stopColor={node.color} stopOpacity={1} />

                <Stop offset="65%" stopColor={node.color} stopOpacity={0.8} />

                <Stop
                  offset="100%"
                  stopColor={COLORS.background}
                  stopOpacity={1}
                />
              </RadialGradient>
            ))}
          </Defs>

          {/* BACKGROUND GEOMETRY */}

          <Circle
            cx={CENTER_X}
            cy={CORE_Y}
            r={118}
            fill="url(#lifeFlowCoreAura)"
          />

          {[87, 99, 112].map((radius) => (
            <Circle
              key={radius}
              cx={CENTER_X}
              cy={CORE_Y}
              r={radius}
              fill="none"
              stroke={COLORS.gold}
              strokeOpacity={0.12}
              strokeWidth={0.7}
              strokeDasharray="2 7"
            />
          ))}

          <Ellipse
            cx={CENTER_X}
            cy={CORE_Y}
            rx={152}
            ry={57}
            fill="none"
            stroke="url(#lifeFlowGoldOrbit)"
            strokeWidth={1}
          />

          <Ellipse
            cx={CENTER_X}
            cy={CORE_Y}
            rx={135}
            ry={44}
            rotation={-22}
            origin={`${CENTER_X}, ${CORE_Y}`}
            fill="none"
            stroke={COLORS.gold}
            strokeOpacity={0.12}
            strokeWidth={0.7}
          />

          {/* FLOW STREAMS AND PLANETS */}

          {positionedNodes.map((node, index) => (
            <HolographicFlow
              key={node.key}
              node={node}
              index={index}
              selected={selectedKey === node.key}
              dimmed={selectedKey !== null && selectedKey !== node.key}
            />
          ))}

          {/* CORE */}

          <Circle
            cx={CENTER_X}
            cy={CORE_Y}
            r={70}
            fill={COLORS.surface}
            stroke={COLORS.lightGold}
            strokeWidth={2.3}
          />

          <Circle
            cx={CENTER_X}
            cy={CORE_Y}
            r={76}
            fill="none"
            stroke={COLORS.gold}
            strokeOpacity={0.35}
            strokeWidth={0.8}
            strokeDasharray="3 6"
          />
        </Svg>

        {/* CORE TEXT */}

        <View
          pointerEvents="none"
          style={[
            styles.coreContent,
            {
              top: 65 * scale,
            },
          ]}
        >
          <Text style={styles.coreTime}>
            {formatMinutes(statistics.totalMinutes)}
          </Text>

          <Text style={styles.coreLabel}>RECORDED TIME</Text>

          <Text style={styles.corePeriod}>{PERIOD_LABELS[period]}</Text>
        </View>

        {/* INTERACTIVE PLANETS */}

        {positionedNodes.map((node) => (
          <PlanetTouch
            key={`touch-${node.key}`}
            node={node}
            scale={scale}
            selected={selectedKey === node.key}
            onPress={() =>
              setSelectedKey((current) =>
                current === node.key ? null : node.key,
              )
            }
          />
        ))}
      </View>

      {/* INTERACTION HINT */}

      <Pressable
        onPress={() => setSelectedKey(null)}
        disabled={!selectedKey}
        accessibilityRole="button"
        accessibilityLabel="Clear selected planet"
        style={styles.interactionHint}
      >
        <View style={styles.hintDot} />

        <Text style={styles.interactionHintText}>
          {selectedKey
            ? "TAP AGAIN TO CLOSE · OR SELECT ANOTHER"
            : "TAP A PLANET TO EXPLORE"}
        </Text>
      </Pressable>

      {/* SELECTED CATEGORY DETAILS */}

      {selectedNode && (
        <Animated.View
          key={selectedNode.key}
          entering={FadeInDown.duration(280)}
          style={styles.detailsWrapper}
        >
          <SelectedNodeDetails
            node={selectedNode}
            onClose={() => setSelectedKey(null)}
          />
        </Animated.View>
      )}

      {/* STRONGEST CATEGORY INSIGHT */}

      {strongest && (
        <View style={styles.insight}>
          <Text style={styles.insightText}>
            {strongest.label} received the most recorded time (
            {formatPercentage(strongest.share)}
            ).
          </Text>
        </View>
      )}
    </View>
  );
}

/*
 * STYLES
 */

const styles = StyleSheet.create({
  /*
   * CONTAINER
   */

  container: {
    marginTop: 20,
    marginBottom: 20,
  },

  /*
   * HEADER
   */

  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  headingSquare: {
    width: 5,
    height: 5,
    backgroundColor: COLORS.gold,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },

  /*
   * SCENE
   */

  scene: {
    alignSelf: "center",
    marginTop: 10,
    position: "relative",
  },

  /*
   * CORE
   */

  coreContent: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },

  coreTime: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "700",
  },

  coreLabel: {
    color: COLORS.text,
    fontSize: 10,
    letterSpacing: 1.2,
    marginTop: 3,
  },

  corePeriod: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 6,
  },

  /*
   * INTERACTIVE PLANETS
   */

  nodeTouch: {
    position: "absolute",
    width: 76,
    height: 60,
    alignItems: "center",
  },

  planetPressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  nodeLabel: {
    position: "absolute",
    top: 65,
    width: 76,
    alignItems: "center",
  },

  nodeName: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    minHeight: 25,
  },

  nodeTime: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },

  nodeShare: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  /*
   * DETAILS PANEL
   */

  detailsWrapper: {
    marginTop: 10,
  },

  details: {
    padding: 16,
  },

  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  detailsTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },

  close: {
    color: COLORS.muted,
    fontSize: 15,
  },

  detailsTotal: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },

  /*
   * INDIVIDUAL CATEGORY
   */

  categorySummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 15,
    paddingVertical: 10,
  },

  categoryAccent: {
    width: 3,
    height: 28,
    borderRadius: 2,
  },

  categorySummaryText: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 19,
    flex: 1,
  },

  /*
   * GROUPED CATEGORIES
   */

  groupedList: {
    marginTop: 15,
  },

  groupedRow: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  groupedCategoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },

  groupedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  groupedCategoryName: {
    color: COLORS.text,
    fontSize: 12,
    flexShrink: 1,
  },

  groupedCategoryValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },

  groupedCategoryTime: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },

  groupedCategoryShare: {
    color: COLORS.muted,
    fontSize: 11,
    minWidth: 34,
    textAlign: "right",
  },

  groupedDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.7,
  },

  /*
   * INSIGHT
   */

  insight: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gold,
    backgroundColor: COLORS.surface,
  },

  insightText: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 19,
  },
  interactionHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
  },

  hintDot: {
    width: 5,
    height: 5,
    backgroundColor: COLORS.gold,
    transform: [{ rotate: "45deg" }],
  },

  interactionHintText: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    textAlign: "center",
  },
});
