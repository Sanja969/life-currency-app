import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import type { Activity } from "@/types/activity";

import { COLORS } from "@/theme/colors";
import { CLASSIFICATION_THEME } from "@/theme/classification";

import { ScreenHeader } from "@/components/layout/ScreenHeader";

import { ActivitiesBackground } from "./components/ActivitiesBackground";
import { ActivityTrace } from "./components/ActivityTrace";
import { EmptyField } from "./components/EmptyField";
import { ActivitiesHeader } from "./components/ActivitiesHeader";

import {
  ActivityViewSwitcher,
  type ActivityView,
} from "./components/ActivityViewSwitcher";

import { ActivityDateNavigator } from "./components/ActivityDateNavigator";
import { ActivityDayTimeline } from "./components/ActivityDayTimeline";

import { useActivities } from "./hooks/useActivities";
import { useCalendarActivities } from "./hooks/useCalendarActivities";
import { useActivityArrival } from "./hooks/useActivityArrival";

import { isSameDay } from "./utils/activityDate";

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 60,
};

const FLOATING_BUTTON_SIZE = 52;

export function Activities() {
  const [view, setView] = useState<ActivityView>("calendar");

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  /*
   * LIST DATA
   */

  const {
    activities,
    searchQuery,
    filter,
    errorMessage,
    isLoadingMore,
    hasMore,
    setSearchQuery,
    setFilter,
    loadMore,
    pendingArrival,
    completeArrival,
  } = useActivities();

  /*
   * CALENDAR DATA
   */

  const {
    activities: calendarActivities,
    isLoading: isCalendarLoading,
    error: calendarError,
    reload: reloadCalendar,
  } = useCalendarActivities(selectedDate);

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

  const isOpeningNewActivity = useRef(false);

  /*
   * SCREEN FOCUS
   */

  useFocusEffect(
    useCallback(() => {
      isOpeningNewActivity.current = false;
    }, []),
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
   * LIST ITEM
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
   * SHARED HEADER
   */

  const renderPageHeader = () => (
    <View style={styles.pageHeader}>
      <ScreenHeader
        eyebrow="YOUR LIFE JOURNAL"
        title="Your Life "
        highlightedTitle="Trace"
        subtitle="Every moment leaves a trace."
      />

      <ActivityViewSwitcher value={view} onChange={setView} />
    </View>
  );

  /*
   * CALENDAR VIEW
   */

  const renderCalendarView = () => (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.calendarContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {renderPageHeader()}

      <View style={styles.calendarSection}>
        <ActivityDateNavigator
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {isCalendarLoading ? (
          <ActivityIndicator style={styles.loading} color={COLORS.gold} />
        ) : calendarError ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={COLORS.danger}
            />

            <Text style={styles.errorText}>{calendarError}</Text>

            <Pressable
              onPress={() => {
                void reloadCalendar();
              }}
              accessibilityRole="button"
              accessibilityLabel="Retry loading calendar"
            >
              <Text style={styles.retryText}>RETRY</Text>
            </Pressable>
          </View>
        ) : (
          <ActivityDayTimeline
            selectedDate={selectedDate}
            activities={calendarActivities}
          />
        )}
      </View>
    </ScrollView>
  );

  /*
   * LIST VIEW
   */

  const renderListView = () => (
    <FlatList
      ref={listRef}
      style={styles.list}
      data={activities}
      ListHeaderComponent={
        <>
          {renderPageHeader()}

          <ActivitiesHeader
            searchQuery={searchQuery}
            filter={filter}
            errorMessage={errorMessage}
            setSearchQuery={setSearchQuery}
            setFilter={setFilter}
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
  );

  return (
    <View style={styles.screen}>
      <ActivitiesBackground />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {view === "calendar" ? renderCalendarView() : renderListView()}

        {/* FLOATING ADD BUTTON */}

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
              d="M 12 0 L 52 0 L 52 40 L 40 52 L 0 52 L 0 12 Z"
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

      {/* ARRIVAL PARTICLE */}

      {view === "list" && arrival && (
        <Animated.View
          pointerEvents="none"
          style={[styles.arrivalContainer, incomingParticleStyle]}
        >
          <View
            style={[
              styles.arrivalParticle,
              {
                backgroundColor:
                  CLASSIFICATION_THEME[arrival.classification].color,
                shadowColor: CLASSIFICATION_THEME[arrival.classification].color,
              },
            ]}
          >
            <View
              style={[
                styles.arrivalCore,
                {
                  backgroundColor:
                    CLASSIFICATION_THEME[arrival.classification].coreLight,
                },
              ]}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  list: {
    flex: 1,
  },

  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  calendarContent: {
    paddingBottom: 170,
  },

  calendarSection: {
    paddingHorizontal: 20,
  },

  loading: {
    marginTop: 35,
    marginBottom: 25,
  },

  errorContainer: {
    marginTop: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    backgroundColor: COLORS.dangerBackground,
    borderRadius: 12,
  },

  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 12,
    lineHeight: 18,
  },

  retryText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  listContent: {
    paddingBottom: 170,
  },

  activityContainer: {
    paddingHorizontal: 20,
  },

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
