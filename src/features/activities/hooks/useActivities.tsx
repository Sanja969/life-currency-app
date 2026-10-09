import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { activityService } from "@/services/ActivityService";
import {
  Activity,
  ActivityClassification,
} from "@/types/activity";

export type ActivityFilter = "all" | ActivityClassification;

const PAGE_SIZE = 50;

type ActivityCounts = {
  growingCount: number;
  leaksCount: number;
};

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<ActivityFilter>("all");

  const [counts, setCounts] = useState<ActivityCounts>({
    growingCount: 0,
    leaksCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);
  const requestVersionRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const activitiesRef = useRef<Activity[]>([]);
  const hasMoreRef = useRef(false);

  const loadActivities = useCallback(async () => {
    const requestVersion = ++requestVersionRef.current;
    const isInitialLoad = !hasLoadedRef.current;

    loadingMoreRef.current = false;
    hasMoreRef.current = false;
    setHasMore(false);

    try {
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setErrorMessage(null);

      const [result, activityCounts] = await Promise.all([
        activityService.getActivitiesPage(
          PAGE_SIZE,
          0,
          searchQuery,
          filter,
        ),
        activityService.getActivityCounts(searchQuery, filter),
      ]);

      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      activitiesRef.current = result;
      setActivities(result);
      setCounts(activityCounts);

      const total =
        activityCounts.growingCount + activityCounts.leaksCount;

      const moreAvailable = result.length < total;

      hasMoreRef.current = moreAvailable;
      setHasMore(moreAvailable);

      hasLoadedRef.current = true;
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load activities.",
      );
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [searchQuery, filter]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) {
      return;
    }

    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    const requestVersion = requestVersionRef.current;

    try {
      const nextPage = await activityService.getActivitiesPage(
        PAGE_SIZE,
        activitiesRef.current.length,
        searchQuery,
        filter,
      );

      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      const updatedActivities = [
        ...activitiesRef.current,
        ...nextPage,
      ];

      activitiesRef.current = updatedActivities;
      setActivities(updatedActivities);

      const total = counts.growingCount + counts.leaksCount;

      const moreAvailable = updatedActivities.length < total;

      hasMoreRef.current = moreAvailable;
      setHasMore(moreAvailable);
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load more activities.",
      );
    } finally {
      if (requestVersion === requestVersionRef.current) {
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [searchQuery, filter, counts]);

  useFocusEffect(
    useCallback(() => {
      void loadActivities();

      return () => {
        requestVersionRef.current++;
      };
    }, [loadActivities]),
  );

  return {
    activities,
    counts,
    searchQuery,
    filter,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    errorMessage,
    setSearchQuery,
    setFilter,
    reload: loadActivities,
    loadMore,
  };
}