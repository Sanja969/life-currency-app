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
  Polygon,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { CosmicPanel } from "@/components/ui/CosmicPanel";

import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";
import { ActivityClassification } from "@/types/activity";

import { formatDuration } from "@/utils/formatDuration";

import type { DailyProgressStat, ProgressPeriod } from "../hooks/useProgress";

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

type WeeklyPatternProps = {
  days: DailyProgressStat[];
  period: Extract<ProgressPeriod, "thisWeek" | "lastWeek">;
};

type EnergyCrystalProps = {
  day: DailyProgressStat;
  maxGrowingMinutes: number;
  width: number;
  height: number;
  selected: boolean;
  current: boolean;
  upcoming: boolean;
  crystalId: string;
  index: number;
};

// -----------------------------------------------------------------------------
// THEME
// -----------------------------------------------------------------------------

const growingColor = CLASSIFICATION_THEME[ActivityClassification.Serves].color;

const restoringColor =
  CLASSIFICATION_THEME[ActivityClassification.Restores].color;

const leakColor =
  CLASSIFICATION_THEME[ActivityClassification.DoesNotServe].color;

const CRYSTAL_HEIGHT = 184;

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function getDayKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatSelectedDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getDominantClassification(day: DailyProgressStat): string | null {
  if (day.totalMinutes <= 0) {
    return null;
  }

  const values = [
    { label: "Growing", minutes: day.growingMinutes },
    { label: "Restoring", minutes: day.restoringMinutes },
    { label: "Life Leaks", minutes: day.leakMinutes },
  ];

  const maximum = Math.max(...values.map((item) => item.minutes));

  const dominant = values.filter((item) => item.minutes === maximum);

  return dominant.length === 1 ? dominant[0].label : null;
}

function getDayInsight(day: DailyProgressStat): string {
  if (day.totalMinutes <= 0) {
    return "No activities recorded for this day yet.";
  }

  const dominant = getDominantClassification(day);

  if (dominant === "Growing") {
    return "Growth received the largest share of your recorded time.";
  }

  if (dominant === "Restoring") {
    return "Rest and renewal received the largest share of your recorded time.";
  }

  if (dominant === "Life Leaks") {
    return "Life Leaks received the largest share of your recorded time.";
  }

  return "Your recorded time was shared across different activities.";
}

// -----------------------------------------------------------------------------
// ENERGY CRYSTAL
// -----------------------------------------------------------------------------

