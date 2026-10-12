import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";

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

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import {
  getUniverseVisualEvolution,
  type UniverseVisualMode,
} from "./universeVisualEvolution";

type CelestialWaterProps = {
  color: string;
  duration: number;
  percentage: number;
  activityCount: number;
  size?: number;
  mode?: UniverseVisualMode;
};

type Particle = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
};

const MAX_RIPPLES = 7;
const MAX_PARTICLES = 30;
const MAX_INNER_STARS = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function seededValue(index: number, seed: number) {
  const value = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453;

  return value - Math.floor(value);
}

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, index) => ({
    x: 24 + seededValue(index, 1) * 112,
    y: 87 + seededValue(index, 2) * 51,
    radius: 0.5 + seededValue(index, 3) * 1.1,
    opacity: 0.25 + seededValue(index, 4) * 0.65,
  }));
}

function createInnerStars(count: number): Particle[] {
  return Array.from({ length: count }, (_, index) => ({
    x: 73 + seededValue(index, 11) * 14,
    y: 54 + seededValue(index, 12) * 27,
    radius: 0.35 + seededValue(index, 13) * 0.65,
    opacity: 0.4 + seededValue(index, 14) * 0.55,
  }));
}

export function CelestialWater({
  color,
  duration,
  percentage,
  activityCount,
  size = 160,
  mode = "daily",
}: CelestialWaterProps) {
  const reducedMotion = useReducedMotion();

  const count = Math.max(0, activityCount);
  const minutes = Math.max(0, duration);

  const lifetime = mode === "lifetime";

  const evolution = getUniverseVisualEvolution(
    activityCount,
    duration,
    percentage,
  );

  const intensity = lifetime ? evolution.energy : clamp(minutes / 360, 0, 1);

  const dominance = clamp(percentage / 100, 0, 1);

  const rippleCount =
    count === 0
      ? 0
      : lifetime
        ? Math.min(MAX_RIPPLES, 1 + Math.floor(evolution.structure * 6))
        : Math.min(MAX_RIPPLES, count + 1);

  const particleCount =
    count === 0
      ? 0
      : lifetime
        ? Math.min(MAX_PARTICLES, 3 + Math.floor(evolution.structure * 27))
        : Math.min(MAX_PARTICLES, count * 3);

  const innerStarCount =
    count === 0
      ? 0
      : lifetime
        ? Math.min(MAX_INNER_STARS, 2 + Math.floor(evolution.structure * 10))
        : Math.min(MAX_INNER_STARS, count + 2);

  const waterWidth =
    count === 0
      ? 17
      : lifetime
        ? 29 + evolution.structure * 38
        : clamp(29 + count * 4, 29, 67);

  const particles = useMemo(
    () => createParticles(particleCount),
    [particleCount],
  );

  const innerStars = useMemo(
    () => createInnerStars(innerStarCount),
    [innerStarCount],
  );

  const breathe = useSharedValue(1);
  const shimmer = useSharedValue(0.75);
  const dropFall = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(breathe);
    cancelAnimation(shimmer);
    cancelAnimation(dropFall);

    if (reducedMotion || count === 0) {
      breathe.value = 1;
      shimmer.value = 0.75;
      dropFall.value = 0;
      return;
    }

    breathe.value = withRepeat(
      withTiming(1.045, {
        duration: 4700,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 3300,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    dropFall.value = withRepeat(
      withTiming(1, {
        duration: 4000,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(breathe);
      cancelAnimation(shimmer);
      cancelAnimation(dropFall);
    };
  }, [breathe, shimmer, dropFall, reducedMotion, count]);

  const surfaceStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: breathe.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }));

  const fallingDropStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dropFall.value * 18 }],
    opacity: 1 - dropFall.value,
  }));

  return (
    <View pointerEvents="none" style={{ width: size, height: size }}>
      {/* WATER ATMOSPHERE AND RIPPLES */}

      <Animated.View style={[StyleSheet.absoluteFill, surfaceStyle]}>
        <Svg width={size} height={size} viewBox="0 0 160 160">
          <Defs>
            <RadialGradient id="celestialWaterAura">
              <Stop
                offset="0%"
                stopColor="#72FFF0"
                stopOpacity={0.2 + intensity * 0.18}
              />
              <Stop
                offset="55%"
                stopColor={color}
                stopOpacity={0.05 + dominance * 0.12}
              />
              <Stop offset="100%" stopColor={color} stopOpacity={0} />
            </RadialGradient>

            <RadialGradient id="celestialWaterSurface">
              <Stop
                offset="0%"
                stopColor="#C8FFFA"
                stopOpacity={0.24 + intensity * 0.22}
              />
              <Stop
                offset="48%"
                stopColor="#42C7C0"
                stopOpacity={0.15 + intensity * 0.14}
              />
              <Stop offset="100%" stopColor="#42C7C0" stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {count > 0 && (
            <Ellipse
              cx={80}
              cy={121}
              rx={waterWidth + 17}
              ry={25}
              fill="url(#celestialWaterAura)"
            />
          )}

          <Ellipse
            cx={80}
            cy={121}
            rx={waterWidth}
            ry={waterWidth * 0.23}
            fill="url(#celestialWaterSurface)"
            opacity={count === 0 ? 0.2 : 1}
          />

          {/* WATER RIPPLES */}

          {Array.from({ length: rippleCount }, (_, index) => {
            const progress = (index + 1) / (MAX_RIPPLES + 1);

            const rx = 10 + progress * waterWidth;

            const ry = 3 + progress * waterWidth * 0.22;

            return (
              <G key={`ripple-${index}`}>
                <Ellipse
                  cx={80}
                  cy={121}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke={color}
                  strokeWidth={3}
                  strokeOpacity={0.045 + intensity * 0.06}
                />

                <Ellipse
                  cx={80}
                  cy={121}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke="#B9FFF8"
                  strokeWidth={0.8}
                  strokeOpacity={clamp(
                    0.55 - index * 0.055 + intensity * 0.16,
                    0.13,
                    0.72,
                  )}
                />
              </G>
            );
          })}

          {/* WATER PARTICLES */}

          {particles.map((particle, index) => (
            <G key={`water-particle-${index}`}>
              <Circle
                cx={particle.x}
                cy={particle.y}
                r={particle.radius * 3}
                fill="#76FBEF"
                fillOpacity={particle.opacity * 0.09}
              />

              <Circle
                cx={particle.x}
                cy={particle.y}
                r={particle.radius}
                fill="#CFFFFA"
                fillOpacity={particle.opacity * (0.55 + intensity * 0.4)}
              />
            </G>
          ))}

          {count === 0 && (
            <Circle cx={80} cy={121} r={2} fill={color} fillOpacity={0.45} />
          )}
        </Svg>
      </Animated.View>

      {/* MAGICAL CRYSTAL WATER DROP */}

      {count > 0 && (
        <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
          <Svg width={size} height={size} viewBox="0 0 160 160">
            <Defs>
              <LinearGradient
                id="crystalDropBody"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <Stop offset="0%" stopColor="#DFFFFC" stopOpacity={0.94} />
                <Stop offset="24%" stopColor="#8CECE5" stopOpacity={0.82} />
                <Stop offset="55%" stopColor="#246A7B" stopOpacity={0.9} />
                <Stop offset="85%" stopColor="#0D344D" stopOpacity={0.96} />
                <Stop offset="100%" stopColor="#9CFBF0" stopOpacity={0.88} />
              </LinearGradient>

              <RadialGradient id="crystalInnerGlow">
                <Stop offset="0%" stopColor="#E8FFFE" stopOpacity={0.75} />
                <Stop offset="32%" stopColor="#8AFFF3" stopOpacity={0.38} />
                <Stop offset="100%" stopColor="#3B9FA7" stopOpacity={0} />
              </RadialGradient>

              <RadialGradient id="crystalOuterGlow">
                <Stop
                  offset="0%"
                  stopColor="#7EFFF0"
                  stopOpacity={0.24 + intensity * 0.2}
                />
                <Stop offset="100%" stopColor="#7EFFF0" stopOpacity={0} />
              </RadialGradient>
            </Defs>

            {/* Surrounding glow */}

            <Ellipse
              cx={80}
              cy={65}
              rx={30}
              ry={42}
              fill="url(#crystalOuterGlow)"
            />

            {/* Crystal silhouette */}

            <Path
              d="
                M80 28
                C75 39 63 53 63 67
                C63 79 70 89 80 89
                C90 89 97 79 97 67
                C97 53 85 39 80 28
                Z
              "
              fill="url(#crystalDropBody)"
              stroke="#B8FFF7"
              strokeWidth={1.1}
              strokeOpacity={0.8}
            />

            {/* Translucent chamber */}

            <Path
              d="
                M80 39
                C76 49 69 57 69 68
                C69 77 73 83 80 83
                C87 83 91 77 91 68
                C91 57 84 49 80 39
                Z
              "
              fill="#06283E"
              fillOpacity={0.34}
            />

            {/* Inner light */}

            <Ellipse
              cx={80}
              cy={70}
              rx={12}
              ry={17}
              fill="url(#crystalInnerGlow)"
              opacity={0.6 + intensity * 0.4}
            />

            {/* Left reflection */}

            <Path
              d="M77 42 C71 53 67 62 68 71"
              fill="none"
              stroke="#F0FFFE"
              strokeWidth={2}
              strokeOpacity={0.78}
              strokeLinecap="round"
            />

            {/* Right reflection */}

            <Path
              d="M87 58 C92 67 90 76 85 81"
              fill="none"
              stroke="#A4FFF3"
              strokeWidth={1.2}
              strokeOpacity={0.46}
              strokeLinecap="round"
            />

            {/* Crystal facet */}

            <Path
              d="M80 37 L80 84"
              fill="none"
              stroke="#CFFFFB"
              strokeWidth={0.55}
              strokeOpacity={0.2}
            />

            {/* Inner stars */}

            {innerStars.map((star, index) => (
              <G key={`inner-star-${index}`}>
                <Circle
                  cx={star.x}
                  cy={star.y}
                  r={star.radius * 3}
                  fill="#D8FFFC"
                  fillOpacity={star.opacity * 0.1}
                />

                <Circle
                  cx={star.x}
                  cy={star.y}
                  r={star.radius}
                  fill={index % 4 === 0 ? "#E7D5FF" : "#E3FFFC"}
                  fillOpacity={star.opacity}
                />
              </G>
            ))}

            {/* Magical center */}

            <Circle
              cx={80}
              cy={70}
              r={1.8 + intensity * 1.2}
              fill="#F0FFFE"
              fillOpacity={0.85}
            />

            {/* Reflection below crystal */}

            <Ellipse
              cx={80}
              cy={94}
              rx={11}
              ry={2.5}
              fill="#A5FFF4"
              fillOpacity={0.14 + intensity * 0.18}
            />
          </Svg>
        </Animated.View>
      )}

      {/* SECONDARY FALLING DROP */}

      {count >= 2 && (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, fallingDropStyle]}
        >
          <Svg width={size} height={size} viewBox="0 0 160 160">
            <Path
              d="
                M108 83
                C105 88 103 91 103 95
                C103 99 105 101 108 101
                C111 101 113 99 113 95
                C113 91 111 88 108 83
                Z
              "
              fill="#AFFFF5"
              fillOpacity={0.65}
            />

            <Circle
              cx={108}
              cy={95}
              r={1.4}
              fill="#EFFFFD"
              fillOpacity={0.75}
            />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}
