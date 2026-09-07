import { z } from "zod";
import { ActivityCategory, ActivityClassification } from "../types/activity";

export const activitySchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Title is required"),

    description: z.string().optional(),

    durationMinutes: z.coerce
        .number()
        .positive("Duration must be greater than zero"),

    classification: z.enum(ActivityClassification),
    category: z.nativeEnum(ActivityCategory),

    activityDate: z.date({error: "Activity date is required"}),
});

export type ActivityFormInput = z.input<typeof activitySchema>;
export type ActivityFormOutput = z.output<typeof activitySchema>;