function EnergyCrystal({
  day,
  maxGrowingMinutes,
  width,
  height,
  selected,
  current,
  upcoming,
  crystalId,
  index,
}: EnergyCrystalProps) {
  const cx = width / 2;
  const groundY = height - 20;

  const hasData = day.totalMinutes > 0;
  const highlighted = selected || current;

  const growthRatio =
    maxGrowingMinutes > 0 ? day.growingMinutes / maxGrowingMinutes : 0;

  const restoringRatio = hasData ? day.restoringMinutes / day.totalMinutes : 0;

  const leakRatio = hasData ? day.leakMinutes / day.totalMinutes : 0;

  // Small variations make the crystal formation feel organic.
  const variations = [
    { lean: -2, width: 0.76 },
    { lean: 3, width: 0.9 },
    { lean: -3, width: 0.8 },
    { lean: 0, width: 1 },
    { lean: 2, width: 0.86 },
    { lean: -2, width: 0.94 },
    { lean: 3, width: 0.78 },
  ];

  const variation = variations[index % variations.length];

  /*
   * CRYSTAL DEVELOPMENT
   *
   * 0: Dormant crystal
   * 1: Emerging crystal
   * 2: Formed crystal
   * 3: Radiant crystal
   */

  const stage = !hasData
    ? 0
    : day.growingMinutes === 0 || growthRatio < 0.35
      ? 1
      : growthRatio < 0.7
        ? 2
        : 3;

  const crystalHeight =
    stage === 0 ? 13 : stage === 1 ? 47 : stage === 2 ? 88 : 132;

  const crystalWidth = Math.min(width * 0.68, 28) * variation.width;

  const topY = groundY - crystalHeight;

  const topX = cx + variation.lean;

  const leftX = cx - crystalWidth / 2;
  const rightX = cx + crystalWidth / 2;

  const shoulderY = topY + crystalHeight * 0.23;

  const middleY = topY + crystalHeight * 0.6;

  const bottomY = groundY;

  const leftShoulderX = cx - crystalWidth * 0.44;

  const rightShoulderX = cx + crystalWidth * 0.44;

  const centerFacetX = cx + variation.lean * 0.35;

  const crystalGradientId = `crystal-main-${crystalId}`;
  const coreGradientId = `crystal-core-${crystalId}`;
  const groundGradientId = `crystal-ground-${crystalId}`;

  const opacity = upcoming ? 0.27 : 1;

  const restoringCount =
    day.restoringMinutes <= 0
      ? 0
      : Math.min(3, Math.max(1, Math.ceil(restoringRatio * 4)));

  const fallenCount =
    day.leakMinutes <= 0
      ? 0
      : Math.min(3, Math.max(1, Math.ceil(leakRatio * 4)));

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        {/* MAIN CRYSTAL GRADIENT */}

        <LinearGradient id={crystalGradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={growingColor} stopOpacity={0.7} />

          <Stop offset="55%" stopColor={growingColor} stopOpacity={0.25} />

          <Stop
            offset="100%"
            stopColor={COLORS.background}
            stopOpacity={0.25}
          />
        </LinearGradient>

        {/* INNER ENERGY */}

        <RadialGradient id={coreGradientId} cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop
            offset="0%"
            stopColor={day.restoringMinutes > 0 ? restoringColor : growingColor}
            stopOpacity={0.5}
          />

          <Stop offset="100%" stopColor={growingColor} stopOpacity={0} />
        </RadialGradient>

        {/* GROUND AURA */}

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
            stopOpacity={highlighted ? 0.32 : 0.09}
          />

          <Stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <G opacity={opacity}>
        {/* GROUND GLOW */}

        <Ellipse
          cx={cx}
          cy={groundY + 5}
          rx={width * 0.48}
          ry={14}
          fill={`url(#${groundGradientId})`}
        />

        {/* GROUND LINE */}

        <Path
          d={`M ${cx - width * 0.4} ${groundY + 7}
              Q ${cx} ${groundY + 10}
              ${cx + width * 0.4} ${groundY + 7}`}
          fill="none"
          stroke={COLORS.gold}
          strokeOpacity={highlighted ? 0.55 : 0.17}
          strokeWidth={1}
        />

        {/* CRYSTAL SHADOW */}

        <Ellipse
          cx={cx}
          cy={groundY + 2}
          rx={crystalWidth * 0.7}
          ry={3}
          fill={growingColor}
          fillOpacity={0.1}
        />

        {/* MAIN CRYSTAL */}

        <Polygon
          points={`
            ${topX},${topY}
            ${rightShoulderX},${shoulderY}
            ${rightX},${bottomY}
            ${leftX},${bottomY}
            ${leftShoulderX},${shoulderY}
          `}
          fill={`url(#${crystalGradientId})`}
          stroke={growingColor}
          strokeWidth={stage === 0 ? 0.7 : 1.1}
          strokeOpacity={stage === 0 ? 0.5 : 0.85}
        />

        {/* LEFT FACET */}

        <Polygon
          points={`
            ${topX},${topY}
            ${leftShoulderX},${shoulderY}
            ${leftX},${bottomY}
            ${centerFacetX},${middleY}
          `}
          fill={growingColor}
          fillOpacity={stage === 0 ? 0.08 : 0.25}
        />

        {/* RIGHT FACET */}

        <Polygon
          points={`
            ${topX},${topY}
            ${rightShoulderX},${shoulderY}
            ${rightX},${bottomY}
            ${centerFacetX},${middleY}
          `}
          fill={COLORS.lightGold}
          fillOpacity={stage === 0 ? 0.03 : 0.1}
        />

        {/* CENTRAL FACET */}

        <Polygon
          points={`
            ${topX},${topY}
            ${centerFacetX},${middleY}
            ${cx},${bottomY}
          `}
          fill={growingColor}
          fillOpacity={0.12}
        />

        {/* FACET EDGES */}

        <Path
          d={`
            M ${topX} ${topY}
            L ${centerFacetX} ${middleY}
            L ${cx} ${bottomY}

            M ${leftShoulderX} ${shoulderY}
            L ${centerFacetX} ${middleY}

            M ${rightShoulderX} ${shoulderY}
            L ${centerFacetX} ${middleY}
          `}
          fill="none"
          stroke={COLORS.lightGold}
          strokeOpacity={stage === 0 ? 0.12 : 0.35}
          strokeWidth={0.7}
        />

        {/* INNER ENERGY CORE */}

        {hasData && !upcoming && (
          <>
            <Ellipse
              cx={cx}
              cy={groundY - crystalHeight * 0.48}
              rx={crystalWidth * 0.4}
              ry={crystalHeight * 0.3}
              fill={`url(#${coreGradientId})`}
            />

            <Line
              x1={cx}
              y1={groundY - crystalHeight * 0.22}
              x2={cx}
              y2={groundY - crystalHeight * 0.74}
              stroke={day.restoringMinutes > 0 ? restoringColor : growingColor}
              strokeWidth={1.2}
              strokeOpacity={0.65}
            />
          </>
        )}

        {/* RESTORING FRAGMENTS */}

        {Array.from({ length: restoringCount }, (_, fragmentIndex) => {
          const side = fragmentIndex % 2 === 0 ? 1 : -1;

          const x = cx + side * (crystalWidth * 0.7 + 4);

          const y = groundY - crystalHeight * (0.3 + fragmentIndex * 0.16);

          const fragmentSize = 4 + (fragmentIndex % 2);

          return (
            <G key={`restoring-${fragmentIndex}`}>
              <Circle
                cx={x}
                cy={y}
                r={fragmentSize + 4}
                fill={restoringColor}
                fillOpacity={0.07}
              />

              <Polygon
                points={`
                    ${x},${y - fragmentSize}
                    ${x + fragmentSize * 0.65},${y}
                    ${x},${y + fragmentSize}
                    ${x - fragmentSize * 0.65},${y}
                  `}
                fill={restoringColor}
                fillOpacity={0.8}
                stroke={restoringColor}
                strokeWidth={0.5}
              />
            </G>
          );
        })}

        {/* LIFE LEAK FRAGMENTS */}

        {Array.from({ length: fallenCount }, (_, fragmentIndex) => {
          const side = fragmentIndex % 2 === 0 ? -1 : 1;

          const x = cx + side * (12 + fragmentIndex * 4);

          const y = groundY + 1 - (fragmentIndex % 2) * 3;

          return (
            <Polygon
              key={`leak-${fragmentIndex}`}
              points={`
                  ${x},${y - 4}
                  ${x + 3},${y}
                  ${x},${y + 2}
                  ${x - 3},${y}
                `}
              fill={leakColor}
              fillOpacity={0.85}
            />
          );
        })}

        {/* GOLDEN HIGHLIGHT */}

        {highlighted && (
          <>
            <Circle
              cx={topX}
              cy={topY - 7}
              r={1.5}
              fill={COLORS.gold}
              opacity={0.9}
            />

            <Circle
              cx={cx - crystalWidth * 0.9}
              cy={topY + crystalHeight * 0.28}
              r={1}
              fill={COLORS.lightGold}
              opacity={0.7}
            />

            <Circle
              cx={cx + crystalWidth * 0.9}
              cy={topY + crystalHeight * 0.55}
              r={1.2}
              fill={restoringColor}
              opacity={0.7}
            />
          </>
        )}
      </G>
    </Svg>
  );
}

