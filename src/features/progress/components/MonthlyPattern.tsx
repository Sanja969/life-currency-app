import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";
import { ActivityClassification } from "@/types/activity";

import type { ProgressPeriod } from "../hooks/useProgress";
import type { PeriodProgressStat } from "../utils/progressStatistics";

type MonthlyPatternProps = {
  periods: PeriodProgressStat[];
  period: Extract<ProgressPeriod, "thisMonth" | "lastMonth">;
};

type MagicalTreeProps = {
  growingMinutes: number;
  restoringMinutes: number;
  leakMinutes: number;
  totalMinutes: number;
  maxGrowingMinutes: number;
  width: number;
  height: number;
  selected: boolean;
  current: boolean;
  upcoming: boolean;
  treeId: string;
};

const growingColor =
  CLASSIFICATION_THEME[ActivityClassification.Serves].color;

const restoringColor =
  CLASSIFICATION_THEME[ActivityClassification.Restores].color;

const leakColor =
  CLASSIFICATION_THEME[ActivityClassification.DoesNotServe].color;

const TREE_HEIGHT = 190;

function formatMinutes(value: number): string {
  const total = Math.max(0, Math.round(value));
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}m`;
}

function getDayKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getWeekLabel(
  startDate: Date,
  endDate: Date,
): string {
  return `${startDate.getDate()}–${endDate.getDate()}`;
}

function getFullWeekLabel(
  startDate: Date,
  endDate: Date,
): string {
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  const start = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (sameMonth) {
    return `${start}–${endDate.getDate()}`;
  }

  const end = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${start}–${end}`;
}

function isDateWithinPeriod(
  date: Date,
  period: PeriodProgressStat,
): boolean {
  const day = getDayKey(date);

  return (
    day >= getDayKey(period.startDate) &&
    day <= getDayKey(period.endDate)
  );
}

/**
 * MAGICAL TREE
 *
 * Four visual stages:
 * 0: Dormant seed
 * 1: Sprout
 * 2: Young tree
 * 3: Blooming tree
 *
 * Growing controls canopy development.
 * Restoring controls luminous flowers.
 * Life Leaks appear as fallen amber leaves.
 *
 * Stages are relative to the visible month.
 */
