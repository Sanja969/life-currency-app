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
        icon: "film-outline",
    },

    [ActivityCategory.Mindfulness]: {
        label: "Mindfulness",
        icon: "leaf-outline",
    },

    [ActivityCategory.Household]: {
        label: "Household",
        icon: "home-outline",
    },

    [ActivityCategory.ChoresErrands]: {
        label: "Chores & Errands",
        icon: "checkbox-outline",
    },

    [ActivityCategory.SocialMedia]: {
        label: "Social Media",
        icon: "phone-portrait-outline",
    },

    [ActivityCategory.Commuting]: {
        label: "Commuting",
        icon: "car-outline",
    },

    [ActivityCategory.PersonalCare]: {
        label: "Personal Care",
        icon: "sparkles-outline",
    },

    [ActivityCategory.Shopping]: {
        label: "Shopping",
        icon: "bag-outline",
    },

    [ActivityCategory.Gaming]: {
        label: "Gaming",
        icon: "game-controller-outline",
    },

    [ActivityCategory.AdministrativeTasks]: {
        label: "Admin Tasks",
        icon: "document-text-outline",
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