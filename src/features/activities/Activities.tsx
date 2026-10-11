import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef } from "react";

import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { Activity } from "@/types/activity";

import { COLORS } from "@/theme/colors";
import { CLASSIFICATION_THEME } from "@/theme/classification";

import { ActivitiesBackground } from "./components/ActivitiesBackground";
import { ActivityTrace } from "./components/ActivityTrace";
import { EmptyField } from "./components/EmptyField";
import { ActivitiesHeader } from "./components/ActivitiesHeader";

import { QuickAddSection } from "./components/QuickAddSection";
import { QuickAddModal } from "./components/QuickAddModal";

import { useActivities } from "./hooks/useActivities";
import { useActivityArrival } from "./hooks/useActivityArrival";
import { useQuickAdd } from "./hooks/useQuickAdd";

import { isSameDay } from "./utils/activityDate";

/*
 * CONSTANTS
 */

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 60,
};

const FLOATING_BUTTON_SIZE = 52;

/*
 * HELPERS
 */

function calculatePercentage(minutes: number, totalMinutes: number): number {
  if (totalMinutes <= 0) {
    return 0;
  }

  return Math.round((minutes / totalMinutes) * 100);
}

/*
 * ACTIVITIES SCREEN
 */

export function Activities() {
  /*
   * ACTIVITIES DATA
   */

  const {
    activities,
    counts,
    searchQuery,
    filter,
    errorMessage,
    isLoadingMore,
    hasMore,
    setSearchQuery,
    setFilter,
    reload,
    loadMore,
    pendingArrival,
    completeArrival,
  } = useActivities();

  /*
   * QUICK ADD
   */

  const {
    suggestions,
    selectedSuggestion,
    isSaving,
    errorMessage: quickAddError,
    loadSuggestions,
    openSuggestion,
    closeSuggestion,
    addActivity,
  } = useQuickAdd();

  /*
   * ARRIVAL ANIMATION
   */

  const {
    arrival,
    listRef,
    incomingParticleStyle,
    onViewableItemsChanged,
    handleScrollToIndexFailed,
    handleMomentumScrollEnd,
    isArrivingActivity,
  } = useActivityArrival(activities, pendingArrival, completeArrival);

  /*
   * NAVIGATION GUARD
   */

  const isOpeningNewActivity = useRef(false);

  /*
   * CLASSIFICATION STATISTICS
   */

  const { growingPercent, restoringPercent, leaksPercent } = useMemo(() => {
    const growingMinutes = counts.growingMinutes ?? 0;
    const restoringMinutes = counts.restoringMinutes ?? 0;
    const leaksMinutes = counts.leaksMinutes ?? 0;

    const totalMinutes = growingMinutes + restoringMinutes + leaksMinutes;

    if (totalMinutes <= 0) {
      return {
        growingPercent: 0,
        restoringPercent: 0,
        leaksPercent: 0,
      };
    }

    const growingPercent = calculatePercentage(growingMinutes, totalMinutes);

    const restoringPercent = calculatePercentage(
      restoringMinutes,
      totalMinutes,
    );

    const leaksPercent = 100 - growingPercent - restoringPercent;

    return {
      growingPercent,
      restoringPercent,
      leaksPercent,
    };
  }, [counts.growingMinutes, counts.restoringMinutes, counts.leaksMinutes]);

  /*
   * ARRIVAL PARTICLE THEME
   */

  const arrivalTheme = arrival
    ? CLASSIFICATION_THEME[arrival.classification]
    : null;

  /*
   * RENDER ACTIVITY
   */

  const renderActivity = useCallback(
    ({ item, index }: { item: Activity; index: number }) => {
      const previousActivity = index > 0 ? activities[index - 1] : undefined;

      const showDate =
        !previousActivity ||
        !isSameDay(item.activityDate, previousActivity.activityDate);

      return (
        <View style={styles.activityContainer}>
          <ActivityTrace
            activity={item}
            showDate={showDate}
            isArriving={isArrivingActivity(item)}
          />
        </View>
      );
    },
    [activities, isArrivingActivity],
  );

  /*
   * SCREEN FOCUS
   */

  useFocusEffect(
    useCallback(() => {
      isOpeningNewActivity.current = false;

      void loadSuggestions();
    }, [loadSuggestions]),
  );

  /*
   * OPEN NEW ACTIVITY
   */

  function openNewActivity() {
    if (isOpeningNewActivity.current) {
      return;
    }

    isOpeningNewActivity.current = true;

    router.push({
      pathname: "/activities/new",
      params: {
        source: "activities",
      },
    });
  }

  /*
   * QUICK ADD CONFIRMATION
   */

  async function handleQuickAdd(durationMinutes: number, activityDate: Date) {
    const created = await addActivity(durationMinutes, activityDate);

    if (!created) {
      return;
    }

    /*
     * Refresh suggestions because
     * the newly added activity may
     * change their frequency.
     */

    void loadSuggestions();

    /*
     * Refresh timeline and global
     * statistics without navigation.
     *
     * Pass the new activity as an
     * arrival so its particle animation
     * can play on the current screen.
     */

    await reload({
      activityDate: created.activityDate.toISOString(),
      classification: created.classification,
    });
  }

  /*
   * RENDER
   */

  return (
    <View style={styles.screen}>
      {/* COSMIC BACKGROUND */}

      <ActivitiesBackground />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* ACTIVITY TIMELINE */}

        <FlatList
          ref={listRef}
          style={styles.list}
          data={activities}
          ListHeaderComponent={
            <>
              <ActivitiesHeader
                growingPercent={growingPercent}
                restoringPercent={restoringPercent}
                leaksPercent={leaksPercent}
                searchQuery={searchQuery}
                filter={filter}
                errorMessage={errorMessage}
                setSearchQuery={setSearchQuery}
                setFilter={setFilter}
              />

              <QuickAddSection
                suggestions={suggestions}
                onSelect={openSuggestion}
              />
            </>
          }
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          contentContainerStyle={styles.listContent}
          renderItem={renderActivity}
          ListEmptyComponent={
            !errorMessage ? (
              <EmptyField
                isFiltered={filter !== "all" || searchQuery.trim().length > 0}
              />
            ) : null
          }
          onEndReached={() => {
            if (hasMore && !isLoadingMore) {
              void loadMore();
            }
          }}
          onEndReachedThreshold={0.5}
        />

        {/* FLOATING CREATE BUTTON */}

        <Pressable
          onPress={openNewActivity}
          accessibilityRole="button"
          accessibilityLabel="Add activity"
          style={({ pressed }) => [
            styles.floatingButton,
            {
              transform: [
                {
                  scale: pressed ? 0.94 : 1,
                },
              ],
              shadowOpacity: pressed ? 0.4 : 0.2,
              shadowRadius: pressed ? 16 : 10,
            },
          ]}
        >
          <Svg
            width={FLOATING_BUTTON_SIZE}
            height={FLOATING_BUTTON_SIZE}
            viewBox="0 0 52 52"
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            <Path
              d="
                M 12 0
                L 52 0
                L 52 40
                L 40 52
                L 0 52
                L 0 12
                Z
              "
              fill={COLORS.gold}
              stroke={COLORS.lightGold}
              strokeWidth={1}
            />

            <Path
              d="M 12 0 L 31 0"
              stroke={COLORS.lightGold}
              strokeWidth={1.5}
            />
          </Svg>

          <Ionicons name="add" size={27} color={COLORS.background} />
        </Pressable>
      </SafeAreaView>

      {/* QUICK ADD MODAL */}

      <QuickAddModal
        visible={selectedSuggestion !== null}
        suggestion={selectedSuggestion}
        isSaving={isSaving}
        errorMessage={quickAddError}
        onClose={closeSuggestion}
        onConfirm={(durationMinutes, activityDate) => {
          void handleQuickAdd(durationMinutes, activityDate);
        }}
      />

      {/* INCOMING ACTIVITY PARTICLE */}

      {arrival && arrivalTheme && (
        <Animated.View
          pointerEvents="none"
          style={[styles.arrivalContainer, incomingParticleStyle]}
        >
          <View
            style={[
              styles.arrivalParticle,
              {
                backgroundColor: arrivalTheme.color,
                shadowColor: arrivalTheme.color,
              },
            ]}
          >
            <View
              style={[
                styles.arrivalCore,
                {
                  backgroundColor: arrivalTheme.coreLight,
                },
              ]}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

/*
 * STYLES
 */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 170,
  },

  activityContainer: {
    paddingHorizontal: 20,
  },

  /*
   * FLOATING CREATE BUTTON
   */

  floatingButton: {
    position: "absolute",
    bottom: 92,
    right: 20,
    width: FLOATING_BUTTON_SIZE,
    height: FLOATING_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.gold,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 8,
    zIndex: 10,
  },

  /*
   * ARRIVAL ANIMATION
   */

  arrivalContainer: {
    position: "absolute",
    top: 80,
    left: "50%",
    width: 34,
    height: 34,
    marginLeft: -17,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },

  arrivalParticle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",

    shadowOpacity: 1,
    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  arrivalCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