// -----------------------------------------------------------------------------
// DETAIL ROW
// -----------------------------------------------------------------------------

function DetailRow({
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
        <View style={[styles.detailDot, { backgroundColor: color }]} />

        <Text style={styles.detailLabel}>{label}</Text>
      </View>

      <Text style={styles.detailDuration}>{formatDuration(minutes)}</Text>
    </View>
  );
}

// -----------------------------------------------------------------------------
// SELECTED DAY DETAILS
// -----------------------------------------------------------------------------

function SelectedDayDetails({
  day,
  onClose,
}: {
  day: DailyProgressStat;
  onClose: () => void;
}) {
  return (
    <CosmicPanel
      variant="default"
      accent={COLORS.gold}
      contentStyle={styles.detailsContent}
    >
      <View style={styles.detailsHeader}>
        <View style={styles.detailsHeading}>
          <Text style={styles.detailsEyebrow}>YOUR DAY'S ENERGY</Text>

          <Text style={styles.detailsDate}>{formatSelectedDate(day.date)}</Text>
        </View>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close day details"
          hitSlop={12}
        >
          <Text style={styles.closeButton}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Recorded time</Text>

        <Text style={styles.totalValue}>
          {formatDuration(day.totalMinutes)}
        </Text>
      </View>

      <View style={styles.detailsDivider} />

      <View style={styles.detailsList}>
        <DetailRow
          label="Growing"
          minutes={day.growingMinutes}
          color={growingColor}
        />

        <DetailRow
          label="Restoring"
          minutes={day.restoringMinutes}
          color={restoringColor}
        />

        <DetailRow
          label="Life Leaks"
          minutes={day.leakMinutes}
          color={leakColor}
        />
      </View>

      <Text style={styles.detailsInsight}>{getDayInsight(day)}</Text>
    </CosmicPanel>
  );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
export function WeeklyCrystals({ days, period }: WeeklyPatternProps) {
  const { width: screenWidth } = useWindowDimensions();

  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const today = new Date();
  const todayKey = getDayKey(today);

  const isCurrentWeek = period === "thisWeek";

  const daysKey = days.map((day) => getDayKey(day.date)).join("|");

  useEffect(() => {
    setSelectedDayKey(null);
  }, [period, daysKey]);

  const selectedDay =
    days.find((day) => getDayKey(day.date) === selectedDayKey) ?? null;

  const maxGrowingMinutes = useMemo(
    () => Math.max(1, ...days.map((day) => day.growingMinutes)),
    [days],
  );

  const chartWidth = Math.max(250, screenWidth - 76);

  const crystalWidth = chartWidth / Math.max(days.length, 1);

  if (days.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}

      <View style={styles.sectionHeader}>
        <View style={styles.headerRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionTitle}>YOUR WEEKLY ENERGY</Text>
        </View>

        <Text style={styles.sectionDescription}>
          Seven days. Seven expressions of your energy.
        </Text>
      </View>

      {/* CRYSTAL PANEL */}

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.panelContent}
      >
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelEyebrow}>
              {isCurrentWeek ? "THIS WEEK" : "LAST WEEK"}
            </Text>

            <Text style={styles.panelTitle}>Your energy crystals</Text>
          </View>

          <View style={styles.headerAccent}>
            <View style={styles.accentLine} />
            <View style={styles.accentDot} />
          </View>
        </View>

        {/* CRYSTALS */}

        <View style={[styles.crystalGarden, { width: chartWidth }]}>
          <View style={styles.groundLine} />

          <View style={styles.crystalsRow}>
            {days.map((day, index) => {
              const key = getDayKey(day.date);

              const upcoming = isCurrentWeek && key > todayKey;

              const current = isCurrentWeek && key === todayKey;

              const selected = selectedDayKey === key;

              const dayLabel = day.date.toLocaleDateString("en-US", {
                weekday: "short",
              });

              return (
                <Pressable
                  key={key}
                  disabled={upcoming}
                  onPress={() =>
                    setSelectedDayKey((previous) =>
                      previous === key ? null : key,
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Explore ${formatSelectedDate(day.date)}`}
                  accessibilityState={{
                    selected,
                    disabled: upcoming,
                  }}
                  style={[styles.crystalColumn, { width: crystalWidth }]}
                >
                  <EnergyCrystal
                    day={day}
                    maxGrowingMinutes={maxGrowingMinutes}
                    width={crystalWidth}
                    height={CRYSTAL_HEIGHT}
                    selected={selected}
                    current={current}
                    upcoming={upcoming}
                    crystalId={key}
                    index={index}
                  />

                  <Text
                    style={[
                      styles.dayLabel,
                      (selected || current) && styles.activeDayLabel,
                      upcoming && styles.upcomingLabel,
                    ]}
                  >
                    {dayLabel}
                  </Text>

                  <View
                    style={[
                      styles.dayIndicator,
                      (selected || current) && styles.activeDayIndicator,
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
              style={[styles.legendDot, { backgroundColor: growingColor }]}
            />

            <Text style={styles.legendText}>Growth</Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: restoringColor }]}
            />

            <Text style={styles.legendText}>Renewal</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: leakColor }]} />

            <Text style={styles.legendText}>Lost time</Text>
          </View>
        </View>

        <Text style={styles.interactionHint}>
          TAP A CRYSTAL TO EXPLORE YOUR DAY
        </Text>
      </CosmicPanel>

      {/* SELECTED DAY */}

      {selectedDay && (
        <View style={styles.detailsWrapper}>
          <SelectedDayDetails
            day={selectedDay}
            onClose={() => setSelectedDayKey(null)}
          />
        </View>
      )}
    </View>
  );
}

// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------

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

  panelEyebrow: {
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

  headerAccent: {
    flexDirection: "row",
    alignItems: "center",
  },

  accentLine: {
    width: 25,
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.6,
  },

  accentDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  crystalGarden: {
    alignSelf: "center",
    marginTop: 27,
    position: "relative",
  },

  groundLine: {
    position: "absolute",
    left: 8,
    right: 8,
    top: CRYSTAL_HEIGHT - 18,
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.14,
  },

  crystalsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  crystalColumn: {
    alignItems: "center",
  },

  dayLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 9,
    textAlign: "center",
  },

  activeDayLabel: {
    color: COLORS.gold,
  },

  upcomingLabel: {
    color: COLORS.subtle,
    opacity: 0.6,
  },

  dayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginTop: 8,
  },

  activeDayIndicator: {
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

  detailsHeading: {
    flex: 1,
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