function MagicalTree({
  growingMinutes,
  restoringMinutes,
  leakMinutes,
  totalMinutes,
  maxGrowingMinutes,
  width,
  height,
  selected,
  current,
  upcoming,
  treeId,
}: MagicalTreeProps) {
  const cx = width / 2;
  const groundY = height - 22;

  const hasData = totalMinutes > 0;
  const highlighted = selected || current;

  const growthRatio =
    maxGrowingMinutes > 0
      ? growingMinutes / maxGrowingMinutes
      : 0;

  const restoringRatio =
    totalMinutes > 0
      ? restoringMinutes / totalMinutes
      : 0;

  const leakRatio =
    totalMinutes > 0
      ? leakMinutes / totalMinutes
      : 0;

  let stage = 0;

  if (hasData) {
    if (growingMinutes === 0) {
      stage = 1;
    } else if (growthRatio < 0.35) {
      stage = 1;
    } else if (growthRatio < 0.7) {
      stage = 2;
    } else {
      stage = 3;
    }
  }

  const treeHeight =
    stage === 1
      ? 53
      : stage === 2
        ? 100
        : stage === 3
          ? 142
          : 0;

  const trunkTop = groundY - treeHeight;

  const canopyRadius =
    stage === 1
      ? Math.min(10, width * 0.18)
      : stage === 2
        ? Math.min(20, width * 0.34)
        : Math.min(27, width * 0.45);

  const flowerCount =
    restoringMinutes <= 0
      ? 0
      : Math.min(
          5,
          Math.max(
            1,
            Math.ceil(restoringRatio * 6),
          ),
        );

  const fallenLeafCount =
    leakMinutes <= 0
      ? 0
      : Math.min(
          3,
          Math.max(
            1,
            Math.ceil(leakRatio * 4),
          ),
        );

  const opacity = upcoming ? 0.32 : 1;

  const trunkGradientId = `trunk-${treeId}`;
  const canopyGradientId = `canopy-${treeId}`;
  const groundGradientId = `ground-${treeId}`;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <Defs>
        <LinearGradient
          id={trunkGradientId}
          x1="0"
          y1="1"
          x2="0"
          y2="0"
        >
          <Stop
            offset="0%"
            stopColor={COLORS.gold}
            stopOpacity={0.35}
          />

          <Stop
            offset="100%"
            stopColor={growingColor}
            stopOpacity={0.95}
          />
        </LinearGradient>

        <RadialGradient
          id={canopyGradientId}
          cx="50%"
          cy="50%"
          rx="50%"
          ry="50%"
        >
          <Stop
            offset="0%"
            stopColor={growingColor}
            stopOpacity={0.7}
          />

          <Stop
            offset="65%"
            stopColor={growingColor}
            stopOpacity={0.35}
          />

          <Stop
            offset="100%"
            stopColor={growingColor}
            stopOpacity={0}
          />
        </RadialGradient>

        <RadialGradient
          id={groundGradientId}
          cx="50%"
          cy="50%"
          rx="50%"
          ry="50%"
        >
          <Stop
            offset="0%"
            stopColor={COLORS.gold}
            stopOpacity={highlighted ? 0.25 : 0.08}
          />

          <Stop
            offset="100%"
            stopColor={COLORS.gold}
            stopOpacity={0}
          />
        </RadialGradient>
      </Defs>

      <G opacity={opacity}>
        {/* GROUND AURA */}

        <Ellipse
          cx={cx}
          cy={groundY + 5}
          rx={width * 0.48}
          ry={14}
          fill={`url(#${groundGradientId})`}
        />

        {/* SOIL */}

        <Path
          d={`M ${cx - width * 0.38} ${groundY + 6}
              Q ${cx} ${groundY + 11}
              ${cx + width * 0.38} ${groundY + 6}`}
          stroke={COLORS.gold}
          strokeOpacity={highlighted ? 0.6 : 0.18}
          strokeWidth={1}
          fill="none"
        />

        {stage === 0 ? (
          <>
            {/* DORMANT SEED */}

            <Circle
              cx={cx}
              cy={groundY - 5}
              r={12}
              fill={COLORS.gold}
              fillOpacity={upcoming ? 0.025 : 0.06}
            />

            <Ellipse
              cx={cx}
              cy={groundY - 5}
              rx={5}
              ry={7}
              fill={upcoming ? COLORS.subtle : COLORS.gold}
              fillOpacity={upcoming ? 0.5 : 0.8}
            />

            <Circle
              cx={cx - 1}
              cy={groundY - 8}
              r={1.2}
              fill={COLORS.lightGold}
              opacity={upcoming ? 0.2 : 0.8}
            />
          </>
        ) : (
          <>
            {/* ROOTS */}

            <Path
              d={`M ${cx} ${groundY}
                  Q ${cx - 7} ${groundY + 4}
                  ${cx - 14} ${groundY + 7}
                  M ${cx} ${groundY}
                  Q ${cx + 7} ${groundY + 4}
                  ${cx + 14} ${groundY + 7}`}
              stroke={COLORS.gold}
              strokeOpacity={0.25}
              strokeWidth={1}
              fill="none"
            />

            {/* TRUNK GLOW */}

            <Path
              d={`M ${cx} ${groundY}
                  Q ${cx - 5} ${groundY - treeHeight * 0.45}
                  ${cx} ${trunkTop}`}
              stroke={growingColor}
              strokeOpacity={0.12}
              strokeWidth={9}
              strokeLinecap="round"
              fill="none"
            />

            {/* TRUNK */}

            <Path
              d={`M ${cx} ${groundY}
                  Q ${cx - 5} ${groundY - treeHeight * 0.45}
                  ${cx} ${trunkTop}`}
              stroke={`url(#${trunkGradientId})`}
              strokeWidth={stage === 3 ? 3.5 : 2.4}
              strokeLinecap="round"
              fill="none"
            />

            {/* BRANCHES */}

            {stage >= 2 && (
              <>
                <Path
                  d={`M ${cx} ${groundY - treeHeight * 0.55}
                      Q ${cx - 14} ${groundY - treeHeight * 0.75}
                      ${cx - canopyRadius * 0.85}
                      ${trunkTop + canopyRadius * 0.55}`}
                  stroke={growingColor}
                  strokeWidth={2}
                  strokeOpacity={0.8}
                  fill="none"
                  strokeLinecap="round"
                />

                <Path
                  d={`M ${cx} ${groundY - treeHeight * 0.6}
                      Q ${cx + 13} ${groundY - treeHeight * 0.8}
                      ${cx + canopyRadius * 0.85}
                      ${trunkTop + canopyRadius * 0.6}`}
                  stroke={growingColor}
                  strokeWidth={2}
                  strokeOpacity={0.8}
                  fill="none"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* CANOPY GLOW */}

            <Circle
              cx={cx}
              cy={trunkTop + canopyRadius * 0.5}
              r={canopyRadius * 1.5}
              fill={`url(#${canopyGradientId})`}
              opacity={0.6}
            />

            {/* CANOPY CLUSTERS */}

            {[
              [-0.55, 0.65, 0.7],
              [0.55, 0.65, 0.7],
              [0, 0.15, 0.85],
              [-0.25, 1.1, 0.75],
              [0.25, 1.1, 0.75],
            ].map(([offsetX, offsetY, scale], index) => {
              const x = cx + offsetX * canopyRadius;
              const y = trunkTop + offsetY * canopyRadius;

              return (
                <G key={`canopy-${index}`}>
                  <Circle
                    cx={x}
                    cy={y}
                    r={canopyRadius * scale}
                    fill={growingColor}
                    fillOpacity={
                      stage === 1 ? 0.12 : 0.18
                    }
                  />

                  <Circle
                    cx={x}
                    cy={y}
                    r={canopyRadius * scale * 0.72}
                    fill={growingColor}
                    fillOpacity={0.2}
                  />
                </G>
              );
            })}

            {/* LEAF LIGHTS */}

            {[
              [-0.65, 0.6],
              [0.6, 0.5],
              [-0.3, 0.1],
              [0.25, 0.2],
              [0, 1.1],
              [-0.45, 1.2],
              [0.5, 1.15],
            ].map(([offsetX, offsetY], index) => {
              if (stage === 1 && index > 1) {
                return null;
              }

              if (stage === 2 && index > 4) {
                return null;
              }

              return (
                <Circle
                  key={`light-${index}`}
                  cx={cx + offsetX * canopyRadius}
                  cy={trunkTop + offsetY * canopyRadius}
                  r={stage === 3 ? 2.5 : 2}
                  fill={growingColor}
                  opacity={0.75}
                />
              );
            })}

            {/* RESTORING FLOWERS */}

            {Array.from(
              { length: flowerCount },
              (_, index) => {
                const positions = [
                  [-0.6, 0.4],
                  [0.55, 0.55],
                  [0, 0.05],
                  [-0.3, 1.05],
                  [0.35, 1.1],
                ];

                const [offsetX, offsetY] =
                  positions[index];

                const x =
                  cx + offsetX * canopyRadius;

                const y =
                  trunkTop + offsetY * canopyRadius;

                return (
                  <G key={`flower-${index}`}>
                    <Circle
                      cx={x}
                      cy={y}
                      r={9}
                      fill={restoringColor}
                      fillOpacity={0.1}
                    />

                    <Circle
                      cx={x}
                      cy={y}
                      r={3.5}
                      fill={restoringColor}
                      fillOpacity={0.9}
                    />

                    <Circle
                      cx={x}
                      cy={y}
                      r={1.2}
                      fill={COLORS.lightGold}
                    />
                  </G>
                );
              },
            )}

            {/* FALLEN LEAVES */}

            {Array.from(
              { length: fallenLeafCount },
              (_, index) => {
                const side =
                  index % 2 === 0 ? -1 : 1;

                const x =
                  cx + side * (11 + index * 4);

                const y =
                  groundY + 2 - (index % 2) * 3;

                return (
                  <Ellipse
                    key={`fallen-${index}`}
                    cx={x}
                    cy={y}
                    rx={5}
                    ry={2}
                    fill={leakColor}
                    fillOpacity={0.8}
                    rotation={side * 25}
                    origin={`${x}, ${y}`}
                  />
                );
              },
            )}

            {/* FLOATING PARTICLES */}

            {highlighted && (
              <>
                <Circle
                  cx={cx - canopyRadius - 5}
                  cy={trunkTop + 5}
                  r={1.4}
                  fill={COLORS.gold}
                  opacity={0.8}
                />

                <Circle
                  cx={cx + canopyRadius + 4}
                  cy={trunkTop + 18}
                  r={1}
                  fill={restoringColor}
                  opacity={0.7}
                />

                <Circle
                  cx={cx + 5}
                  cy={trunkTop - 12}
                  r={1.3}
                  fill={COLORS.lightGold}
                  opacity={0.8}
                />
              </>
            )}
          </>
        )}
      </G>
    </Svg>
  );
}

