import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { activityService } from "@/services/ActivityService";
import {
  Activity,
  ActivityClassification,
} from "@/types/activity";

export type ActivityFilter = "all" | ActivityClassification;

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<ActivityFilter>("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);

  const loadActivities = useCallback(async () => {
    const isInitialLoad = !hasLoadedRef.current;

    try {
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setErrorMessage(null);

      const result = await activityService.getAllActivities();

      setActivities(result);
      hasLoadedRef.current = true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load activities.",
      );
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadActivities();
    }, [loadActivities]),
  );

  const visibleActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activities.filter((activity) => {
      const matchesSearch =
        query.length === 0 ||
        activity.title.toLowerCase().includes(query) ||
        activity.description?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" || activity.classification === filter;

      return matchesSearch && matchesFilter;
    });
  }, [activities, filter, searchQuery]);

  return {
    activities: visibleActivities,
    searchQuery,
    filter,
    isLoading,
    isRefreshing,
    errorMessage,
    setSearchQuery,
    setFilter,
    reload: loadActivities,
  };
}