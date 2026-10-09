import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import {
  ActivityArrival,
  consumePendingActivityArrival,
} from "@/lib/activityArrival";

import { activityService } from "@/services/ActivityService";
import { Activity, ActivityClassification } from "@/types/activity";

export type ActivityFilter = "all" | ActivityClassification;

const PAGE_SIZE = 50;

type ActivityCounts = {
  growingCount: number;
  leaksCount: number;
};

type ActivityQuery = {
  searchQuery: string;
  filter: ActivityFilter;
};

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<ActivityFilter>("all");

  const [counts, setCounts] = useState<ActivityCounts>({
    growingCount: 0,
    leaksCount: 0,
  });

  const [pendingArrival, setPendingArrival] = useState<ActivityArrival | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);
  const isFocusedRef = useRef(false);
  const requestVersionRef = useRef(0);

  const loadingPageRef = useRef(false);
  const loadingMoreRef = useRef(false);

  const activitiesRef = useRef<Activity[]>([]);
  const hasMoreRef = useRef(false);

  const activeQueryRef = useRef<ActivityQuery>({
    searchQuery: "",
    filter: "all",
  });

  const countsRef = useRef<ActivityCounts>({
    growingCount: 0,
    leaksCount: 0,
  });

  const arrivalRef = useRef<ActivityArrival | null>(null);

  const loadActivities = useCallback(
    async (query: ActivityQuery, arrival: ActivityArrival | null = null) => {
      const version = ++requestVersionRef.current;
      const initial = !hasLoadedRef.current;

      loadingPageRef.current = true;
      loadingMoreRef.current = false;
      hasMoreRef.current = false;

      setIsLoadingMore(false);
      setHasMore(false);

      try {
        if (initial) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }

        setErrorMessage(null);

        let pageSize = PAGE_SIZE;

        if (arrival) {
          const position = await activityService.getActivityPosition(
            arrival.activityDate,
          );

          if (version !== requestVersionRef.current) {
            return;
          }

          pageSize = Math.max(PAGE_SIZE, position + 1);
        }

        const [page, activityCounts] = await Promise.all([
          activityService.getActivitiesPage(
            pageSize,
            0,
            query.searchQuery,
            query.filter,
          ),
          activityService.getActivityCounts(query.searchQuery, query.filter),
        ]);

        if (version !== requestVersionRef.current) {
          return;
        }

        activitiesRef.current = page;
        setActivities(page);

        console.log(activities.length)

        countsRef.current = activityCounts;
        setCounts(activityCounts);

        activeQueryRef.current = query;

        const total = activityCounts.growingCount + activityCounts.leaksCount;

        const more = page.length < total;

        hasMoreRef.current = more;
        setHasMore(more);

        hasLoadedRef.current = true;
      } catch (error) {
        if (version !== requestVersionRef.current) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load activities.",
        );
      } finally {
        if (version === requestVersionRef.current) {
          loadingPageRef.current = false;
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [],
  );

  const loadMore = useCallback(async () => {
    if (
      loadingPageRef.current ||
      loadingMoreRef.current ||
      !hasMoreRef.current
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    const version = requestVersionRef.current;
    const query = activeQueryRef.current;

    try {
      const page = await activityService.getActivitiesPage(
        PAGE_SIZE,
        activitiesRef.current.length,
        query.searchQuery,
        query.filter,
      );

      if (version !== requestVersionRef.current) {
        return;
      }

      const updated = [...activitiesRef.current, ...page];

      activitiesRef.current = updated;
      setActivities(updated);

      const total =
        countsRef.current.growingCount + countsRef.current.leaksCount;

      const more = updated.length < total;

      hasMoreRef.current = more;
      setHasMore(more);
    } catch (error) {
      if (version !== requestVersionRef.current) {
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load more activities.",
      );
    } finally {
      if (version === requestVersionRef.current) {
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, []);

  const completeArrival = useCallback(() => {
    arrivalRef.current = null;
    setPendingArrival(null);
  }, []);

  const reload = useCallback(() => {
    const query = activeQueryRef.current;

    return loadActivities(query, arrivalRef.current);
  }, [loadActivities]);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;

      const arrival = consumePendingActivityArrival();

      arrivalRef.current = arrival;
      setPendingArrival(arrival);

      const query: ActivityQuery = arrival
        ? { searchQuery: "", filter: "all" }
        : { searchQuery, filter };

      if (arrival) {
        setSearchQuery("");
        setFilter("all");
      }

      void loadActivities(query, arrival);

      return () => {
        isFocusedRef.current = false;
        requestVersionRef.current++;
        arrivalRef.current = null;
      };
    }, [loadActivities]),
  );

  useEffect(() => {
    if (!isFocusedRef.current) {
      return;
    }

    if (arrivalRef.current) {
      return;
    }

    void loadActivities({ searchQuery, filter });
  }, [searchQuery, filter, loadActivities]);

  return {
    activities,
    counts,
    pendingArrival,
    searchQuery,
    filter,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    errorMessage,
    setSearchQuery,
    setFilter,
    reload,
    loadMore,
    completeArrival,
  };
}
