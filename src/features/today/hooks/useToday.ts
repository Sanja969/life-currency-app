import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { activityService } from "@/services/ActivityService";
import { Activity, ActivityStatistics } from "@/types/activity";

export function useToday() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [statistics, setStatistics] = useState<ActivityStatistics | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function load() {
        console.log("TODAY LOAD");
        try {
          setIsLoading(true);
          setErrorMessage(null);

          const [activitiesResult, statisticsResult] = await Promise.all([
            activityService.getTodayActivities(),
            activityService.getTodayStatistics(),
          ]);

          if (!isActive) return;

          setActivities(activitiesResult);
          setStatistics(statisticsResult);
        } catch (error) {
          if (!isActive) return;

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
          );
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void load();

      return () => {
        isActive = false;
      };
    }, []),
  );

  return {
    activities,
    statistics,
    isLoading,
    errorMessage,
  };
}
