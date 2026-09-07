import { Ionicons } from "@expo/vector-icons";

import { ActivityCategory } from "@/types/activity";

export type ActivityCategoryMeta = {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
};

export const ACTIVITY_CATEGORY_META: Record<
    ActivityCategory,
    ActivityCategoryMeta
> = {
    [ActivityCategory.Work]: {
        label: "Work",
        icon: "briefcase-outline",
    },
    [ActivityCategory.Learning]: {
        label: "Learning",
        icon: "book-outline",
    },
    [ActivityCategory.Health]: {
        label: "Health",
        icon: "fitness-outline",
    },
    [ActivityCategory.Relationships]: {
        label: "Relationships",
        icon: "people-outline",
    },
    [ActivityCategory.Rest]: {
        label: "Rest",
        icon: "moon-outline",
    },
    [ActivityCategory.Entertainment]: {
        label: "Entertainment",
        icon: "game-controller-outline",
    },
    [ActivityCategory.Mindfulness]: {
        label: "Mindfulness",
        icon: "leaf-outline",
    },
    [ActivityCategory.Other]: {
        label: "Other",
        icon: "ellipsis-horizontal-outline",
    },
};

export function getActivityCategoryMeta(
    category: ActivityCategory,
): ActivityCategoryMeta {
    return ACTIVITY_CATEGORY_META[category];
}