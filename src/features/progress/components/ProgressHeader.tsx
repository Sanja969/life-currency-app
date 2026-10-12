import { useEffect, useState } from "react";

import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Svg, { Defs, LinearGradient, Line, Stop } from "react-native-svg";

import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { ScreenHeader } from "@/components/layout/ScreenHeader";

import { COLORS } from "@/theme/colors";

import type { ProgressPeriod } from "../hooks/useProgress";

type ProgressHeaderProps = {
  period: ProgressPeriod;
  onPeriodChange: (period: ProgressPeriod) => void;
};

type TimeUnit = "week" | "month";
type TimePosition = "current" | "previous";

const PERIOD_MAP: Record<TimeUnit, Record<TimePosition, ProgressPeriod>> = {
  week: {
    current: "thisWeek",
    previous: "lastWeek",
  },
  month: {
    current: "thisMonth",
    previous: "lastMonth",
  },
};

const PERIOD_LABELS: Record<ProgressPeriod, string> = {
  thisWeek: "THIS WEEK",
  lastWeek: "LAST WEEK",
  thisMonth: "THIS MONTH",
  lastMonth: "LAST MONTH",
};

const WARM_WHITE = "#EAE4DC";
const STAR_GOLD = "#F5DDA0";

function getTimeUnit(period: ProgressPeriod): TimeUnit {
  return period === "thisWeek" || period === "lastWeek" ? "week" : "month";
}

function getTimePosition(period: ProgressPeriod): TimePosition {
  return period === "thisWeek" || period === "thisMonth"
    ? "current"
    : "previous";
}

function TwinklingStar({
  size = 3,
  duration = 2800,
}: {
  size?: number;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();

  const glow = useSharedValue(0.3);

  useEffect(() => {
    if (reduceMotion) {
      glow.value = 0.65;
      return;
    }

    glow.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    return () => cancelAnimation(glow);
  }, [duration, glow, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [
      {
        scale: 0.7 + glow.value * 0.45,
      },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: STAR_GOLD,
        },
        animatedStyle,
      ]}
    />
  );
}

function EnergyThread() {
  const reduceMotion = useReducedMotion();

  const [width, setWidth] = useState(0);

  const travel = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      travel.value = 0.5;
      return;
    }

    travel.value = 0;

    travel.value = withRepeat(
      withTiming(1, {
        duration: 6500,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );

    return () => cancelAnimation(travel);
  }, [reduceMotion, travel]);

  function handleLayout(event: LayoutChangeEvent) {
    const nextWidth = event.nativeEvent.layout.width;

    setWidth((current) => (current === nextWidth ? current : nextWidth));
  }

  const movingLightStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: travel.value * Math.max(width - 8, 0),
      },
    ],
    opacity: interpolate(travel.value, [0, 0.12, 0.85, 1], [0, 1, 1, 0]),
  }));

  return (
    <View style={styles.threadContainer} onLayout={handleLayout}>
      <Svg
        width="100%"
        height={14}
        viewBox="0 0 300 14"
        preserveAspectRatio="none"
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient
            id="progressQuoteEnergy"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <Stop offset="0%" stopColor={COLORS.gold} stopOpacity={0} />

            <Stop offset="28%" stopColor={COLORS.gold} stopOpacity={0.35} />

            <Stop
              offset="65%"
              stopColor={COLORS.lightGold}
              stopOpacity={0.75}
            />

            <Stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        <Line
          x1={0}
          y1={7}
          x2={300}
          y2={7}
          stroke="url(#progressQuoteEnergy)"
          strokeWidth={1}
        />
      </Svg>

      {width > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[styles.movingLight, movingLightStyle]}
        >
          <View style={styles.movingLightCore} />
        </Animated.View>
      )}
    </View>
  );
}

function CosmicQuote() {
  return (
    <View style={styles.quoteContainer}>
      <View style={styles.starOne}>
        <TwinklingStar size={3} duration={2900} />
      </View>

      <View style={styles.starTwo}>
        <TwinklingStar size={2} duration={3700} />
      </View>

      <View style={styles.starThree}>
        <TwinklingStar size={2} duration={4300} />
      </View>

      <Text style={styles.quoteText}>
        Time is the single most precious{"\n"}
        commodity in the <Text style={styles.quoteHighlight}>universe.</Text>
      </Text>

      <EnergyThread />

      <Text style={styles.quoteAttribution}>JUPITER ASCENDING · 2015</Text>
    </View>
  );
}

