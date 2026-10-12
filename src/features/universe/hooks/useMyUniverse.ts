import {
    useCallback,
    useMemo,
    useState,
  } from "react";
  
  import { useFocusEffect } from "expo-router";
  
  import { activityService } from "@/services/ActivityService";
  
  import {
    calculateUniverseEvolution,
    UniverseStats,
  } from "../utils/universeEvolution";
  
  export function useMyUniverse() {
    const [stats, setStats] =
      useState<UniverseStats | null>(null);
  
    const [selectedMonth, setSelectedMonth] =
      useState(() => new Date());
  
    const [isLoading, setIsLoading] =
      useState(true);
  
    const [errorMessage, setErrorMessage] =
      useState<string | null>(null);
  
    const untilDate = useMemo(() => {
      const now = new Date();
  
      const endOfSelectedMonth = new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() + 1,
        1,
      );
  
      return endOfSelectedMonth > now
        ? now
        : endOfSelectedMonth;
    }, [selectedMonth]);
  
    useFocusEffect(
      useCallback(() => {
        let active = true;
  
        async function loadUniverse() {
          try {
            setIsLoading(true);
            setErrorMessage(null);
  
            const result =
              await activityService.getUniverseStats(
                untilDate,
              );
  
            if (!active) return;
  
            setStats(result);
          } catch (error) {
            if (!active) return;
  
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Unable to load your universe.",
            );
          } finally {
            if (active) {
              setIsLoading(false);
            }
          }
        }
  
        void loadUniverse();
  
        return () => {
          active = false;
        };
      }, [untilDate]),
    );
  
    const universe = useMemo(
      () =>
        stats
          ? calculateUniverseEvolution(stats)
          : null,
      [stats],
    );
  
    return {
      universe,
  
      selectedMonth,
      setSelectedMonth,
  
      isLoading,
      errorMessage,
    };
  }