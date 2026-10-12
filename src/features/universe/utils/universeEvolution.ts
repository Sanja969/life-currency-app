import {
    calculateEvolutionScore,
    type EvolutionScore,
} from "./evolutionScore";

export type UniverseStage =
    | "seed"
    | "awakening"
    | "formation"
    | "expansion"
    | "constellation"
    | "evolution";

export type UniverseWorldStats = {
    activityCount: number;
    totalMinutes: number;
    percentage: number;
};

export type UniverseStats = {
    growingCount: number;
    restoringCount: number;
    leaksCount: number;

    growingMinutes: number;
    restoringMinutes: number;
    leaksMinutes: number;

    intentionalDays: number;

    firstActivityDate: string | null;
    lastActivityDate: string | null;
};

export type UniverseEvolution = {
    stage: UniverseStage;

    totalActivities: number;
    totalMinutes: number;

    growing: UniverseWorldStats;
    restoring: UniverseWorldStats;
    leaks: UniverseWorldStats;

    evolutionScore: EvolutionScore;

    firstActivityDate: Date | null;
    lastActivityDate: Date | null;
};

type StageDefinition = {
    stage: UniverseStage;
    minScore: number;
};

const STAGES: StageDefinition[] = [
    { stage: "seed", minScore: 0 },
    { stage: "awakening", minScore: 1 },
    { stage: "formation", minScore: 40 },
    { stage: "expansion", minScore: 100 },
    { stage: "constellation", minScore: 220 },
    { stage: "evolution", minScore: 450 },
];

export const UNIVERSE_STAGE_THRESHOLDS: Record<
    UniverseStage,
    number
> = {
    seed: 0,
    awakening: 1,
    formation: 40,
    expansion: 100,
    constellation: 220,
    evolution: 450,
};

function getUniverseStage(
    score: number,
): UniverseStage {
    for (let index = STAGES.length - 1; index >= 0; index--) {
        if (score >= STAGES[index].minScore) {
            return STAGES[index].stage;
        }
    }

    return "seed";
}

export function calculateUniverseEvolution(
    stats: UniverseStats,
): UniverseEvolution {
    const totalActivities =
        stats.growingCount +
        stats.restoringCount +
        stats.leaksCount;

    const totalMinutes =
        stats.growingMinutes +
        stats.restoringMinutes +
        stats.leaksMinutes;

    const percentage = (minutes: number) =>
        totalMinutes > 0
            ? (minutes / totalMinutes) * 100
            : 0;

    const evolutionScore = calculateEvolutionScore({
        growingMinutes: stats.growingMinutes,
        restoringMinutes: stats.restoringMinutes,
        leaksMinutes: stats.leaksMinutes,
        intentionalDays: stats.intentionalDays,
    });

    return {
        stage: getUniverseStage(evolutionScore.total),

        totalActivities,
        totalMinutes,

        growing: {
            activityCount: stats.growingCount,
            totalMinutes: stats.growingMinutes,
            percentage: percentage(stats.growingMinutes),
        },

        restoring: {
            activityCount: stats.restoringCount,
            totalMinutes: stats.restoringMinutes,
            percentage: percentage(stats.restoringMinutes),
        },

        leaks: {
            activityCount: stats.leaksCount,
            totalMinutes: stats.leaksMinutes,
            percentage: percentage(stats.leaksMinutes),
        },

        evolutionScore,

        firstActivityDate: stats.firstActivityDate
            ? new Date(stats.firstActivityDate)
            : null,

        lastActivityDate: stats.lastActivityDate
            ? new Date(stats.lastActivityDate)
            : null,
    };
}