function TimeUnitSelector({
  selectedUnit,
  onChange,
}: {
  selectedUnit: TimeUnit;
  onChange: (unit: TimeUnit) => void;
}) {
  return (
    <View style={styles.unitSelector}>
      {(["week", "month"] as const).map((unit) => {
        const selected = selectedUnit === unit;

        return (
          <Pressable
            key={unit}
            onPress={() => onChange(unit)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.unitButton,
              pressed && { opacity: 0.65 },
            ]}
          >
            <Text
              style={[styles.unitText, selected && styles.unitTextSelected]}
            >
              {unit.toUpperCase()}
            </Text>

            {selected && (
              <View style={styles.unitIndicator}>
                <View style={styles.unitIndicatorCore} />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function PeriodNavigation({
  period,
  selectedUnit,
  onChange,
}: {
  period: ProgressPeriod;
  selectedUnit: TimeUnit;
  onChange: (period: ProgressPeriod) => void;
}) {
  const isPrevious = getTimePosition(period) === "previous";

  return (
    <View style={styles.periodNavigation}>
      <Pressable
        onPress={() => onChange(PERIOD_MAP[selectedUnit].previous)}
        disabled={isPrevious}
        accessibilityRole="button"
        accessibilityLabel={`Show previous ${selectedUnit}`}
        style={[styles.navArrow, isPrevious && styles.navArrowDisabled]}
      >
        <Ionicons
          name="chevron-back"
          size={17}
          color={isPrevious ? COLORS.subtle : COLORS.gold}
        />
      </Pressable>

      <Text style={styles.currentPeriodLabel} numberOfLines={1}>
        {PERIOD_LABELS[period]}
      </Text>

      <Pressable
        onPress={() => onChange(PERIOD_MAP[selectedUnit].current)}
        disabled={!isPrevious}
        accessibilityRole="button"
        accessibilityLabel={`Show current ${selectedUnit}`}
        style={[styles.navArrow, !isPrevious && styles.navArrowDisabled]}
      >
        <Ionicons
          name="chevron-forward"
          size={17}
          color={!isPrevious ? COLORS.subtle : COLORS.gold}
        />
      </Pressable>
    </View>
  );
}

export function ProgressHeader({
  period,
  onPeriodChange,
}: ProgressHeaderProps) {
  const selectedUnit = getTimeUnit(period);

  const selectedPosition = getTimePosition(period);

  function handleUnitChange(unit: TimeUnit) {
    onPeriodChange(PERIOD_MAP[unit][selectedPosition]);
  }

  return (
    <View style={styles.container}>
      {/* SHARED HEADER */}

      <ScreenHeader
        eyebrow="LIFE PATTERNS"
        title="THE SHAPE OF YOUR "
        highlightedTitle="TIME"
        variant="editorial"
        eyebrowAccessory={<TwinklingStar size={3} duration={3400} />}
      />

      {/* COSMIC QUOTE */}

      <CosmicQuote />

      {/* PERIOD CONTROLS */}

      <View style={styles.controlsRow}>
        <TimeUnitSelector
          selectedUnit={selectedUnit}
          onChange={handleUnitChange}
        />

        <PeriodNavigation
          period={period}
          selectedUnit={selectedUnit}
          onChange={onPeriodChange}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 6,
  },

  quoteContainer: {
    position: "relative",
    marginTop: 15,
    paddingHorizontal: 2,
  },

  quoteText: {
    color: WARM_WHITE,
    fontSize: 16,
    lineHeight: 25,
    fontStyle: "italic",
    letterSpacing: 0.1,
  },

  quoteHighlight: {
    color: COLORS.lightGold,
    fontWeight: "600",
  },

  quoteAttribution: {
    color: COLORS.subtle,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 3,
  },

  starOne: {
    position: "absolute",
    right: 31,
    top: 4,
  },

  starTwo: {
    position: "absolute",
    right: 7,
    top: 28,
  },

  starThree: {
    position: "absolute",
    right: 62,
    bottom: 13,
  },

  threadContainer: {
    width: "76%",
    height: 14,
    marginTop: 9,
    position: "relative",
    justifyContent: "center",
  },

  movingLight: {
    position: "absolute",
    left: 0,
    top: 4,
    width: 8,
    height: 6,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  movingLightCore: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#FFF9E9",
  },

  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 8,
  },

  unitSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 17,
  },

  unitButton: {
    minHeight: 40,
    justifyContent: "center",
    position: "relative",
  },

  unitText: {
    color: COLORS.subtle,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  unitTextSelected: {
    color: COLORS.lightGold,
  },

  unitIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.goldBorder,
    alignItems: "center",
  },

  unitIndicatorCore: {
    width: "70%",
    height: 2,
    backgroundColor: COLORS.gold,
  },

  periodNavigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  navArrow: {
    width: 30,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  navArrowDisabled: {
    opacity: 0.35,
  },

  currentPeriodLabel: {
    color: WARM_WHITE,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
    minWidth: 76,
    textAlign: "center",
  },
});
