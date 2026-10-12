import { ActivityCategory } from "./activity";

export type IntentionDirection = "at_least" | "at_most";

export type WeeklyIntention = {
    id: number;
    category: ActivityCategory;
    weekStart: string;
    targetMinutes: number;
    direction: IntentionDirection;
    createdAt: Date;
    updatedAt: Date;
};

export type SaveWeeklyIntentionInput = {
    category: ActivityCategory;
    weekStart: string;
    targetMinutes: number;
    direction: IntentionDirection;
};

export type WeeklyIntentionProgress = WeeklyIntention & {
    actualMinutes: number;
    progressPercent: number;
    remainingMinutes: number;
};