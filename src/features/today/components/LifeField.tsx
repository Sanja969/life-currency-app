import { Text, View } from "react-native";

import { ActivityStatistics } from "@/types/activity";
import { formatDuration } from "../utils/formatDuration";

type LifeFieldProps = {
  statistics: ActivityStatistics;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  growing: boolean;
  opacity: number;
};

const PARTICLE_POSITIONS = [
  [18, 26],
  [35, 17],
  [56, 24],
  [76, 18],
  [86, 38],
  [69, 46],
  [46, 40],
  [25, 48],
  [13, 62],
  [34, 66],
  [57, 61],
  [80, 68],
  [70, 82],
  [46, 78],
  [23, 84],
] as const;

function buildParticles(
  totalMinutes: number,
  growingPercent: number,
): Particle[] {
  if (totalMinutes <= 0) {
    return [];
  }

  // Field becomes denser as more of the day is tracked.
  // 30 min ~= 3 particles, 5h+ ~= full field.
  const count = Math.min(
    PARTICLE_POSITIONS.length,
    Math.max(3, Math.ceil(totalMinutes / 25)),
  );

  const growingCount = Math.round(count * (growingPercent / 100));

  return PARTICLE_POSITIONS.slice(0, count).map(([x, y], index) => ({
    x,
    y,
    growing: index < growingCount,
    size: 5 + ((index * 7) % 8),
    opacity: 0.45 + ((index * 11) % 45) / 100,
  }));
}

export function LifeField({ statistics }: LifeFieldProps) {
  const hasData = statistics.totalDurationMinutes > 0;

  const growingPercent = statistics.servesPercentage;

  const particles = buildParticles(
    statistics.totalDurationMinutes,
    growingPercent,
  );

  return (
    <View className="mt-6">
      <View className="mb-3 flex-row items-end justify-between">
        <View>
          <Text className="text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
            LIFE FIELD
          </Text>

          <Text className="mt-1 text-[12px] text-[#56637D]">
            Your observed energy today
          </Text>
        </View>

        {hasData ? (
          <Text className="text-[12px] font-medium text-[#7D8AA6]">
            {formatDuration(statistics.totalDurationMinutes)}
          </Text>
        ) : null}
      </View>

      <View
        className="relative overflow-hidden rounded-[28px] border border-[#192744] bg-[#050B18]"
        style={{
          height: 285,
        }}
      >
        {/* FIELD GLOWS */}

        <View
          pointerEvents="none"
          className="absolute rounded-full"
          style={{
            width: 230,
            height: 230,
            left: -75,
            top: 20,
            backgroundColor: "#536DFF",
            opacity: hasData ? 0.035 + growingPercent * 0.0005 : 0.025,
          }}
        />

        <View
          pointerEvents="none"
          className="absolute rounded-full"
          style={{
            width: 210,
            height: 210,
            right: -75,
            top: 55,
            backgroundColor: "#E657A8",
            opacity: hasData ? 0.035 + (100 - growingPercent) * 0.0005 : 0.02,
          }}
        />

        {/* ORBITS */}

        <View
          pointerEvents="none"
          className="absolute rounded-full border"
          style={{
            width: 210,
            height: 210,
            left: "50%",
            top: "50%",
            marginLeft: -105,
            marginTop: -105,
            borderColor: "rgba(113,139,255,0.10)",
          }}
        />

        <View
          pointerEvents="none"
          className="absolute rounded-full border"
          style={{
            width: 140,
            height: 140,
            left: "50%",
            top: "50%",
            marginLeft: -70,
            marginTop: -70,
            borderColor: "rgba(230,87,168,0.08)",
          }}
        />

        {hasData ? (
          <>
            {/* PARTICLES */}

            {particles.map((particle, index) => {
              const color = particle.growing ? "#718BFF" : "#E657A8";

              return (
                <View
                  key={index}
                  pointerEvents="none"
                  style={{
                    position: "absolute",

                    left: `${particle.x}%`,
                    top: `${particle.y}%`,

                    width: particle.size,
                    height: particle.size,

                    marginLeft: -particle.size / 2,
                    marginTop: -particle.size / 2,

                    borderRadius: particle.size / 2,

                    backgroundColor: color,

                    opacity: particle.opacity,

                    shadowColor: color,
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                  }}
                />
              );
            })}

            {/* CENTRAL CORE */}

            <View
              pointerEvents="none"
              className="absolute items-center justify-center"
              style={{
                width: 100,
                height: 100,

                left: "50%",
                top: "50%",

                marginLeft: -50,
                marginTop: -50,
              }}
            >
              <View
                className="h-[88px] w-[88px] items-center justify-center rounded-full border"
                style={{
                  borderColor:
                    growingPercent >= 50
                      ? "rgba(113,139,255,0.20)"
                      : "rgba(230,87,168,0.20)",
                }}
              >
                <View
                  className="h-[54px] w-[54px] items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      growingPercent >= 50
                        ? "rgba(113,139,255,0.16)"
                        : "rgba(230,87,168,0.16)",
                  }}
                >
                  <View
                    className="h-[22px] w-[22px] rounded-full"
                    style={{
                      backgroundColor:
                        growingPercent >= 50 ? "#718BFF" : "#E657A8",

                      shadowColor: growingPercent >= 50 ? "#718BFF" : "#E657A8",

                      shadowOpacity: 1,
                      shadowRadius: 18,
                      shadowOffset: {
                        width: 0,
                        height: 0,
                      },
                    }}
                  />
                </View>
              </View>
            </View>

            {/* FIELD LABEL */}

            <View className="absolute bottom-5 left-0 right-0 items-center">
              <Text className="text-[11px] font-bold tracking-[1.2px] text-[#687694]">
                {growingPercent}% GROWING
              </Text>
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <View className="h-[76px] w-[76px] items-center justify-center rounded-full border border-[#25304A]">
              <View className="h-[10px] w-[10px] rounded-full bg-[#48536C]" />
            </View>

            <Text className="mt-5 text-[16px] font-semibold text-[#B5BED1]">
              Your field is quiet
            </Text>

            <Text className="mt-2 text-center text-[13px] leading-5 text-[#606D87]">
              Trace your first activity and watch your Life Field take shape.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
