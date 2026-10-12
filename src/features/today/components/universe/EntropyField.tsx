import { useMemo } from "react";

import Svg, {
  Circle,
  Defs,
  G,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import {
  getUniverseVisualEvolution,
  type UniverseVisualMode,
} from "./universeVisualEvolution";

type EntropyFieldProps = {
  color: string;
  duration: number;
  percentage: number;
  activityCount: number;
  size?: number;
  mode?: UniverseVisualMode;
};

type EntropyParticle = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
};

const MAX_PARTICLES = 48;
const MAX_ARMS = 5;
const FULL_INTENSITY_MINUTES = 360;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function seededValue(index: number, seed: number) {
  const value = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453;

  return value - Math.floor(value);
}

function createParticles(count: number): EntropyParticle[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = index * 2.399963229728653;

    const distance = 12 + Math.sqrt(index + 1) * 7.2;

    const irregularity = 0.7 + seededValue(index, 3) * 0.6;

    return {
      x: 80 + Math.cos(angle) * distance * irregularity,

      y: 80 + Math.sin(angle) * distance * irregularity * 0.82,

      radius: 0.6 + seededValue(index, 4) * 1.8,

      opacity: 0.3 + seededValue(index, 5) * 0.65,
    };
  });
}

export function EntropyField({
  color,
  duration,
  percentage,
  activityCount,
  size = 160,
  mode = "daily",
}: EntropyFieldProps) {
  const count = Math.max(0, activityCount);
  const minutes = Math.max(0, duration);

  const lifetime = mode === "lifetime";

  const evolution = getUniverseVisualEvolution(
    activityCount,
    duration,
    percentage,
  );

  const intensity = lifetime
    ? evolution.energy
    : clamp(minutes / FULL_INTENSITY_MINUTES, 0, 1);

  const dominance = clamp(percentage / 100, 0, 1);

  const particleCount =
    count === 0
      ? 0
      : lifetime
        ? Math.min(MAX_PARTICLES, 4 + Math.floor(evolution.structure * 44))
        : Math.min(MAX_PARTICLES, 4 + count * 4);

  const armCount =
    count === 0
      ? 0
      : lifetime
        ? Math.min(MAX_ARMS, Math.floor(evolution.structure * MAX_ARMS))
        : count < 3
          ? 0
          : Math.min(MAX_ARMS, Math.floor(count / 2));

  const particles = useMemo(
    () => createParticles(particleCount),
    [particleCount],
  );

  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      <Defs>
        <RadialGradient id="entropyAtmosphere">
          <Stop
            offset="0%"
            stopColor="#F6B66B"
            stopOpacity={0.12 + intensity * 0.18}
          />

          <Stop
            offset="45%"
            stopColor={color}
            stopOpacity={0.05 + dominance * 0.1}
          />

          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>

        <RadialGradient id="entropyCoreGlow">
          <Stop offset="0%" stopColor="#FFE7B5" stopOpacity={0.85} />

          <Stop offset="30%" stopColor="#F4B66E" stopOpacity={0.45} />

          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* DORMANT ENTROPY */}

      {count === 0 && (
        <G>
          <Circle cx={80} cy={80} r={14} fill={color} fillOpacity={0.035} />

          <Circle cx={80} cy={80} r={2} fill={color} fillOpacity={0.3} />
        </G>
      )}

      {count > 0 && (
        <G>
          {/* ENERGY FIELD */}

          <Circle
            cx={80}
            cy={80}
            r={40 + intensity * 18}
            fill="url(#entropyAtmosphere)"
          />

          {/* FRAGMENTED SPIRAL ARMS */}

          {Array.from({ length: armCount }, (_, index) => {
            const rotation = index * (360 / MAX_ARMS);

            return (
              <G
                key={`entropy-arm-${index}`}
                rotation={rotation}
                origin="80,80"
              >
                <Path
                  d="
                      M83 77
                      C99 70 111 78 115 90
                      C119 103 109 115 95 118
                    "
                  fill="none"
                  stroke={color}
                  strokeWidth={2.8}
                  strokeOpacity={0.035 + intensity * 0.07}
                  strokeLinecap="round"
                />

                <Path
                  d="
                      M83 77
                      C99 70 111 78 115 90
                      C119 103 109 115 95 118
                    "
                  fill="none"
                  stroke="#F6C58D"
                  strokeWidth={0.75}
                  strokeOpacity={0.18 + intensity * 0.22}
                  strokeDasharray="3 5"
                  strokeLinecap="round"
                />
              </G>
            );
          })}

          {/* CENTRAL ENERGY */}

          <Circle
            cx={80}
            cy={80}
            r={19}
            fill="url(#entropyCoreGlow)"
            opacity={0.6 + intensity * 0.35}
          />

          <Circle
            cx={80}
            cy={80}
            r={3.2}
            fill="#FFE9C0"
            fillOpacity={0.6 + intensity * 0.35}
          />

          {/* ESCAPING PARTICLES */}

          {particles.map((particle, index) => (
            <G key={`entropy-particle-${index}`}>
              {/* Particle halo */}

              <Circle
                cx={particle.x}
                cy={particle.y}
                r={particle.radius * 3.5}
                fill={color}
                fillOpacity={particle.opacity * 0.055}
              />

              {/* Particle core */}

              <Circle
                cx={particle.x}
                cy={particle.y}
                r={particle.radius}
                fill={index % 5 === 0 ? "#FFE6B5" : color}
                fillOpacity={particle.opacity * (0.5 + intensity * 0.45)}
              />

              {/* Energy trail */}

              {index % 5 === 0 && (
                <Path
                  d={`
                      M ${particle.x - (particle.x - 80) * 0.18}
                      ${particle.y - (particle.y - 80) * 0.18}
                      L ${particle.x}
                      ${particle.y}
                    `}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.7}
                  strokeOpacity={0.12 + intensity * 0.2}
                />
              )}
            </G>
          ))}
        </G>
      )}
    </Svg>
  );
}