function ClassificationRow({
  label,
  minutes,
  color,
}: {
  label: string;
  minutes: number;
  color: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelContainer}>
        <View
          style={[
            styles.detailDot,
            { backgroundColor: color },
          ]}
        />

        <Text style={styles.detailLabel}>{label}</Text>
      </View>

      <Text style={styles.detailDuration}>
        {formatMinutes(minutes)}
      </Text>
    </View>
  );
}

function SelectedWeekDetails({
  selectedPeriod,
  onClose,
}: {
  selectedPeriod: PeriodProgressStat;
  onClose: () => void;
}) {
  const classifications = [
    {
      label: "Growing",
      minutes: selectedPeriod.growingMinutes,
      color: growingColor,
    },
    {
      label: "Restoring",
      minutes: selectedPeriod.restoringMinutes,
      color: restoringColor,
    },
    {
      label: "Life Leaks",
      minutes: selectedPeriod.leakMinutes,
      color: leakColor,
    },
  ];

  const highest = Math.max(
    ...classifications.map((item) => item.minutes),
  );

  const dominant = classifications.filter(
    (item) => item.minutes === highest,
  );

  const insight =
    selectedPeriod.totalMinutes === 0
      ? "Your garden is waiting for its first activity."
      : dominant.length !== 1
        ? "Your time was shared across different kinds of activities."
        : dominant[0].label === "Growing"
          ? "You gave the largest share of your recorded time to growth."
          : dominant[0].label === "Restoring"
            ? "Rest and renewal received the largest share of your time."
            : "Life Leaks took the largest share of your recorded time.";

  return (
    <View style={styles.detailsWrapper}>
      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.detailsContent}
      >
        <View style={styles.detailsHeader}>
          <View>
            <Text style={styles.detailsEyebrow}>
              A WEEK IN YOUR GARDEN
            </Text>

            <Text style={styles.detailsDate}>
              {getFullWeekLabel(
                selectedPeriod.startDate,
                selectedPeriod.endDate,
              )}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close weekly details"
            hitSlop={12}
          >
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            Recorded time
          </Text>

          <Text style={styles.totalValue}>
            {formatMinutes(selectedPeriod.totalMinutes)}
          </Text>
        </View>

        <View style={styles.detailsDivider} />

        <View style={styles.detailsList}>
          {classifications.map((item) => (
            <ClassificationRow
              key={item.label}
              label={item.label}
              minutes={item.minutes}
              color={item.color}
            />
          ))}
        </View>

        <Text style={styles.detailsInsight}>
          {insight}
        </Text>
      </CosmicPanel>
    </View>
  );
}

