import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
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
import { Activity, ActivityClassification } from "@/types/activity";

import { ActivitiesBackground } from "./components/ActivitiesBackground";
import { ActivityTrace } from "./components/ActivityTrace";
import { EmptyField } from "./components/EmptyField";
import { EnergyFilter } from "./components/EnergyFilter";
import { useActivities } from "./hooks/useActivities";
import { isSameDay } from "./utils/activityDate";

export function Activities() {
  const {
    activities,
    searchQuery,
    filter,
    errorMessage,
    setSearchQuery,
    setFilter,
  } = useActivities();

  const [arrival, setArrival] = useState<ActivityArrival | null>(null);
  const [arrivalActivityDate, setArrivalActivityDate] = useState<string | null>(
    null,
  );

  const incomingProgress = useSharedValue(0);

  const listRef = useRef<FlatList<Activity>>(null);

  const hasStartedArrival = useRef(false);
  const hasPlayedArrivalAnimation = useRef(false);

  const pendingScrollIndex = useRef<number | null>(null);

  const scrollPhase = useRef<"idle" | "approximating" | "target">("idle");

  const growingCount = activities.filter(
    (activity) => activity.classification === ActivityClassification.Serves,
  ).length;

  const leaksCount = activities.filter(
    (activity) =>
      activity.classification === ActivityClassification.DoesNotServe,
  ).length;

  const totalCount = growingCount + leaksCount;

  const growingPercent =
    totalCount > 0 ? Math.round((growingCount / totalCount) * 100) : 0;

  const leaksPercent = totalCount > 0 ? 100 - growingPercent : 0;

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

  function isArrivingActivity(activity: Activity): boolean {
    if (!arrivalActivityDate) {
      return false;
    }

    return activity.activityDate.toISOString() === arrivalActivityDate;
  }

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

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
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

        <View className="px-5">
          {/* TITLE */}

          <View className="pb-4 pt-1">
            <Text className="text-[32px] font-bold tracking-[-1.2px] text-white">
              Activities
            </Text>

            <Text className="mt-1.5 text-[14px] text-[#7483A3]">
              Track where your time becomes energy.
            </Text>
          </View>

          {/* ENERGY SUMMARY CARD */}
          <View
            className="mb-3 overflow-hidden rounded-[22px] border border-[#334D9B]/70 bg-[#071020]"
            style={{
              shadowColor: "#536DFF",
              shadowOpacity: 0.12,
              shadowRadius: 22,
              shadowOffset: {
                width: 0,
                height: 10,
              },
            }}
          >
            {/* subtle background glow */}

            <View
              pointerEvents="none"
              className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#334BC0]"
              style={{
                opacity: 0.08,
              }}
            />

            <View className="px-5 pb-3.5 pt-3.5">
              {/* NUMBERS */}

              <View className="flex-row items-center">
                {/* GROWING */}

                <View className="flex-1 flex-row items-center">
                  <View
                    className="mr-3 h-3 w-3 rounded-full bg-[#6C83FF]"
                    style={{
                      shadowColor: "#6C83FF",
                      shadowOpacity: 1,
                      shadowRadius: 10,
                      shadowOffset: {
                        width: 0,
                        height: 0,
                      },
                    }}
                  />

                  <View>
                    <Text className="text-[13px] font-semibold text-[#8295FF]">
                      Growing
                    </Text>

                    <Text className="mt-[-2px] text-[28px] font-bold tracking-[-0.8px] text-[#718BFF]">
                      {growingPercent}%
                    </Text>
                  </View>
                </View>

                {/* DIVIDER */}

                <View className="mx-4 h-12 w-[1px] bg-[#33405D]" />

                {/* LEAKS */}

                <View className="flex-1 flex-row items-center justify-end">
                  <View
                    className="mr-3 h-3 w-3 rounded-full bg-[#EB56AE]"
                    style={{
                      shadowColor: "#EB56AE",
                      shadowOpacity: 1,
                      shadowRadius: 10,
                      shadowOffset: {
                        width: 0,
                        height: 0,
                      },
                    }}
                  />

                  <View>
                    <Text className="text-[13px] font-semibold text-[#EE6DB8]">
                      Leaks
                    </Text>

                    <Text className="mt-[-2px] text-[28px] font-bold tracking-[-0.8px] text-[#ED5DB1]">
                      {leaksPercent}%
                    </Text>
                  </View>
                </View>
              </View>

              {/* ENERGY BAR */}

              <View className="mt-4 h-[7px] flex-row overflow-hidden rounded-full bg-[#10182A]">
                <View
                  className="h-full bg-[#637BFF]"
                  style={{
                    width: `${growingPercent}%`,
                    shadowColor: "#637BFF",
                    shadowOpacity: 0.8,
                    shadowRadius: 7,
                  }}
                />

                <View
                  className="h-full bg-[#E44DA7]"
                  style={{
                    width: `${leaksPercent}%`,
                    shadowColor: "#E44DA7",
                    shadowOpacity: 0.8,
                    shadowRadius: 7,
                  }}
                />
              </View>
            </View>
          </View>

          {/* SEARCH */}

          <View
            className="mb-2.5 h-[48px] flex-row items-center rounded-[16px] border border-[#1A2846] bg-[#08101F] px-4"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 12,
              shadowOffset: {
                width: 0,
                height: 6,
              },
            }}
          >
            <Ionicons name="search-outline" size={21} color="#8293BC" />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search traces"
              placeholderTextColor="#63708E"
              className="ml-3 flex-1 text-[15px] text-white"
            />

            {searchQuery.length > 0 ? (
              <Pressable onPress={() => setSearchQuery("")} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color="#65718C" />
              </Pressable>
            ) : null}
          </View>

          {/* FILTER */}

          <View className="mb-3 flex-row rounded-[16px] border border-[#182744] bg-[#07101F] p-[4px]">
            <EnergyFilter
              label="All"
              selected={filter === "all"}
              onPress={() => setFilter("all")}
            />

            <EnergyFilter
              label="Growing"
              color="#718BFF"
              selected={filter === ActivityClassification.Serves}
              onPress={() => setFilter(ActivityClassification.Serves)}
            />

            <EnergyFilter
              label="Leaks"
              color="#E657A8"
              selected={filter === ActivityClassification.DoesNotServe}
              onPress={() => setFilter(ActivityClassification.DoesNotServe)}
            />
          </View>

          {errorMessage ? (
            <View className="mb-3 rounded-2xl border border-[#E657A8]/20 bg-[#7A1F55]/15 p-4">
              <Text className="text-sm text-[#EFA3CF]">{errorMessage}</Text>
            </View>
          ) : null}
        </View>

        {/* SCROLLABLE TIMELINE */}

        <FlatList
          ref={listRef}
          style={{ flex: 1 }}
          data={activities}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 60,
          }}
          onScrollToIndexFailed={(info) => {
            const targetIndex = pendingScrollIndex.current;

            if (targetIndex === null) {
              return;
            }

            scrollPhase.current = "approximating";

            listRef.current?.scrollToOffset({
              offset: info.averageItemLength * targetIndex,
              animated: true,
            });
          }}
          onMomentumScrollEnd={() => {
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
          }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 170,
          }}
          renderItem={({ item, index }) => {
            const previousActivity =
              index > 0 ? activities[index - 1] : undefined;

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
          }}
          ListEmptyComponent={!errorMessage ? <EmptyField /> : null}
        />

        {/* CREATE BUTTON */}

        <Pressable
          onPress={() => router.push("/activities/new")}
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
