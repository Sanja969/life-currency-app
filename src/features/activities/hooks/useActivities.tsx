import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import {
  ActivityArrival,
  consumePendingActivityArrival,
} from "@/lib/activityArrival";

import { activityService } from "@/services/ActivityService";

import { Activity, ActivityClassification } from "@/types/activity";

/*
 * TYPES
 */

export type ActivityFilter = "all" | ActivityClassification;

type ActivityCounts = {
  growingCount: number;
  restoringCount: number;
  leaksCount: number;

  growingMinutes: number;
  restoringMinutes: number;
  leaksMinutes: number;
};

type ActivityQuery = {
  searchQuery: string;
  filter: ActivityFilter;
};

/*
 * CONSTANTS
 */

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

const EMPTY_COUNTS: ActivityCounts = {
  growingCount: 0,
  restoringCount: 0,
  leaksCount: 0,

  growingMinutes: 0,
  restoringMinutes: 0,
  leaksMinutes: 0,
};

/*
 * HOOK
 */

export function useActivities() {
  /*
   * ACTIVITIES STATE
   */

  const [activities, setActivities] = useState<Activity[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<ActivityFilter>("all");

  /*
   * GLOBAL STATISTICS
   */

  const [counts, setCounts] = useState<ActivityCounts>(EMPTY_COUNTS);

  /*
   * ARRIVAL ANIMATION
   */

  const [pendingArrival, setPendingArrival] = useState<ActivityArrival | null>(
    null,
  );

  /*
   * LOADING STATE
   */

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /*
   * SCREEN / REQUEST REFS
   */

  const hasLoadedRef = useRef(false);
  const isFocusedRef = useRef(false);

  const requestVersionRef = useRef(0);
  const countsRequestVersionRef = useRef(0);

  const loadingPageRef = useRef(false);
  const loadingMoreRef = useRef(false);

  const activitiesRef = useRef<Activity[]>([]);
  const hasMoreRef = useRef(false);

  const filteredCountRef = useRef(0);

  const activeQueryRef = useRef<ActivityQuery>({
    searchQuery: "",
    filter: "all",
  });

  const arrivalRef = useRef<ActivityArrival | null>(null);

  /*
   * CURRENT SEARCH / FILTER VALUES
   */

  const searchQueryRef = useRef(searchQuery);
  const filterRef = useRef(filter);

  searchQueryRef.current = searchQuery;
  filterRef.current = filter;

  /*
   * SEARCH DEBOUNCE
   */

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSearchTimer = useCallback(() => {
    if (searchTimerRef.current !== null) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  }, []);

  /*
   * GLOBAL TIME DISTRIBUTION
   *
   * Global statistics are independent
   * of the active search and filter.
   */

  const loadGlobalCounts = useCallback(async () => {
    const version = ++countsRequestVersionRef.current;

    try {
      const globalCounts = await activityService.getActivityCounts("", "all");

      if (
        version !== countsRequestVersionRef.current ||
        !isFocusedRef.current
      ) {
        return;
      }

      setCounts(globalCounts);
    } catch (error) {
      if (
        version !== countsRequestVersionRef.current ||
        !isFocusedRef.current
      ) {
        return;
      }

      console.error("Failed to load global activity statistics:", error);
    }
  }, []);

  /*
   * LOAD FIRST PAGE
   *
   * Includes:
   * - Growing
   * - Restoring
   * - Life Leaks
   */

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

        /*
         * Include newly created activity
         * even if it is older than the
         * first page of the timeline.
         */

        if (arrival) {
          const position = await activityService.getActivityPosition(
            arrival.activityDate,
          );

          if (version !== requestVersionRef.current || !isFocusedRef.current) {
            return;
          }

          pageSize = Math.max(PAGE_SIZE, position + 1);
        }

        /*
         * Load page and filtered counts
         * in parallel.
         */

        const [page, filteredCounts] = await Promise.all([
          activityService.getActivitiesPage(
            pageSize,
            0,
            query.searchQuery,
            query.filter,
          ),

          activityService.getActivityCounts(query.searchQuery, query.filter),
        ]);

        if (version !== requestVersionRef.current || !isFocusedRef.current) {
          return;
        }

        /*
         * UPDATE ACTIVITIES
         */

        activitiesRef.current = page;
        setActivities(page);

        /*
         * TOTAL FILTERED ACTIVITIES
         *
         * All three classifications
         * must be included.
         */

        const totalFiltered =
          filteredCounts.growingCount +
          filteredCounts.restoringCount +
          filteredCounts.leaksCount;

        filteredCountRef.current = totalFiltered;

        activeQueryRef.current = query;

        /*
         * PAGINATION
         */

        const more = page.length < totalFiltered;

        hasMoreRef.current = more;
        setHasMore(more);

        hasLoadedRef.current = true;
      } catch (error) {
        if (version !== requestVersionRef.current || !isFocusedRef.current) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load activities.",
        );
      } finally {
        if (version === requestVersionRef.current && isFocusedRef.current) {
          loadingPageRef.current = false;

          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [],
  );

  /*
   * LOAD NEXT PAGE
   */

  const loadMore = useCallback(async () => {
    if (
      !isFocusedRef.current ||
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

      if (version !== requestVersionRef.current || !isFocusedRef.current) {
        return;
      }

      /*
       * APPEND NEW PAGE
       */

      const updated = [...activitiesRef.current, ...page];

      activitiesRef.current = updated;
      setActivities(updated);

      /*
       * CHECK IF MORE ACTIVITIES EXIST
       */

      const more = page.length > 0 && updated.length < filteredCountRef.current;

      hasMoreRef.current = more;
      setHasMore(more);
    } catch (error) {
      if (version !== requestVersionRef.current || !isFocusedRef.current) {
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load more activities.",
      );
    } finally {
      if (version === requestVersionRef.current && isFocusedRef.current) {
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, []);

  /*
   * COMPLETE ARRIVAL ANIMATION
   */

  const completeArrival = useCallback(() => {
    arrivalRef.current = null;
    setPendingArrival(null);
  }, []);

  /*
   * MANUAL RELOAD
   */

  const reload = useCallback(async () => {
    clearSearchTimer();

    const query: ActivityQuery = {
      searchQuery: searchQueryRef.current,
      filter: filterRef.current,
    };

    await Promise.all([
      loadActivities(query, arrivalRef.current),
      loadGlobalCounts(),
    ]);
  }, [clearSearchTimer, loadActivities, loadGlobalCounts]);

  /*
   * SCREEN FOCUS
   *
   * Reload activities after:
   * - creating an activity
   * - editing an activity
   * - deleting an activity
   * - returning to this screen
   */

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;

      clearSearchTimer();

      /*
       * Check whether a newly created
       * activity should animate into
       * the timeline.
       */

      const arrival = consumePendingActivityArrival();

      arrivalRef.current = arrival;
      setPendingArrival(arrival);

      /*
       * Reset filters for a newly
       * created activity so it remains
       * visible in the timeline.
       */

      const query: ActivityQuery = arrival
        ? {
            searchQuery: "",
            filter: "all",
          }
        : {
            searchQuery: searchQueryRef.current,
            filter: filterRef.current,
          };

      if (arrival) {
        searchQueryRef.current = "";
        filterRef.current = "all";

        setSearchQuery("");
        setFilter("all");
      }

      /*
       * REFRESH DATA
       */

      void loadActivities(query, arrival);
      void loadGlobalCounts();

      /*
       * CLEANUP
       */

      return () => {
        isFocusedRef.current = false;

        clearSearchTimer();

        requestVersionRef.current++;
        countsRequestVersionRef.current++;

        loadingPageRef.current = false;
        loadingMoreRef.current = false;

        arrivalRef.current = null;
      };
    }, [clearSearchTimer, loadActivities, loadGlobalCounts]),
  );

  /*
   * SEARCH AND FILTER CHANGES
   *
   * Filter changes:
   * - load immediately
   *
   * Search changes:
   * - wait 300 ms
   */

  const previousInputsRef = useRef<ActivityQuery>({
    searchQuery: "",
    filter: "all",
  });

  useEffect(() => {
    const previous = previousInputsRef.current;

    const searchChanged = previous.searchQuery !== searchQuery;

    const filterChanged = previous.filter !== filter;

    previousInputsRef.current = {
      searchQuery,
      filter,
    };

    if (!isFocusedRef.current) {
      return;
    }

    if (arrivalRef.current) {
      return;
    }

    if (!searchChanged && !filterChanged) {
      return;
    }

    clearSearchTimer();

    const query: ActivityQuery = {
      searchQuery,
      filter,
    };

    /*
     * FILTER CHANGED
     */

    if (filterChanged) {
      void loadActivities(query);
      return;
    }

    /*
     * SEARCH CHANGED
     */

    searchTimerRef.current = setTimeout(() => {
      searchTimerRef.current = null;

      if (!isFocusedRef.current || arrivalRef.current) {
        return;
      }

      void loadActivities(query);
    }, SEARCH_DEBOUNCE_MS);

    return clearSearchTimer;
  }, [searchQuery, filter, clearSearchTimer, loadActivities]);

  /*
   * PUBLIC API
   */

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
