import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useActivityArrival } from "./hooks/useActivityArrival";
import Animated from "react-native-reanimated";

import { Activity, ActivityClassification } from "@/types/activity";

import { ActivitiesBackground } from "./components/ActivitiesBackground";
import { ActivityTrace } from "./components/ActivityTrace";
import { EmptyField } from "./components/EmptyField";
import { useActivities } from "./hooks/useActivities";
import { isSameDay } from "./utils/activityDate";
import { ActivitiesHeader } from "./components/ActivitiesHeader";

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 60,
};

export function Activities() {
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
    loadMore,
    pendingArrival,
    completeArrival,
  } = useActivities();

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

  const { growingCount, leaksCount } = counts;

  const totalCount = growingCount + leaksCount;

  const growingPercent =
    totalCount > 0 ? Math.round((growingCount / totalCount) * 100) : 0;

  const leaksPercent = totalCount > 0 ? 100 - growingPercent : 0;

  const renderActivity = useCallback(
    ({ item, index }: { item: Activity; index: number }) => {
      const previousActivity = index > 0 ? activities[index - 1] : undefined;

      const showDate =
        !previousActivity ||
        !isSameDay(item.activityDate, previousActivity.activityDate);

      return (
        <ActivityTrace
          activity={item}
          showDate={showDate}
          isArriving={isArrivingActivity(item)}
        />
      );
    },
    [activities, isArrivingActivity],
  );

  useFocusEffect(
    useCallback(() => {
      isOpeningNewActivity.current = false;
    }, []),
  );

  return (
    <View className="flex-1 bg-[#030611]">
      <ActivitiesBackground />

      {/*
        Keep style={{ flex: 1 }} here.
        SafeAreaView is from react-native-safe-area-context and
        NativeWind v5 className did not apply flex correctly to it.
      */}
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* FIXED HEADER */}

        <ActivitiesHeader
          growingPercent={growingPercent}
          leaksPercent={leaksPercent}
          searchQuery={searchQuery}
          filter={filter}
          errorMessage={errorMessage}
          setSearchQuery={setSearchQuery}
          setFilter={setFilter}
        />

        {/* SCROLLABLE TIMELINE */}

        <FlatList
          ref={listRef}
          style={{ flex: 1 }}
          data={activities}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 170,
          }}
          renderItem={renderActivity}
          ListEmptyComponent={!errorMessage ? <EmptyField /> : null}
          onEndReached={() => {
            if (hasMore && !isLoadingMore) {
              void loadMore();
            }
          }}
          onEndReachedThreshold={0.5}
        />

        {/* CREATE BUTTON */}

        <Pressable
          onPress={() => {
            if (isOpeningNewActivity.current) {
              return;
            }

            isOpeningNewActivity.current = true;

            router.push({
              pathname: "/activities/new",
              params: { source: "activities" },
            });
          }}
          className="absolute bottom-[92px] right-5 h-[60px] w-[60px] items-center justify-center rounded-full border border-[#A7B3FF]/50 bg-[#586CED]"
          style={({ pressed }) => ({
            shadowColor: "#657BFF",
            shadowOpacity: 0.55,
            shadowRadius: 20,
            shadowOffset: {
              width: 0,
              height: 8,
            },
            elevation: 12,
            transform: [
              {
                scale: pressed ? 0.93 : 1,
              },
            ],
          })}
        >
          <Ionicons name="add" size={29} color="#FFFFFF" />
        </Pressable>
      </SafeAreaView>

      {/* INCOMING PARTICLE */}

      {arrival ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
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
            incomingParticleStyle,
          ]}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              alignItems: "center",
              justifyContent: "center",

              backgroundColor:
                arrival.classification === ActivityClassification.Serves
                  ? "#718BFF"
                  : "#E85BAA",

              shadowColor:
                arrival.classification === ActivityClassification.Serves
                  ? "#718BFF"
                  : "#E85BAA",

              shadowOpacity: 1,
              shadowRadius: 18,
              shadowOffset: {
                width: 0,
                height: 0,
              },
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,

                backgroundColor:
                  arrival.classification === ActivityClassification.Serves
                    ? "#E8F3FF"
                    : "#FFE8F7",
              }}
            />
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
