import {
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";

import { useFocusEffect } from "expo-router";

import { ActivityCategory } from "@/types/activity";

import type {
    IntentionDirection,
    SaveWeeklyIntentionInput,
    WeeklyIntentionProgress,
} from "@/types/weeklyIntention";

import { weeklyIntentionService } from "@/services/WeeklyIntentionService";

import {
    getWeekStart,
    shiftWeek,
} from "../utils/weekUtils";

export function useWeeklyIntentions() {
    const [weekStart, setWeekStart] = useState(
        () => getWeekStart(),
    );

    const [intentions, setIntentions] = useState<
        WeeklyIntentionProgress[]
    >([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [errorMessage, setErrorMessage] = useState<
        string | null
    >(null);

    const loadRequestId = useRef(0);

    /*
     * LOAD WEEKLY INTENTIONS
     */

    const loadIntentions = useCallback(async () => {
        const requestId = ++loadRequestId.current;

        try {
            setIsLoading(true);
            setErrorMessage(null);

            const result =
                await weeklyIntentionService.getWeeklyProgress(
                    weekStart,
                );

            if (requestId !== loadRequestId.current) {
                return;
            }

            setIntentions(result);
        } catch (error) {
            if (requestId !== loadRequestId.current) {
                return;
            }

            setIntentions([]);

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to load weekly intentions.",
            );
        } finally {
            if (requestId === loadRequestId.current) {
                setIsLoading(false);
            }
        }
    }, [weekStart]);

    /*
     * REFRESH WHEN SCREEN GAINS FOCUS
     */

    useFocusEffect(
        useCallback(() => {
            void loadIntentions();

            return () => {
                loadRequestId.current += 1;
            };
        }, [loadIntentions]),
    );

    /*
     * WEEK NAVIGATION
     */

    const previousWeek = useCallback(() => {
        setWeekStart((current) => shiftWeek(current, -1));
    }, []);

    const nextWeek = useCallback(() => {
        setWeekStart((current) => shiftWeek(current, 1));
    }, []);

    const goToCurrentWeek = useCallback(() => {
        setWeekStart(getWeekStart());
    }, []);

    /*
     * SAVE INTENTION
     */

    const saveIntention = useCallback(
        async (
            category: ActivityCategory,
            targetMinutes: number,
            direction: IntentionDirection,
        ) => {
            if (isSaving) return;

            setIsSaving(true);

            try {
                const input: SaveWeeklyIntentionInput = {
                    category,
                    weekStart,
                    targetMinutes,
                    direction,
                };

                await weeklyIntentionService.saveIntention(input);

                await loadIntentions();
            } finally {
                setIsSaving(false);
            }
        },
        [weekStart, loadIntentions, isSaving],
    );

    /*
     * DELETE INTENTION
     */

    const deleteIntention = useCallback(
        async (category: ActivityCategory) => {
            if (isSaving) return;

            setIsSaving(true);

            try {
                await weeklyIntentionService.deleteIntention(
                    category,
                    weekStart,
                );

                await loadIntentions();
            } finally {
                setIsSaving(false);
            }
        },
        [weekStart, loadIntentions, isSaving],
    );

    /*
     * SUMMARY
     *
     * At least and at most targets must not be combined
     * into one overall completion percentage.
     */

    const intentionSummary = useMemo(() => {
        let reached = 0;
        let inProgress = 0;
        let overLimit = 0;
        let withinLimit = 0;

        for (const intention of intentions) {
            if (intention.direction === "at_most") {
                if (intention.actualMinutes > intention.targetMinutes) {
                    overLimit += 1;
                } else {
                    withinLimit += 1;
                }
            } else {
                if (intention.actualMinutes >= intention.targetMinutes) {
                    reached += 1;
                } else {
                    inProgress += 1;
                }
            }
        }

        return {
            total: intentions.length,
            reached,
            inProgress,
            overLimit,
            withinLimit,
        };
    }, [intentions]);

    return {
        weekStart,
        intentions,

        isLoading,
        isSaving,
        errorMessage,

        intentionSummary,

        previousWeek,
        nextWeek,
        goToCurrentWeek,

        saveIntention,
        deleteIntention,

        refresh: loadIntentions,
    };
}