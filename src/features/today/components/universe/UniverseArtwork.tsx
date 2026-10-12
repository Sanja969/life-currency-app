import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { CelestialWater } from "./CelestialWater";
import { LivingNebula } from "./LivingNebula";
import { EntropyField } from "./EntropyField";
import { CosmicEvolutionLayer } from "./CosmicEvolutionLayer";

import {
  getUniverseVisualEvolution,
  type UniverseVisualMode,
} from "./universeVisualEvolution";

type ArtworkType = "tree" | "lotus" | "vortex";

type UniverseArtworkProps = {
  type: ArtworkType;
  color: string;
  duration: number;
  percentage: number;
  activityCount: number;
  size?: number;
  mode?: UniverseVisualMode;
};

const BASE_SIZE = 160;
const FULL_DEVELOPMENT_MINUTES = 360;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function getDevelopment(duration: number): number {
  return clamp(Math.max(0, duration) / FULL_DEVELOPMENT_MINUTES);
}

function getArtworkScale(activityCount: number): number {
  const count = Math.max(0, activityCount);

  if (count === 0) {
    return 0.72;
  }

  return Math.min(1.06, 0.73 + Math.sqrt(count) * 0.095);
}

export function UniverseArtwork({
  type,
  color,
  duration,
  percentage,
  activityCount,
  size = BASE_SIZE,
  mode = "daily",
}: UniverseArtworkProps) {
  const reducedMotion = useReducedMotion();

  // DAILY DEVELOPMENT
  const development = getDevelopment(duration);

  // LONG-TERM EVOLUTION
  const evolution = getUniverseVisualEvolution(
    activityCount,
    duration,
    percentage,
  );

  const lifetime = mode === "lifetime";

  // Lifetime uses accumulated energy.
  // Daily preserves the original 360-minute scale.
  const visualDevelopment = lifetime ? evolution.energy : development;

  const normalizedPercentage = clamp(percentage / 100);

  // ANIMATION VALUES
  const pulse = useSharedValue(1);
  const drift = useSharedValue(0);

  // Daily: original scaling.
  // Lifetime: gradual structural growth.
  const artworkScale = lifetime
    ? activityCount === 0
      ? 0.72
      : 0.82 + evolution.structure * 0.24
    : getArtworkScale(activityCount);

  const growth = useSharedValue(artworkScale);

  // Animate structural growth when data changes.
  useEffect(() => {
    cancelAnimation(growth);

    if (reducedMotion) {
      growth.value = artworkScale;
      return;
    }

    growth.value = withTiming(artworkScale, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });

    return () => {
      cancelAnimation(growth);
    };
  }, [artworkScale, growth, reducedMotion]);

  // Ambient cosmic animation.
  useEffect(() => {
    cancelAnimation(pulse);
    cancelAnimation(drift);

    if (reducedMotion) {
      pulse.value = 1;
      drift.value = 0;
      return;
    }

    const pulseTarget = 1.025 + visualDevelopment * 0.035;

    const pulseDuration =
      type === "lotus" ? 3600 : type === "tree" ? 4200 : 3000;

    pulse.value = withRepeat(
      withTiming(pulseTarget, {
        duration: pulseDuration,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    drift.value = withRepeat(
      withTiming(2 + visualDevelopment * 2, {
        duration: 4300,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(pulse);
      cancelAnimation(drift);
    };
  }, [visualDevelopment, type, reducedMotion, pulse, drift]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: drift.value,
      },
      {
        scale: growth.value * pulse.value,
      },
    ],
  }));

  // Percentage determines relative visual presence.
  const opacity = 0.68 + normalizedPercentage * 0.32;

  return (
    <View
      pointerEvents="none"
      style={{
        width: size,
        height: size,
      }}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, animatedStyle, { opacity }]}
      >
        {type === "lotus" ? (
          <CelestialWater
            color={color}
            duration={duration}
            percentage={percentage}
            activityCount={activityCount}
            size={size}
            mode={mode}
          />
        ) : type === "tree" ? (
          <LivingNebula
            color={color}
            duration={duration}
            percentage={percentage}
            activityCount={activityCount}
            size={size}
            mode={mode}
          />
        ) : (
          <EntropyField
            color={color}
            duration={duration}
            percentage={percentage}
            activityCount={activityCount}
            size={size}
            mode={mode}
          />
        )}
        {mode === "lifetime" && (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <CosmicEvolutionLayer
              type={type}
              color={color}
              duration={duration}
              percentage={percentage}
              activityCount={activityCount}
              size={size}
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
}
