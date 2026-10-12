import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import Svg, { Circle, Defs, G, Line } from "react-native-svg";

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

type ArtworkType = "tree" | "lotus" | "vortex";

type UniverseArtworkProps = {
  type: ArtworkType;
  color: string;
  duration: number;
  percentage: number;
  activityCount: number;
  size?: number;
};

const BASE_SIZE = 160;
const FULL_DEVELOPMENT_MINUTES = 360;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function getDevelopment(duration: number) {
  return clamp(Math.max(0, duration) / FULL_DEVELOPMENT_MINUTES);
}

function getArtworkScale(activityCount: number) {
  const count = Math.max(0, activityCount);

  if (count === 0) return 0.72;

  return Math.min(1.06, 0.73 + Math.sqrt(count) * 0.095);
}

export function UniverseArtwork({
  type,
  color,
  duration,
  percentage,
  activityCount,
  size = BASE_SIZE,
}: UniverseArtworkProps) {
  const reducedMotion = useReducedMotion();

  const development = getDevelopment(duration);
  const normalizedPercentage = clamp(percentage / 100);

  const pulse = useSharedValue(1);
  const drift = useSharedValue(0);

  const artworkScale = getArtworkScale(activityCount);

  const growth = useSharedValue(artworkScale);

  useEffect(() => {
    growth.value = withTiming(artworkScale, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [artworkScale, growth]);

  useEffect(() => {
    cancelAnimation(pulse);
    cancelAnimation(drift);

    if (reducedMotion) {
      pulse.value = 1;
      drift.value = 0;
      return;
    }

    pulse.value = withRepeat(
      withTiming(1.025 + development * 0.035, {
        duration: type === "lotus" ? 3600 : type === "tree" ? 4200 : 3000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    drift.value = withRepeat(
      withTiming(2 + development * 2, {
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
  }, [development, drift, pulse, reducedMotion, type]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: drift.value },
      { scale: growth.value * pulse.value },
    ],
  }));

  const opacity = 0.68 + normalizedPercentage * 0.32;

  return (
    <View
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
          />
        ) : type === "tree" ? (
          <LivingNebula
            color={color}
            duration={duration}
            percentage={percentage}
            activityCount={activityCount}
            size={size}
          />
        ) : (
          <EntropyField
            color={color}
            duration={duration}
            percentage={percentage}
            activityCount={activityCount}
            size={size}
          />
        )}
      </Animated.View>
    </View>
  );
}
