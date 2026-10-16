import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { activityService } from "@/services/ActivityService";
import type { Activity } from "@/types/activity";

export function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, months: number): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth() + months,
        1,
    );
}

export function addDays(date: Date, days: number): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + days,
    );
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function useCalendarActivities(selectedDate: Date) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const monthKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const start = startOfMonth(selectedDate);
            const end = addMonths(start, 1);

            const result = await activityService.getOverlappingActivities(
                start,
                end,
            );

            setActivities(result);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to load calendar activities.",
            );
        } finally {
            setIsLoading(false);
        }
    }, [monthKey]);

    useFocusEffect(
        useCallback(() => {
            void load();
        }, [load]),
    );

    return {
        activities,
        isLoading,
        error,
        reload: load,
    };
}