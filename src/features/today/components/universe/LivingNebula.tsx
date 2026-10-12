import { useMemo } from "react";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

type LivingNebulaProps = {
  color: string;
  duration: number;
  percentage: number;
  activityCount: number;
  size?: number;
};

type Branch = {
  path: string;
  width: number;
  opacity: number;
};

type Star = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
};

const MAX_BRANCHES = 18;
const MAX_STARS = 36;
const FULL_GLOW_MINUTES = 360;

/**
 * Deterministic pseudo-random number.
 *
 * The same index always produces the same value,
 * so existing stars never jump to new positions.
 */
function seededValue(index: number, seed: number) {
  const value = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createBranches(count: number): Branch[] {
  const branches: Branch[] = [];

  for (let index = 0; index < count; index++) {
    const side = index % 2 === 0 ? -1 : 1;
    const level = Math.floor(index / 2);

    const startY = 111 - level * 7;

    const spread = 13 + level * 4.5;
    const endX = 80 + side * spread;
    const endY = 91 - level * 8;

    const controlX = 80 + side * (8 + level * 2);

    branches.push({
      path: `
        M 80 ${startY}
        Q ${controlX} ${startY - 14}
          ${endX} ${endY}
      `,
      width: Math.max(0.8, 2.2 - level * 0.12),
      opacity: clamp(0.85 - level * 0.035, 0.35, 0.85),
    });
  }

  return branches;
}

function createStars(count: number): Star[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = seededValue(index, 1) * Math.PI * 2;

    const radius = 12 + seededValue(index, 2) * 54;

    return {
      x: 80 + Math.cos(angle) * radius,
      y: 75 + Math.sin(angle) * radius * 0.85,
      radius: 0.6 + seededValue(index, 3) * 1.4,
      opacity: 0.35 + seededValue(index, 4) * 0.6,
    };
  });
}

export function LivingNebula({
  color,
  duration,
  percentage,
  activityCount,
  size = 160,
}: LivingNebulaProps) {
  const count = Math.max(0, activityCount);
  const minutes = Math.max(0, duration);

  const branchCount =
    count === 0 ? 0 : Math.min(MAX_BRANCHES, 2 + count * 2);

  const starCount =
    count === 0 ? 0 : Math.min(MAX_STARS, 2 + count * 3);

  const glowStrength = clamp(minutes / FULL_GLOW_MINUTES, 0, 1);
  const dominance = clamp(percentage / 100, 0, 1);

  const branches = useMemo(
    () => createBranches(branchCount),
    [branchCount],
  );

  const stars = useMemo(
    () => createStars(starCount),
    [starCount],
  );

  const hasActivity = count > 0;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
    >
      <Defs>
        <RadialGradient id="livingNebulaAura">
          <Stop
            offset="0%"
            stopColor={color}
            stopOpacity={0.12 + glowStrength * 0.26}
          />

          <Stop
            offset="45%"
            stopColor={color}
            stopOpacity={0.04 + dominance * 0.12}
          />

          <Stop
            offset="100%"
            stopColor={color}
            stopOpacity={0}
          />
        </RadialGradient>

        <RadialGradient id="livingNebulaCore">
          <Stop offset="0%" stopColor="#FFE6BB" />
          <Stop offset="35%" stopColor={color} />
          <Stop
            offset="100%"
            stopColor={color}
            stopOpacity={0}
          />
        </RadialGradient>
      </Defs>

      {/* Cosmic atmosphere */}

      {hasActivity && (
        <Circle
          cx={80}
          cy={78}
          r={62}
          fill="url(#livingNebulaAura)"
        />
      )}

      {/* Dormant cosmic seed */}

      {!hasActivity && (
        <G>
          <Circle
            cx={80}
            cy={102}
            r={11}
            fill={color}
            fillOpacity={0.045}
          />

          <Circle
            cx={80}
            cy={102}
            r={2.4}
            fill={color}
            fillOpacity={0.4}
          />
        </G>
      )}

      {/* Main cosmic trunk */}

      {hasActivity && (
        <G>
          <Path
            d="M80 124 C78 106 83 92 80 74 C77 60 81 46 80 33"
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeOpacity={0.06 + glowStrength * 0.08}
            strokeLinecap="round"
          />

          <Path
            d="M80 124 C78 106 83 92 80 74 C77 60 81 46 80 33"
            fill="none"
            stroke={color}
            strokeWidth={2.1}
            strokeOpacity={0.55 + glowStrength * 0.35}
            strokeLinecap="round"
          />

          {/* New branches appear as activity count increases */}

          {branches.map((branch, index) => (
            <G key={`branch-${index}`}>
              <Path
                d={branch.path}
                fill="none"
                stroke={color}
                strokeWidth={branch.width + 3}
                strokeOpacity={0.045 + glowStrength * 0.07}
                strokeLinecap="round"
              />

              <Path
                d={branch.path}
                fill="none"
                stroke={color}
                strokeWidth={branch.width}
                strokeOpacity={branch.opacity}
                strokeLinecap="round"
              />
            </G>
          ))}

          {/* Central energy */}

          <Circle
            cx={80}
            cy={77}
            r={12 + glowStrength * 8}
            fill="url(#livingNebulaCore)"
            opacity={0.45 + glowStrength * 0.4}
          />

          {/* Stars accumulated through activities */}

          {stars.map((star, index) => (
            <G key={`star-${index}`}>
              <Circle
                cx={star.x}
                cy={star.y}
                r={star.radius * 3}
                fill={color}
                fillOpacity={star.opacity * 0.07}
              />

              <Circle
                cx={star.x}
                cy={star.y}
                r={star.radius}
                fill={index % 5 === 0 ? "#FFE8C1" : color}
                fillOpacity={
                  star.opacity * (0.6 + glowStrength * 0.4)
                }
              />
            </G>
          ))}

          {/* Crown highlight */}

          <Line
            x1={80}
            y1={28}
            x2={80}
            y2={40}
            stroke="#F6D8FF"
            strokeWidth={1}
            strokeOpacity={0.35 + glowStrength * 0.45}
          />

          <Circle
            cx={80}
            cy={33}
            r={2.2 + glowStrength * 1.4}
            fill="#FFE8D0"
            fillOpacity={0.65 + glowStrength * 0.3}
          />
        </G>
      )}
    </Svg>
  );
}