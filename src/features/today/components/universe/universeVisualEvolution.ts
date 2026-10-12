export type UniverseVisualMode = "daily" | "lifetime";

export type UniverseVisualEvolution = {
    level: number;
    progress: number;
    structure: number;
    energy: number;
    presence: number;
};

const clamp = (value: number) =>
    Math.max(0, Math.min(1, value));

// Thresholds for individual worlds:
// Growing, Restoring and Life Leaks evolve independently.
const LEVEL_THRESHOLDS = [
    0,
    1,
    3,
    7,
    15,
    30,
    60,
    120,
    250,
    500,
    1000,
];

export function getUniverseVisualEvolution(
    activityCount: number,
    durationMinutes: number,
    percentage: number,
): UniverseVisualEvolution {
    const count = Math.max(0, activityCount);
    const minutes = Math.max(0, durationMinutes);

    let level = 0;

    for (
        let index = 0;
        index < LEVEL_THRESHOLDS.length;
        index++
    ) {
        if (count >= LEVEL_THRESHOLDS[index]) {
            level = index;
        }
    }

    const currentThreshold = LEVEL_THRESHOLDS[level];
    const nextThreshold = LEVEL_THRESHOLDS[level + 1];

    const progress =
        nextThreshold === undefined
            ? 1
            : clamp(
                (count - currentThreshold) /
                (nextThreshold - currentThreshold),
            );

    // Gradual structural development.
    const structure = clamp(
        Math.log1p(count) / Math.log1p(1000),
    );

    // Accumulated energy from time invested.
    const energy = clamp(
        Math.log1p(minutes) / Math.log1p(60000),
    );

    return {
        level,
        progress,
        structure,
        energy,
        presence: clamp(percentage / 100),
    };
}