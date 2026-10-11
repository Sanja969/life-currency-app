import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import { ActivityCategory } from "@/types/activity";

import {
  SaveWeeklyIntentionInput,
  WeeklyIntentionProgress,
} from "@/types/weeklyIntention";

import { weeklyIntentionService } from "@/services/WeeklyIntentionService";

import {
  getWeekStart,
  shiftWeek,
} from "../utils/weekUtils";

export function useWeeklyIntentions() {
  const [weekStart, setWeekStart] = useState(() =>
    getWeekStart(),
  );

  const [intentions, setIntentions] = useState<
    WeeklyIntentionProgress[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const loadIntentions = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result =
        await weeklyIntentionService.getWeeklyProgress(
          weekStart,
        );

      setIntentions(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load weekly intentions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [weekStart]);

  useFocusEffect(
    useCallback(() => {
      void loadIntentions();
    }, [loadIntentions]),
  );

  const previousWeek = useCallback(() => {
    setWeekStart((current) => shiftWeek(current, -1));
  }, []);

  const nextWeek = useCallback(() => {
    setWeekStart((current) => shiftWeek(current, 1));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setWeekStart(getWeekStart());
  }, []);

  const saveIntention = useCallback(
    async (
      category: ActivityCategory,
      targetMinutes: number,
    ) => {
      setIsSaving(true);

      try {
        const input: SaveWeeklyIntentionInput = {
          category,
          weekStart,
          targetMinutes,
        };

        await weeklyIntentionService.saveIntention(input);

        await loadIntentions();
      } finally {
        setIsSaving(false);
      }
    },
    [weekStart, loadIntentions],
  );

  const deleteIntention = useCallback(
    async (category: ActivityCategory) => {
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
    [weekStart, loadIntentions],
  );

  const totalTargetMinutes = useMemo(
    () =>
      intentions.reduce(
        (sum, intention) =>
          sum + intention.targetMinutes,
        0,
      ),
    [intentions],
  );

  const totalActualMinutes = useMemo(
    () =>
      intentions.reduce(
        (sum, intention) =>
          sum + intention.actualMinutes,
        0,
      ),
    [intentions],
  );

  return {
    weekStart,
    intentions,
    isLoading,
    isSaving,
    errorMessage,

    totalTargetMinutes,
    totalActualMinutes,

    previousWeek,
    nextWeek,
    goToCurrentWeek,

    saveIntention,
    deleteIntention,
    refresh: loadIntentions,
  };
}