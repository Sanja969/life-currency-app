import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { weeklyIntentionService } from "@/services/WeeklyIntentionService";

import type { ActivityCategory } from "@/types/activity";
import type { WeeklyIntentionProgress } from "@/types/weeklyIntention";

import { getWeekStart } from "@/features/plan/utils/weekUtils";
import { getIntentionSummary } from "@/features/plan/utils/intentionStatus";

type UseIntentionAlignmentOptions = {
    weekStart: string;
    isCurrentWeek: boolean;
};

export function useIntentionAlignment({
    weekStart,
    isCurrentWeek,
}: UseIntentionAlignmentOptions) {
    const [intentions, setIntentions] = useState<WeeklyIntentionProgress[]>([]);
    const [previousIntentions, setPreviousIntentions] = useState<
        WeeklyIntentionProgress[]
    >([]);

    const [selectedCategories, setSelectedCategories] = useState<
        ActivityCategory[]
    >([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCarryingForward, setIsCarryingForward] = useState(false);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [carryError, setCarryError] = useState<string | null>(null);

    const hasLoadedRef = useRef(false);
    const isCarryingForwardRef = useRef(false);

    const loadIntentions = useCallback(async () => {
        const current = await weeklyIntentionService.getWeeklyProgress(weekStart);

        if (!isCurrentWeek) {
            return {
                current,
                availablePrevious: [] as WeeklyIntentionProgress[],
            };
        }

        const previous =
            await weeklyIntentionService.getPreviousWeekIntentions(weekStart);

        const currentCategories = new Set(
            current.map((intention) => intention.category),
        );

        const availablePrevious = previous.filter(
            (intention) => !currentCategories.has(intention.category),
        );

        return {
            current,
            availablePrevious,
        };
    }, [weekStart, isCurrentWeek]);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            async function load() {
                try {
                    if (!hasLoadedRef.current) {
                        setIsLoading(true);
                    } else {
                        setIsRefreshing(true);
                    }

                    setErrorMessage(null);
                    setCarryError(null);

                    const result = await loadIntentions();

                    if (!active) return;

                    setIntentions(result.current);
                    setPreviousIntentions(result.availablePrevious);

                    setSelectedCategories(
                        result.availablePrevious.map((intention) => intention.category),
                    );

                    hasLoadedRef.current = true;
                } catch (error) {
                    if (!active) return;

                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "Unable to load weekly intentions.",
                    );
                } finally {
                    if (active) {
                        setIsLoading(false);
                        setIsRefreshing(false);
                    }
                }
            }

            void load();

            return () => {
                active = false;
            };
        }, [loadIntentions]),
    );

    const toggleCategory = useCallback((category: ActivityCategory) => {
        if (!isCurrentWeek) return;

        setSelectedCategories((current) =>
            current.includes(category)
                ? current.filter((item) => item !== category)
                : [...current, category],
        );
    }, [isCurrentWeek]);

    const carryForward = useCallback(async () => {
        if (
            !isCurrentWeek ||
            weekStart !== getWeekStart() ||
            isCarryingForwardRef.current ||
            selectedCategories.length === 0
        ) {
            return;
        }

        isCarryingForwardRef.current = true;
        setIsCarryingForward(true);
        setCarryError(null);

        try {
            await weeklyIntentionService.carryForwardIntentions(
                weekStart,
                selectedCategories,
            );

            const result = await loadIntentions();

            setIntentions(result.current);
            setPreviousIntentions(result.availablePrevious);

            setSelectedCategories(
                result.availablePrevious.map((intention) => intention.category),
            );
        } catch (error) {
            setCarryError(
                error instanceof Error
                    ? error.message
                    : "Unable to continue your intentions.",
            );
        } finally {
            isCarryingForwardRef.current = false;
            setIsCarryingForward(false);
        }
    }, [isCurrentWeek, weekStart, selectedCategories, loadIntentions]);

    const summary = useMemo(
        () => getIntentionSummary(intentions),
        [intentions],
    );

    const weekEnd = useMemo(() => {
        const [year, month, day] = weekStart.split("-").map(Number);

        return new Date(year, month - 1, day + 6);
    }, [weekStart]);

    return {
        weekStart,
        weekEnd,

        intentions,
        previousIntentions,
        selectedCategories,
        summary,

        isLoading,
        isRefreshing,
        isCarryingForward,

        errorMessage,
        carryError,

        toggleCategory,
        carryForward,
    };
}