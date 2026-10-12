import { useEffect, useMemo, useRef, useState } from "react";

import {
  Animated,
  Easing,
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
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";
import { ActivityClassification } from "@/types/activity";
import { formatDuration } from "@/utils/formatDuration";

import type {
  DailyProgressStat,
  ProgressPeriod,
} from "../hooks/useProgress";

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

type WeeklyFlamesProps = {
  days: DailyProgressStat[];
  period: Extract<ProgressPeriod, "thisWeek" | "lastWeek">;
};

type EnergyFlameProps = {
  day: DailyProgressStat;
  maxMinutes: number;
  width: number;
  height: number;
  selected: boolean;
  current: boolean;
  upcoming: boolean;
  flameId: string;
  index: number;
};

// -----------------------------------------------------------------------------
// COLORS
// -----------------------------------------------------------------------------

const growingColor =
  CLASSIFICATION_THEME[ActivityClassification.Serves].color;

const restoringColor =
  CLASSIFICATION_THEME[ActivityClassification.Restores].color;

const leakColor =
  CLASSIFICATION_THEME[ActivityClassification.DoesNotServe].color;

const FLAME_HEIGHT = 190;

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

function getDominantClassification(
  day: DailyProgressStat,
): string | null {
  if (day.totalMinutes <= 0) {
    return null;
  }

  const values = [
    { label: "Growing", minutes: day.growingMinutes },
    { label: "Restoring", minutes: day.restoringMinutes },
    { label: "Life Leaks", minutes: day.leakMinutes },
  ];

  const maximum = Math.max(
    ...values.map((item) => item.minutes),
  );

  const dominant = values.filter(
    (item) => item.minutes === maximum,
  );

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
// FLAME PATH
// -----------------------------------------------------------------------------

function createFlamePath(
  cx: number,
  groundY: number,
  flameHeight: number,
  flameWidth: number,
  lean: number,
): string {
  const topX = cx + lean;
  const topY = groundY - flameHeight;

  return `
    M ${cx} ${groundY}

    C ${cx - flameWidth * 0.95} ${groundY - flameHeight * 0.12},
      ${cx - flameWidth * 1.25} ${groundY - flameHeight * 0.34},
      ${cx - flameWidth * 0.72} ${groundY - flameHeight * 0.57}

    C ${cx - flameWidth * 0.4} ${groundY - flameHeight * 0.72},
      ${cx - flameWidth * 0.5} ${groundY - flameHeight * 0.82},
      ${topX} ${topY}

    C ${topX - flameWidth * 0.12} ${topY + flameHeight * 0.22},
      ${cx + flameWidth * 0.75} ${groundY - flameHeight * 0.37},
      ${cx + flameWidth * 0.95} ${groundY - flameHeight * 0.6}

    C ${cx + flameWidth * 1.45} ${groundY - flameHeight * 0.31},
      ${cx + flameWidth * 0.55} ${groundY - flameHeight * 0.07},
      ${cx} ${groundY}

    Z
  `;
}

// -----------------------------------------------------------------------------
// ENERGY FLAME
// -----------------------------------------------------------------------------

function EnergyFlame({
  day,
  maxMinutes,
  width,
  height,
  selected,
  current,
  upcoming,
  flameId,
  index,
}: EnergyFlameProps) {
  const cx = width / 2;
  const groundY = height - 19;

  const hasData = day.totalMinutes > 0;
  const highlighted = selected || current;

  const intensity =
    maxMinutes > 0 ? day.totalMinutes / maxMinutes : 0;

  const growingRatio = hasData
    ? day.growingMinutes / day.totalMinutes
    : 0;

  const restoringRatio = hasData
    ? day.restoringMinutes / day.totalMinutes
    : 0;

  const leakRatio = hasData
    ? day.leakMinutes / day.totalMinutes
    : 0;

  // ---------------------------------------------------------------------------
  // ANIMATION
  // ---------------------------------------------------------------------------

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hasData || upcoming) {
      pulse.setValue(0);
      return;
    }

    const duration = 2200 + index * 170;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),

        Animated.timing(pulse, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [hasData, upcoming, index, pulse]);

  const animatedScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.045],
  });

  const animatedOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });

  // ---------------------------------------------------------------------------
  // FLAME GEOMETRY
  // ---------------------------------------------------------------------------

  const variations = [-3, 2, -2, 0, 3, -3, 2];
  const lean = variations[index % variations.length];

  const flameHeight = hasData
    ? 45 + intensity * 92
    : 0;

  const flameWidth = Math.min(width * 0.43, 19);

  const outerPath = createFlamePath(
    cx,
    groundY,
    flameHeight,
    flameWidth,
    lean,
  );

  const innerPath = createFlamePath(
    cx,
    groundY,
    flameHeight * 0.72,
    flameWidth * 0.53,
    lean * 0.35,
  );

  const corePath = createFlamePath(
    cx,
    groundY,
    flameHeight * 0.43,
    flameWidth * 0.27,
    0,
  );

  const dominantColor =
    day.restoringMinutes >= day.growingMinutes &&
    day.restoringMinutes >= day.leakMinutes
      ? restoringColor
      : day.leakMinutes > day.growingMinutes &&
          day.leakMinutes > day.restoringMinutes
        ? leakColor
        : growingColor;

  const outerGradientId = `flame-outer-${flameId}`;
  const innerGradientId = `flame-inner-${flameId}`;
  const auraGradientId = `flame-aura-${flameId}`;
  const groundGradientId = `flame-ground-${flameId}`;

  const opacity = upcoming ? 0.25 : 1;

  const sparkCount =
    day.leakMinutes <= 0
      ? 0
      : Math.min(4, Math.max(1, Math.ceil(leakRatio * 5)));

  return (
    <Animated.View
      style={{
        width,
        height,
        opacity: animatedOpacity,
        transform: [{ scaleY: animatedScale }],
      }}
    >
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <Defs>
          {/* OUTER FLAME GRADIENT */}

          <LinearGradient
            id={outerGradientId}
            x1="0"
            y1="1"
            x2="0"
            y2="0"
          >
            <Stop
              offset="0%"
              stopColor={dominantColor}
              stopOpacity={0.88}
            />

            <Stop
              offset="48%"
              stopColor={dominantColor}
              stopOpacity={0.5}
            />

            <Stop
              offset="100%"
              stopColor={dominantColor}
              stopOpacity={0.1}
            />
          </LinearGradient>

          {/* INNER FLAME GRADIENT */}

          <LinearGradient
            id={innerGradientId}
            x1="0"
            y1="1"
            x2="0"
            y2="0"
          >
            <Stop
              offset="0%"
              stopColor={COLORS.lightGold}
              stopOpacity={0.95}
            />

            <Stop
              offset="42%"
              stopColor={
                restoringRatio > 0.2
                  ? restoringColor
                  : growingColor
              }
              stopOpacity={0.85}
            />

            <Stop
              offset="100%"
              stopColor={dominantColor}
              stopOpacity={0.2}
            />
          </LinearGradient>

          {/* OUTER AURA */}

          <RadialGradient
            id={auraGradientId}
            cx="50%"
            cy="50%"
            rx="50%"
            ry="50%"
          >
            <Stop
              offset="0%"
              stopColor={dominantColor}
              stopOpacity={highlighted ? 0.36 : 0.2}
            />

            <Stop
              offset="100%"
              stopColor={dominantColor}
              stopOpacity={0}
            />
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
              stopOpacity={highlighted ? 0.4 : 0.13}
            />

            <Stop
              offset="100%"
              stopColor={COLORS.gold}
              stopOpacity={0}
            />
          </RadialGradient>
        </Defs>

        <G opacity={opacity}>
          {/* GROUND GLOW */}

          <Ellipse
            cx={cx}
            cy={groundY + 5}
            rx={width * 0.48}
            ry={12}
            fill={`url(#${groundGradientId})`}
          />

          {/* GROUND LINE */}

          <Path
            d={`M ${cx - width * 0.4} ${groundY + 7}
                Q ${cx} ${groundY + 10}
                ${cx + width * 0.4} ${groundY + 7}`}
            fill="none"
            stroke={COLORS.gold}
            strokeOpacity={highlighted ? 0.55 : 0.16}
            strokeWidth={1}
          />

          {!hasData ? (
            <>
              {/* DORMANT SPARK */}

              <Circle
                cx={cx}
                cy={groundY - 7}
                r={3.5}
                fill={COLORS.gold}
                fillOpacity={upcoming ? 0.35 : 0.75}
              />

              <Circle
                cx={cx}
                cy={groundY - 7}
                r={11}
                fill={COLORS.gold}
                fillOpacity={upcoming ? 0.02 : 0.08}
              />
            </>
          ) : (
            <>
              {/* OUTER GLOW */}

              <Ellipse
                cx={cx}
                cy={groundY - flameHeight * 0.46}
                rx={flameWidth * 1.8}
                ry={flameHeight * 0.59}
                fill={`url(#${auraGradientId})`}
              />

              {/* OUTER FLAME */}

              <Path
                d={outerPath}
                fill={`url(#${outerGradientId})`}
                stroke={dominantColor}
                strokeWidth={0.85}
                strokeOpacity={0.7}
              />

              {/* INNER FLAME */}

              <Path
                d={innerPath}
                fill={`url(#${innerGradientId})`}
                fillOpacity={0.9}
              />

              {/* LIGHT CORE */}

              <Path
                d={corePath}
                fill={COLORS.lightGold}
                fillOpacity={0.58}
              />

              {/* GROWING ENERGY */}

              {growingRatio > 0.1 && (
                <Path
                  d={createFlamePath(
                    cx - flameWidth * 0.2,
                    groundY - flameHeight * 0.06,
                    flameHeight *
                      Math.min(0.8, growingRatio),
                    flameWidth * 0.3,
                    -2,
                  )}
                  fill={growingColor}
                  fillOpacity={0.55}
                />
              )}

              {/* RESTORING ENERGY */}

              {restoringRatio > 0.1 && (
                <Path
                  d={createFlamePath(
                    cx + flameWidth * 0.22,
                    groundY - flameHeight * 0.05,
                    flameHeight *
                      Math.min(0.8, restoringRatio),
                    flameWidth * 0.3,
                    2,
                  )}
                  fill={restoringColor}
                  fillOpacity={0.75}
                />
              )}

              {/* LIFE LEAK SPARKS */}

              {Array.from(
                { length: sparkCount },
                (_, sparkIndex) => {
                  const side =
                    sparkIndex % 2 === 0 ? -1 : 1;

                  const x =
                    cx +
                    side *
                      (flameWidth +
                        3 +
                        sparkIndex * 2);

                  const y =
                    groundY -
                    flameHeight *
                      (0.22 + sparkIndex * 0.16);

                  return (
                    <G key={`spark-${sparkIndex}`}>
                      <Circle
                        cx={x}
                        cy={y}
                        r={2.2}
                        fill={leakColor}
                        fillOpacity={0.85}
                      />

                      <Circle
                        cx={x}
                        cy={y}
                        r={5}
                        fill={leakColor}
                        fillOpacity={0.1}
                      />
                    </G>
                  );
                },
              )}

              {/* FLOATING PARTICLES */}

              {highlighted && (
                <>
                  <Circle
                    cx={cx - flameWidth - 6}
                    cy={groundY - flameHeight * 0.65}
                    r={1.2}
                    fill={COLORS.gold}
                    opacity={0.9}
                  />

                  <Circle
                    cx={cx + flameWidth + 5}
                    cy={groundY - flameHeight * 0.4}
                    r={1.1}
                    fill={COLORS.lightGold}
                    opacity={0.75}
                  />

                  <Circle
                    cx={cx + lean}
                    cy={groundY - flameHeight - 8}
                    r={1.4}
                    fill={COLORS.gold}
                    opacity={0.8}
                  />
                </>
              )}
            </>
          )}
        </G>
      </Svg>
    </Animated.View>
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
        <View
          style={[
            styles.detailDot,
            { backgroundColor: color },
          ]}
        />

        <Text style={styles.detailLabel}>
          {label}
        </Text>
      </View>

      <Text style={styles.detailDuration}>
        {formatDuration(minutes)}
      </Text>
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
        <View>
          <Text style={styles.detailsEyebrow}>
            YOUR DAY'S ENERGY
          </Text>

          <Text style={styles.detailsDate}>
            {formatSelectedDate(day.date)}
          </Text>
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
        <Text style={styles.totalLabel}>
          Recorded time
        </Text>

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

      <Text style={styles.detailsInsight}>
        {getDayInsight(day)}
      </Text>
    </CosmicPanel>
  );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function WeeklyFlames({
  days,
  period,
}: WeeklyFlamesProps) {
  const { width: screenWidth } = useWindowDimensions();

  const [selectedDayKey, setSelectedDayKey] =
    useState<string | null>(null);

  const todayKey = getDayKey(new Date());

  const isCurrentWeek = period === "thisWeek";

  const daysKey = days
    .map((day) => getDayKey(day.date))
    .join("|");

  useEffect(() => {
    setSelectedDayKey(null);
  }, [period, daysKey]);

  const selectedDay =
    days.find(
      (day) =>
        getDayKey(day.date) === selectedDayKey,
    ) ?? null;

  const maxMinutes = useMemo(
    () =>
      Math.max(
        1,
        ...days.map((day) => day.totalMinutes),
      ),
    [days],
  );

  const chartWidth = Math.max(
    250,
    screenWidth - 76,
  );

  const columnWidth =
    chartWidth / Math.max(days.length, 1);

  if (days.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}

      <View style={styles.sectionHeader}>
        <View style={styles.headerRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionTitle}>
            YOUR WEEKLY ENERGY
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          Seven days. Seven expressions of your energy.
        </Text>
      </View>

      {/* FLAMES PANEL */}

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.panelContent}
      >
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelEyebrow}>
              {isCurrentWeek
                ? "THIS WEEK"
                : "LAST WEEK"}
            </Text>

            <Text style={styles.panelTitle}>
              Your energy flames
            </Text>
          </View>

          <View style={styles.headerAccent}>
            <View style={styles.accentLine} />
            <View style={styles.accentDot} />
          </View>
        </View>

        {/* FLAMES */}

        <View
          style={[
            styles.flameGarden,
            { width: chartWidth },
          ]}
        >
          <View style={styles.energyLine}>
            <View style={styles.energyLineCore} />
          </View>

          <View style={styles.flamesRow}>
            {days.map((day, index) => {
              const key = getDayKey(day.date);

              const upcoming =
                isCurrentWeek && key > todayKey;

              const current =
                isCurrentWeek && key === todayKey;

              const selected =
                selectedDayKey === key;

              const dayLabel =
                day.date.toLocaleDateString("en-US", {
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
                  accessibilityLabel={`Explore ${formatSelectedDate(
                    day.date,
                  )}`}
                  accessibilityState={{
                    selected,
                    disabled: upcoming,
                  }}
                  style={[
                    styles.flameColumn,
                    { width: columnWidth },
                  ]}
                >
                  <EnergyFlame
                    day={day}
                    maxMinutes={maxMinutes}
                    width={columnWidth}
                    height={FLAME_HEIGHT}
                    selected={selected}
                    current={current}
                    upcoming={upcoming}
                    flameId={key}
                    index={index}
                  />

                  <Text
                    style={[
                      styles.dayLabel,
                      (selected || current) &&
                        styles.activeDayLabel,
                      upcoming && styles.upcomingLabel,
                    ]}
                  >
                    {dayLabel}
                  </Text>

                  <View
                    style={[
                      styles.dayIndicator,
                      (selected || current) &&
                        styles.activeDayIndicator,
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
          TAP A FLAME TO EXPLORE YOUR DAY
        </Text>
      </CosmicPanel>

      {/* SELECTED DAY */}

      {selectedDay && (
        <View style={styles.detailsWrapper}>
          <SelectedDayDetails
            day={selectedDay}
            onClose={() =>
              setSelectedDayKey(null)
            }
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

  flameGarden: {
    alignSelf: "center",
    marginTop: 27,
    position: "relative",
  },

  energyLine: {
    position: "absolute",
    left: 8,
    right: 8,
    top: FLAME_HEIGHT - 17,
    height: 7,
    justifyContent: "center",
    backgroundColor: "rgba(173, 129, 255, 0.025)",
    borderRadius: 10,
  },

  energyLineCore: {
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.32,
  },

  flamesRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  flameColumn: {
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