export function MonthlyPattern({
  periods,
  period,
}: MonthlyPatternProps) {
  const { width: screenWidth } = useWindowDimensions();

  const [selectedPeriodKey, setSelectedPeriodKey] =
    useState<string | null>(null);

  const today = new Date();
  const todayKey = getDayKey(today);

  const isCurrentMonth = period === "thisMonth";

  const periodsKey = periods
    .map((item) => getDayKey(item.startDate))
    .join("|");

  useEffect(() => {
    setSelectedPeriodKey(null);
  }, [period, periodsKey]);

  const selectedPeriod =
    periods.find(
      (item) =>
        getDayKey(item.startDate) === selectedPeriodKey,
    ) ?? null;

  const maxGrowingMinutes = useMemo(
    () =>
      Math.max(
        1,
        ...periods.map((item) => item.growingMinutes),
      ),
    [periods],
  );

  const chartWidth = Math.max(
    250,
    screenWidth - 76,
  );

  const plantWidth =
    chartWidth / Math.max(periods.length, 1);

  const monthLabel = periods[0]?.startDate
    .toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  if (periods.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.sectionHeader}>
        <View style={styles.headerRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionTitle}>
            YOUR LIFE GARDEN
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          Watch your time come to life.
        </Text>
      </View>

      {/* GARDEN PANEL */}

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.panelContent}
      >
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.monthEyebrow}>
              {monthLabel}
            </Text>

            <Text style={styles.panelTitle}>
              A month of becoming
            </Text>
          </View>

          <View style={styles.headerSparkle}>
            <View style={styles.sparkleLine} />
            <View style={styles.sparkleDot} />
          </View>
        </View>

        {/* GARDEN */}

        <View
          style={[
            styles.garden,
            { width: chartWidth },
          ]}
        >
          <View style={styles.gardenHorizon} />

          <View style={styles.plantsRow}>
            {periods.map((item) => {
              const key = getDayKey(item.startDate);

              const upcoming =
                isCurrentMonth &&
                key > todayKey;

              const current =
                isCurrentMonth &&
                isDateWithinPeriod(today, item);

              const selected =
                selectedPeriodKey === key;

              return (
                <Pressable
                  key={key}
                  disabled={upcoming}
                  onPress={() =>
                    setSelectedPeriodKey(
                      (previous) =>
                        previous === key ? null : key,
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Explore ${getFullWeekLabel(
                    item.startDate,
                    item.endDate,
                  )}`}
                  accessibilityState={{
                    selected,
                    disabled: upcoming,
                  }}
                  style={[
                    styles.plantColumn,
                    { width: plantWidth },
                  ]}
                >
                  <MagicalTree
                    growingMinutes={item.growingMinutes}
                    restoringMinutes={item.restoringMinutes}
                    leakMinutes={item.leakMinutes}
                    totalMinutes={item.totalMinutes}
                    maxGrowingMinutes={maxGrowingMinutes}
                    width={plantWidth}
                    height={TREE_HEIGHT}
                    selected={selected}
                    current={current}
                    upcoming={upcoming}
                    treeId={key}
                  />

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.weekLabel,
                      (selected || current) &&
                        styles.activeWeekLabel,
                      upcoming && styles.upcomingLabel,
                    ]}
                  >
                    {getWeekLabel(
                      item.startDate,
                      item.endDate,
                    )}
                  </Text>

                  <View
                    style={[
                      styles.weekIndicator,
                      (selected || current) &&
                        styles.activeWeekIndicator,
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* LEGEND */}

        <View style={styles.legendDivider} />

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: growingColor },
              ]}
            />

            <Text style={styles.legendText}>
              Growth
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: restoringColor },
              ]}
            />

            <Text style={styles.legendText}>
              Renewal
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: leakColor },
              ]}
            />

            <Text style={styles.legendText}>
              Lost time
            </Text>
          </View>
        </View>

        <Text style={styles.interactionHint}>
          TAP A TREE TO EXPLORE YOUR WEEK
        </Text>
      </CosmicPanel>

      {/* WEEK DETAILS */}

      {selectedPeriod && (
        <SelectedWeekDetails
          selectedPeriod={selectedPeriod}
          onClose={() =>
            setSelectedPeriodKey(null)
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },

  sectionHeader: {
    marginBottom: 15,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
  },

  sectionTitle: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  sectionDescription: {
    color: COLORS.subtle,
    fontSize: 12,
    marginTop: 8,
  },

  panelContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 22,
  },

  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  monthEyebrow: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.6,
  },

  panelTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
    marginTop: 7,
  },

  headerSparkle: {
    flexDirection: "row",
    alignItems: "center",
  },

  sparkleLine: {
    width: 25,
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.6,
  },

  sparkleDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  garden: {
    alignSelf: "center",
    marginTop: 25,
    position: "relative",
  },

  gardenHorizon: {
    position: "absolute",
    left: 8,
    right: 8,
    top: TREE_HEIGHT - 20,
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.14,
  },

  plantsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  plantColumn: {
    alignItems: "center",
  },

  weekLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 9,
    textAlign: "center",
  },

  activeWeekLabel: {
    color: COLORS.gold,
  },

  upcomingLabel: {
    color: COLORS.subtle,
    opacity: 0.6,
  },

  weekIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginTop: 8,
  },

  activeWeekIndicator: {
    backgroundColor: COLORS.gold,
  },

  legendDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 22,
  },

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 18,
    marginTop: 18,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  legendText: {
    color: COLORS.muted,
    fontSize: 11,
  },

  interactionHint: {
    color: COLORS.subtle,
    fontSize: 9,
    letterSpacing: 1.2,
    textAlign: "center",
    marginTop: 23,
  },

  detailsWrapper: {
    marginTop: 15,
  },

  detailsContent: {
    padding: 20,
  },

  detailsHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  detailsEyebrow: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  detailsDate: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
    marginTop: 7,
  },

  closeButton: {
    color: COLORS.muted,
    fontSize: 16,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
  },

  totalLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },

  totalValue: {
    color: COLORS.lightGold,
    fontSize: 21,
    fontWeight: "700",
  },

  detailsDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 16,
  },

  detailsList: {
    marginTop: 18,
    gap: 14,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  detailDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  detailLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },

  detailDuration: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },

  detailsInsight: {
    color: COLORS.subtle,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 22,
  },
});