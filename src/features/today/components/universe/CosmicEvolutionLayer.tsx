import { useMemo } from "react";

import Svg, { Circle, Ellipse, G, Line, Path } from "react-native-svg";

import { getUniverseVisualEvolution } from "./universeVisualEvolution";

type ArtworkType = "tree" | "lotus" | "vortex";

type CosmicEvolutionLayerProps = {
  type: ArtworkType;
  color: string;
  duration: number;
  percentage: number;
  activityCount: number;
  size: number;
};

type CosmicStar = {
  x: number;
  y: number;
  radius: number;
};

function seededValue(index: number, seed: number) {
  const value = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453;

  return value - Math.floor(value);
}

function createConstellationStars(count: number): CosmicStar[] {
  return Array.from({ length: count }, (_, index) => {
    const angle =
      -Math.PI * 0.9 + (index / Math.max(1, count - 1)) * Math.PI * 1.8;

    const radius = 49 + seededValue(index, 7) * 13;

    return {
      x: 80 + Math.cos(angle) * radius,
      y: 77 + Math.sin(angle) * radius * 0.85,
      radius: 1.3 + seededValue(index, 9) * 1.2,
    };
  });
}

export function CosmicEvolutionLayer({
  type,
  color,
  duration,
  percentage,
  activityCount,
  size,
}: CosmicEvolutionLayerProps) {
  const evolution = getUniverseVisualEvolution(
    activityCount,
    duration,
    percentage,
  );

  const level = evolution.level;
  const energy = evolution.energy;

  const constellationCount = level < 2 ? 0 : Math.min(10, level + 1);

  const stars = useMemo(
    () => createConstellationStars(constellationCount),
    [constellationCount],
  );

  // No extra structures before three activities.
  if (activityCount < 3) {
    return null;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" pointerEvents="none">
      {/* GROWING — CONSTELLATIONS */}

      {type === "tree" && (
        <G>
          {stars.map((star, index) => {
            const previous = stars[index - 1];

            return (
              <G key={`constellation-${index}`}>
                {previous && (
                  <Line
                    x1={previous.x}
                    y1={previous.y}
                    x2={star.x}
                    y2={star.y}
                    stroke={color}
                    strokeWidth={1}
                    strokeOpacity={0.3 + energy * 0.25}
                  />
                )}

                <Circle
                  cx={star.x}
                  cy={star.y}
                  r={star.radius * 3}
                  fill={color}
                  fillOpacity={0.12}
                />

                <Circle
                  cx={star.x}
                  cy={star.y}
                  r={star.radius}
                  fill={index % 3 === 0 ? "#FFE7C2" : color}
                  fillOpacity={0.65 + energy * 0.3}
                />
              </G>
            );
          })}

          {level >= 3 && (
            <Ellipse
              cx={80}
              cy={78}
              rx={67}
              ry={56}
              fill="none"
              stroke={color}
              strokeWidth={0.85}
              strokeOpacity={0.28}
              strokeDasharray="2 7"
            />
          )}

          {level >= 5 && (
            <G>
              <Circle
                cx={80}
                cy={13}
                r={2.4}
                fill="#FFE7C2"
                fillOpacity={0.85}
              />

              <Circle cx={80} cy={13} r={7} fill={color} fillOpacity={0.08} />
            </G>
          )}

          {level >= 7 && (
            <Ellipse
              cx={80}
              cy={78}
              rx={73}
              ry={63}
              fill="none"
              stroke="#D9BDFF"
              strokeWidth={0.6}
              strokeOpacity={0.22}
              strokeDasharray="4 8"
            />
          )}
        </G>
      )}

      {/* RESTORING — CELESTIAL ORBITS */}

      {type === "lotus" && (
        <G>
          {level >= 2 && (
            <Ellipse
              cx={80}
              cy={69}
              rx={29}
              ry={44}
              fill="none"
              stroke="#AFFFF6"
              strokeWidth={1.2}
              strokeOpacity={0.35 + energy * 0.2}
              rotation={-24}
              origin="80,69"
            />
          )}

          {level >= 3 && (
            <Ellipse
              cx={80}
              cy={69}
              rx={34}
              ry={48}
              fill="none"
              stroke={color}
              strokeWidth={0.9}
              strokeOpacity={0.25 + energy * 0.2}
              rotation={29}
              origin="80,69"
            />
          )}

          {level >= 4 && (
            <G>
              <Circle
                cx={48}
                cy={44}
                r={2.3}
                fill="#DFFFFC"
                fillOpacity={0.85}
              />

              <Circle
                cx={114}
                cy={93}
                r={1.8}
                fill="#AFFFF6"
                fillOpacity={0.75}
              />
            </G>
          )}

          {level >= 6 && (
            <Ellipse
              cx={80}
              cy={69}
              rx={42}
              ry={53}
              fill="none"
              stroke="#E0D3FF"
              strokeWidth={0.85}
              strokeOpacity={0.35}
              strokeDasharray="3 5"
            />
          )}

          {level >= 8 && (
            <G>
              <Circle
                cx={80}
                cy={11}
                r={2.2}
                fill="#E8FFFE"
                fillOpacity={0.9}
              />

              <Circle cx={80} cy={11} r={7} fill="#72FFF0" fillOpacity={0.1} />
            </G>
          )}
        </G>
      )}

      {/* LIFE LEAKS — ENTROPY STRUCTURES */}

      {type === "vortex" && (
        <G>
          {level >= 2 && (
            <Path
              d="M36 78 A44 44 0 0 1 99 40"
              fill="none"
              stroke={color}
              strokeWidth={1.4}
              strokeOpacity={0.3 + energy * 0.2}
              strokeDasharray="7 9"
            />
          )}

          {level >= 3 && (
            <Path
              d="M124 82 A44 44 0 0 1 59 119"
              fill="none"
              stroke="#F6C58D"
              strokeWidth={1.2}
              strokeOpacity={0.3 + energy * 0.2}
              strokeDasharray="4 11"
            />
          )}

          {level >= 4 && (
            <Ellipse
              cx={80}
              cy={80}
              rx={56}
              ry={48}
              fill="none"
              stroke={color}
              strokeWidth={0.85}
              strokeOpacity={0.28}
              strokeDasharray="2 9"
            />
          )}

          {level >= 6 && (
            <G>
              <Line
                x1={31}
                y1={42}
                x2={39}
                y2={48}
                stroke="#F6C58D"
                strokeWidth={1.2}
                strokeOpacity={0.65}
              />

              <Line
                x1={119}
                y1={112}
                x2={127}
                y2={120}
                stroke={color}
                strokeWidth={1.2}
                strokeOpacity={0.6}
              />
            </G>
          )}

          {level >= 8 && (
            <Ellipse
              cx={80}
              cy={80}
              rx={68}
              ry={59}
              fill="none"
              stroke="#F6C58D"
              strokeWidth={0.7}
              strokeOpacity={0.2}
              strokeDasharray="5 12"
            />
          )}
        </G>
      )}
    </Svg>
  );
}
