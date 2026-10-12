export type EvolutionScore = {
    total: number;

    intentionalTime: number;
    consistency: number;
    balance: number;

    intentionalMinutes: number;
    intentionalDays: number;
};

type EvolutionScoreInput = {
    growingMinutes: number;
    restoringMinutes: number;
    leaksMinutes: number;
    intentionalDays: number;
};

const safeNumber = (value: number) =>
    Number.isFinite(value) ? Math.max(0, value) : 0;

const round = (value: number) =>
    Math.round(value * 10) / 10;

export function calculateEvolutionScore(
    input: EvolutionScoreInput,
): EvolutionScore {
    const growingMinutes = safeNumber(input.growingMinutes);
    const restoringMinutes = safeNumber(input.restoringMinutes);
    const leaksMinutes = safeNumber(input.leaksMinutes);

    const intentionalDays = Math.floor(
        safeNumber(input.intentionalDays),
    );

    const intentionalMinutes =
        growingMinutes + restoringMinutes;

    const totalMinutes =
        intentionalMinutes + leaksMinutes;

    // Lifetime progression:
    // Only intentional time and active days earn points.
    const intentionalTimeScore =
        intentionalMinutes > 0
            ? 12 * Math.sqrt(intentionalMinutes / 60)
            : 0;

    const consistencyScore =
        8 * Math.sqrt(intentionalDays);

    // Balance is informational, not part of lifetime score.
    const balance =
        totalMinutes > 0
            ? (intentionalMinutes / totalMinutes) * 100
            : 0;

    return {
        total: round(
            intentionalTimeScore + consistencyScore,
        ),

        intentionalTime: round(intentionalTimeScore),
        consistency: round(consistencyScore),
        balance: round(balance),

        intentionalMinutes,
        intentionalDays,
    };
}