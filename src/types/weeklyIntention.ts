import { ActivityCategory } from "./activity";

export type WeeklyIntention = {
    id: number;
    category: ActivityCategory;
    weekStart: string;
    targetMinutes: number;
    createdAt: Date;
    updatedAt: Date;
};

export type SaveWeeklyIntentionInput = {
    category: ActivityCategory;
    weekStart: string;
    targetMinutes: number;
};

export type WeeklyIntentionProgress = WeeklyIntention & {
    actualMinutes: number;
    progressPercent: number;
    remainingMinutes: number;
};