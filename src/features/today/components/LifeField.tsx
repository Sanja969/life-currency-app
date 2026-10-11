import { StyleSheet, Text, View } from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";

import { ActivityClassification, ActivityStatistics } from "@/types/activity";

type LifeFieldProps = {
  statistics: ActivityStatistics;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  classification: ActivityClassification;
  opacity: number;
};

/*
 * PARTICLE POSITIONS
 *
 * Fixed positions keep the visualization
 * stable between renders.
 */

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

const CLASSIFICATION_ORDER = [
  ActivityClassification.Serves,
  ActivityClassification.Restores,
  ActivityClassification.DoesNotServe,
] as const;

/*
 * PARTICLE DISTRIBUTION
 *
 * Distributes particles proportionally
 * to recorded time.
 *
 * Uses the largest remainder method
 * to preserve the total particle count.
 */

function distributeParticles(
  count: number,
  durations: readonly number[],
): number[] {
  const total = durations.reduce((sum, duration) => sum + duration, 0);

  if (total <= 0 || count <= 0) {
    return durations.map(() => 0);
  }

  const exactCounts = durations.map((duration) => (duration / total) * count);

  const counts = exactCounts.map(Math.floor);

  let remaining = count - counts.reduce((sum, value) => sum + value, 0);

  const priorities = exactCounts
    .map((value, index) => ({
      index,
      remainder: value - counts[index],
    }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  for (const item of priorities) {
    if (remaining <= 0) {
      break;
    }

    counts[item.index] += 1;
    remaining -= 1;
  }

  return counts;
}

/*
 * BUILD PARTICLES
 *
 * Particle colors represent the
 * relative distribution of Growing,
 * Restoring and Life Leaks.
 *
 * Particle positions are deterministic.
 */

function buildParticles(statistics: ActivityStatistics): Particle[] {
  const totalMinutes = statistics.totalDurationMinutes;

  if (totalMinutes <= 0) {
    return [];
  }

  /*
   * PARTICLE COUNT
   *
   * Minimum: 3
   * Maximum: 15
   */

  const count = Math.min(
    PARTICLE_POSITIONS.length,
    Math.max(3, Math.ceil(totalMinutes / 25)),
  );

  const durations = [
    statistics.servesDurationMinutes,
    statistics.restoresDurationMinutes,
    statistics.doesNotServeDurationMinutes,
  ];

  const distribution = distributeParticles(count, durations);

  /*
   * BUILD CLASSIFICATION ARRAY
   */

  const classifications: ActivityClassification[] = [];

  CLASSIFICATION_ORDER.forEach((classification, index) => {
    for (let i = 0; i < distribution[index]; i++) {
      classifications.push(classification);
    }
  });

  /*
   * SPREAD CLASSIFICATIONS
   *
   * The previous implementation used:
   *
   * (index * 7) % count
   *
   * This could repeat indices when count
   * was divisible by 7.
   *
   * We now use a deterministic shuffle
   * that preserves every classification.
   */

  const shuffledClassifications = [...classifications];

  for (let index = shuffledClassifications.length - 1; index > 0; index--) {
    const swapIndex = (index * 7 + 3) % (index + 1);

    [shuffledClassifications[index], shuffledClassifications[swapIndex]] = [
      shuffledClassifications[swapIndex],
      shuffledClassifications[index],
    ];
  }

  /*
   * CREATE PARTICLES
   */

  return PARTICLE_POSITIONS.slice(0, count).map(([x, y], index) => ({
    x,
    y,
    classification: shuffledClassifications[index],
    size: 5 + ((index * 7) % 8),
    opacity: 0.45 + ((index * 11) % 45) / 100,
  }));
}

/*
 * LIFE FIELD
 */

export function LifeField({ statistics }: LifeFieldProps) {
  const hasData = statistics.totalDurationMinutes > 0;

  /*
   * CLASSIFICATION THEMES
   */

  const growingTheme = CLASSIFICATION_THEME[ActivityClassification.Serves];

  const restoringTheme = CLASSIFICATION_THEME[ActivityClassification.Restores];

  const leakTheme = CLASSIFICATION_THEME[ActivityClassification.DoesNotServe];

  /*
   * CLASSIFICATION PERCENTAGES
   *
   * Used only for ambient glow intensity.
   * Percentages are no longer displayed.
   */

  const growingPercent = statistics.servesPercentage;

  const restoringPercent = statistics.restoresPercentage;

  const leakPercent = statistics.doesNotServePercentage;

  /*
   * PARTICLES
   */

  const particles = buildParticles(statistics);

  /*
   * DOMINANT CLASSIFICATION
   *
   * Determines the central core color.
   */

  const durations: Record<ActivityClassification, number> = {
    [ActivityClassification.Serves]: statistics.servesDurationMinutes,

    [ActivityClassification.Restores]: statistics.restoresDurationMinutes,

    [ActivityClassification.DoesNotServe]:
      statistics.doesNotServeDurationMinutes,
  };

  const dominantClassification = CLASSIFICATION_ORDER.reduce(
    (dominant, current) =>
      durations[current] > durations[dominant] ? current : dominant,
  );

  const dominantColor = CLASSIFICATION_THEME[dominantClassification].color;

  /*
   * RENDER
   */

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>LIFE FIELD</Text>

          <Text style={styles.sparkle}>✦</Text>
        </View>

        <Text style={styles.subtitle}>Your day, visualized.</Text>
      </View>

      {/* COSMIC FIELD */}

      <CosmicPanel
        variant="default"
        accent={COLORS.gold}
        contentStyle={styles.field}
      >
        {/* GROWING AMBIENT GLOW */}

        <View
          pointerEvents="none"
          style={[
            styles.ambientGlow,
            {
              left: -85,
              top: 15,
              backgroundColor: growingTheme.color,
              opacity: hasData ? 0.04 + growingPercent * 0.0006 : 0.025,
            },
          ]}
        />

        {/* RESTORING AMBIENT GLOW */}

        <View
          pointerEvents="none"
          style={[
            styles.ambientGlow,
            {
              left: "50%",
              top: -95,
              marginLeft: -115,
              backgroundColor: restoringTheme.color,
              opacity: hasData ? 0.025 + restoringPercent * 0.0006 : 0.015,
            },
          ]}
        />

        {/* LIFE LEAK AMBIENT GLOW */}

        <View
          pointerEvents="none"
          style={[
            styles.ambientGlow,
            {
              right: -85,
              top: 45,
              backgroundColor: leakTheme.color,
              opacity: hasData ? 0.04 + leakPercent * 0.0006 : 0.025,
            },
          ]}
        />

        {/* GOLD ORBITS */}

        <View pointerEvents="none" style={[styles.orbit, styles.orbitOuter]} />

        <View pointerEvents="none" style={[styles.orbit, styles.orbitMiddle]} />

        <View pointerEvents="none" style={[styles.orbit, styles.orbitInner]} />

        {/* ORBIT ACCENTS */}

        <View pointerEvents="none" style={styles.orbitAccentTop} />

        <View pointerEvents="none" style={styles.orbitAccentBottom} />

        {hasData ? (
          <>
            {/* PARTICLES */}

            {particles.map((particle, index) => {
              const color = CLASSIFICATION_THEME[particle.classification].color;

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
                    shadowOpacity: 0.9,
                    shadowRadius: 11,

                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                  }}
                />
              );
            })}

            {/* CENTRAL ENERGY CORE */}

            <View pointerEvents="none" style={styles.coreContainer}>
              <View style={styles.coreOuter}>
                <View
                  style={[
                    styles.coreMiddle,
                    {
                      borderColor: `${dominantColor}55`,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.coreInner,
                      {
                        backgroundColor: `${dominantColor}22`,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.coreLight,
                        {
                          backgroundColor: dominantColor,

                          shadowColor: dominantColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* FIELD FOOTER */}

            <View style={styles.fieldFooter}>
              <View style={styles.fieldFooterLine} />

              <Text style={styles.fieldHint}>A VISUAL TRACE OF YOUR DAY</Text>
            </View>
          </>
        ) : (
          /* EMPTY STATE */

          <View style={styles.emptyState}>
            <View style={styles.emptyCoreOuter}>
              <View style={styles.emptyCoreInner} />
            </View>

            <Text style={styles.emptyTitle}>Your field is quiet</Text>

            <Text style={styles.emptyDescription}>
              Trace your first activity and watch your Life Field take shape.
            </Text>
          </View>
        )}
      </CosmicPanel>
    </View>
  );
}

/*
 * STYLES
 */

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    width: "100%",
  },

  /*
   * HEADER
   */

  header: {
    marginBottom: 15,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  title: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.7,
  },

  sparkle: {
    color: COLORS.gold,
    fontSize: 13,
    opacity: 0.75,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
  },

  /*
   * FIELD
   */

  field: {
    height: 300,
    padding: 0,
    position: "relative",
    overflow: "hidden",
  },

  /*
   * AMBIENT GLOW
   */

  ambientGlow: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
  },

  /*
   * ORBITS
   */

  orbit: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 999,
    borderColor: "rgba(214,173,101,0.12)",
    left: "50%",
    top: "50%",
  },

  orbitOuter: {
    width: 250,
    height: 250,
    marginLeft: -125,
    marginTop: -125,
    borderColor: "rgba(214,173,101,0.10)",
  },

  orbitMiddle: {
    width: 190,
    height: 190,
    marginLeft: -95,
    marginTop: -95,
    borderColor: "rgba(214,173,101,0.15)",
  },

  orbitInner: {
    width: 125,
    height: 125,
    marginLeft: -62.5,
    marginTop: -62.5,
    borderColor: "rgba(214,173,101,0.11)",
  },

  /*
   * ORBIT ACCENTS
   */

  orbitAccentTop: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    left: "50%",
    top: 25,
    marginLeft: -3.5,
    opacity: 0.65,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.7,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  orbitAccentBottom: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.lightGold,
    left: "50%",
    bottom: 25,
    marginLeft: -2.5,
    opacity: 0.5,
  },

  /*
   * CENTRAL CORE
   */

  coreContainer: {
    position: "absolute",
    width: 130,
    height: 130,
    left: "50%",
    top: "50%",
    marginLeft: -65,
    marginTop: -65,
    alignItems: "center",
    justifyContent: "center",
  },

  coreOuter: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  coreMiddle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  coreInner: {
    width: 59,
    height: 59,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  coreLight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  /*
   * FIELD FOOTER
   */

  fieldFooter: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  fieldFooterLine: {
    width: 24,
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.45,
  },

  fieldHint: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1.4,
    marginTop: 8,
  },

  /*
   * EMPTY STATE
   */

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  emptyCoreOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCoreInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.gold,
    opacity: 0.55,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 22,
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 9,
    maxWidth: 260,
  },
});
