import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  ActivityArrival,
  consumePendingActivityArrival,
} from "@/lib/activityArrival";
import { Activity } from "@/types/activity";

type ScrollPhase = "idle" | "approximating" | "target";

type ViewableItem = {
  index: number | null;
};

export function useActivityArrival(activities: Activity[]) {
  const [arrival, setArrival] = useState<ActivityArrival | null>(null);

  const [arrivalActivityDate, setArrivalActivityDate] = useState<string | null>(
    null,
  );

  const listRef = useRef<FlatList<Activity>>(null);

  const hasStartedArrival = useRef(false);
  const hasPlayedArrivalAnimation = useRef(false);

  const pendingScrollIndex = useRef<number | null>(null);

  const scrollPhase = useRef<ScrollPhase>("idle");

  const incomingProgress = useSharedValue(0);

  /*
   * Incoming particle animation.
   */

  const incomingParticleStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      incomingProgress.value,
      [0, 0.75, 1],
      [-90, 280, 330],
    );

    const scale = interpolate(
      incomingProgress.value,
      [0, 0.7, 1],
      [0.25, 1, 0.2],
    );

    const opacity = interpolate(
      incomingProgress.value,
      [0, 0.1, 0.8, 1],
      [0, 1, 1, 0],
    );

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  /*
   * Consume an activity that has just been created
   * when the Activities screen becomes focused again.
   */

  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingActivityArrival();

      if (!pending) {
        return;
      }

      hasStartedArrival.current = false;
      hasPlayedArrivalAnimation.current = false;

      setArrival(pending);
      setArrivalActivityDate(pending.activityDate);
    }, []),
  );

  /*
   * Wait until the refreshed activities contain the
   * newly created activity, then navigate to its index.
   */

  useEffect(() => {
    if (!arrival) {
      return;
    }

    const arrivalIndex = activities.findIndex(
      (activity) =>
        activity.activityDate.toISOString() === arrival.activityDate,
    );

    if (arrivalIndex === -1) {
      return;
    }

    if (hasStartedArrival.current) {
      return;
    }

    hasStartedArrival.current = true;

    pendingScrollIndex.current = arrivalIndex;
    scrollPhase.current = "target";

    incomingProgress.value = 0;

    listRef.current?.scrollToIndex({
      index: arrivalIndex,
      animated: true,
      viewPosition: 0.35,
    });
  }, [arrival, activities]);

  /*
   * Arrival animation starts only after the target
   * activity has actually entered the viewport.
   */

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewableItem[] }) => {
      const targetIndex = pendingScrollIndex.current;

      if (targetIndex === null) {
        return;
      }

      if (hasPlayedArrivalAnimation.current) {
        return;
      }

      const targetIsVisible = viewableItems.some(
        (item) => item.index === targetIndex,
      );

      if (!targetIsVisible) {
        return;
      }

      hasPlayedArrivalAnimation.current = true;

      incomingProgress.value = 0;

      incomingProgress.value = withTiming(1, {
        duration: 900,
        easing: Easing.inOut(Easing.cubic),
      });

      setTimeout(() => {
        setArrival(null);
        setArrivalActivityDate(null);

        pendingScrollIndex.current = null;

        hasStartedArrival.current = false;
        hasPlayedArrivalAnimation.current = false;

        scrollPhase.current = "idle";
      }, 1100);
    },
  ).current;

  /*
   * FlatList cannot scrollToIndex when the target row
   * has not been measured yet.
   *
   * First move approximately towards it.
   */

  function handleScrollToIndexFailed(info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) {
    const targetIndex = pendingScrollIndex.current;

    if (targetIndex === null) {
      return;
    }

    scrollPhase.current = "approximating";

    listRef.current?.scrollToOffset({
      offset: info.averageItemLength * targetIndex,
      animated: true,
    });
  }

  /*
   * Once the approximate scroll finishes, FlatList
   * should have measured the target row.
   */

  function handleMomentumScrollEnd() {
    const targetIndex = pendingScrollIndex.current;

    if (
      targetIndex === null ||
      scrollPhase.current !== "approximating"
    ) {
      return;
    }

    scrollPhase.current = "target";

    listRef.current?.scrollToIndex({
      index: targetIndex,
      animated: true,
      viewPosition: 0.35,
    });
  }

  function isArrivingActivity(activity: Activity): boolean {
    if (!arrivalActivityDate) {
      return false;
    }

    return activity.activityDate.toISOString() === arrivalActivityDate;
  }

  return {
    arrival,
    listRef,
    incomingParticleStyle,
    onViewableItemsChanged,
    handleScrollToIndexFailed,
    handleMomentumScrollEnd,
    isArrivingActivity,
  };
}