import { useCallback, useState } from "react";

import {
  activityService,
  QuickAddSuggestion,
} from "@/services/ActivityService";

import { Activity } from "@/types/activity";

export function useQuickAdd() {
  const [suggestions, setSuggestions] = useState<QuickAddSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<QuickAddSuggestion | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await activityService.getQuickAddSuggestions();

      setSuggestions(result);
    } catch (error) {
      console.error("Unable to load Quick Add suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openSuggestion = useCallback((suggestion: QuickAddSuggestion) => {
    setErrorMessage(null);
    setSelectedSuggestion(suggestion);
  }, []);

  const closeSuggestion = useCallback(() => {
    if (isSaving) return;

    setErrorMessage(null);
    setSelectedSuggestion(null);
  }, [isSaving]);

  const addActivity = useCallback(
    async (
      durationMinutes: number,
      activityDate: Date,
    ): Promise<Activity | null> => {
      if (!selectedSuggestion || isSaving) return null;

      if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
        setErrorMessage("Enter a valid duration in minutes.");
        return null;
      }

      if (Number.isNaN(activityDate.getTime())) {
        setErrorMessage("Enter a valid start time.");
        return null;
      }

      setIsSaving(true);
      setErrorMessage(null);

      try {
        const created = await activityService.createActivity({
          title: selectedSuggestion.title,
          description: selectedSuggestion.description ?? undefined,
          category: selectedSuggestion.category,
          classification: selectedSuggestion.classification,
          durationMinutes,
          activityDate,
        });

        setSelectedSuggestion(null);

        return created;
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to add activity.",
        );

        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [selectedSuggestion, isSaving],
  );

  return {
    suggestions,
    selectedSuggestion,
    isLoading,
    isSaving,
    errorMessage,
    loadSuggestions,
    openSuggestion,
    closeSuggestion,
    addActivity,
  };
}