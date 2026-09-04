import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Activity, ActivityClassification } from "@/types/activity";

import { useActivities } from "./hooks/useActivities";
import { LinearGradient } from "expo-linear-gradient";

export function Activities() {
  const {
    activities,
    searchQuery,
    filter,
    isLoading,
    errorMessage,
    setSearchQuery,
    setFilter,
  } = useActivities();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#030611]">
        <ActivityIndicator size="large" color="#7188FF" />
      </View>
    );
  }

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

  return (
    <View className="flex-1 bg-[#030611]">
      <ActivitiesBackground />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <FlatList
          data={activities}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 120,
          }}
          ListHeaderComponent={
            <View>
              {/* ================================================= */}
              {/* HEADER                                            */}
              {/* ================================================= */}

              <View className="pb-5 pt-2">
                <Text className="text-[34px] font-bold tracking-[-1px] text-white">
                  Activities
                </Text>

                <Text className="mt-1.5 text-sm text-[#71809D]">
                  Track where your time becomes energy.
                </Text>
              </View>

              {/* ================================================= */}
              {/* FIELD SUMMARY                                     */}
              {/* ================================================= */}

              <View className="mx-4 mb-4 mt-1">
                {/* LABELS */}

                <View className="mb-1.5 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="mr-2 h-2 w-2 rounded-full bg-[#718BFF]"
                      style={{
                        shadowColor: "#718BFF",
                        shadowOpacity: 0.9,
                        shadowRadius: 6,
                        shadowOffset: {
                          width: 0,
                          height: 0,
                        },
                      }}
                    />

                    <Text className="text-[11px] font-semibold text-[#8EA0FF]">
                      Growing {growingPercent}%
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Text className="text-[11px] font-semibold text-[#E97DBE]">
                      {leaksPercent}% Leaks
                    </Text>

                    <View
                      className="ml-2 h-2 w-2 rounded-full bg-[#E657A8]"
                      style={{
                        shadowColor: "#E657A8",
                        shadowOpacity: 0.9,
                        shadowRadius: 6,
                        shadowOffset: {
                          width: 0,
                          height: 0,
                        },
                      }}
                    />
                  </View>
                </View>

                {/* ENERGY FIELD */}

                <View className="relative h-[6px] flex-row overflow-hidden rounded-full bg-[#10172B]">
                  <View
                    className="h-full bg-[#637BFF]"
                    style={{
                      width: `${growingPercent}%`,
                    }}
                  />

                  <View
                    className="h-full bg-[#D94C9D]"
                    style={{
                      width: `${leaksPercent}%`,
                    }}
                  />
                </View>
              </View>

              {/* ================================================= */}
              {/* SEARCH                                            */}
              {/* ================================================= */}

              <View className="mb-3 h-11 flex-row items-center rounded-[14px] bg-[#080D1B]/90 px-3.5">
                <Ionicons name="search-outline" size={17} color="#69758F" />

                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search traces"
                  placeholderTextColor="#4E5A72"
                  className="ml-2.5 flex-1 text-[13px] text-white"
                />

                {searchQuery.length > 0 ? (
                  <Pressable onPress={() => setSearchQuery("")} hitSlop={10}>
                    <Ionicons name="close-circle" size={17} color="#59657B" />
                  </Pressable>
                ) : null}
              </View>

              {/* ================================================= */}
              {/* FILTER                                            */}
              {/* ================================================= */}

              <View className="mb-5 flex-row items-center rounded-[13px] bg-[#070C19]/90 p-[3px]">
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
                <View className="mb-4 rounded-2xl border border-[#E657A8]/20 bg-[#7A1F55]/15 p-4">
                  <Text className="text-sm text-[#EFA3CF]">{errorMessage}</Text>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item, index }) => {
            const previousActivity =
              index > 0 ? activities[index - 1] : undefined;

            const showDate =
              !previousActivity ||
              !isSameDay(item.activityDate, previousActivity.activityDate);

            return <ActivityTrace activity={item} showDate={showDate} />;
          }}
          ListEmptyComponent={!errorMessage ? <EmptyField /> : null}
        />

        {/* ================================================= */}
        {/* CREATE PARTICLE                                   */}
        {/* ================================================= */}

        <Pressable
          onPress={() => router.push("/activities/new")}
          className="absolute bottom-6 right-5 h-[60px] w-[60px] items-center justify-center rounded-full border border-[#A7B3FF]/50 bg-[#586CED]"
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
    </View>
  );
}

/* ====================================================== */
/* ACTIVITY TRACE                                         */
/* ====================================================== */

function ActivityTrace({
  activity,
  showDate,
}: {
  activity: Activity;
  showDate: boolean;
}) {
  const serves = activity.classification === ActivityClassification.Serves;

  const palette = serves
    ? {
        core: "#718BFF",
        coreLight: "#D8DEFF",

        gradientStart: "rgba(37, 54, 135, 0.72)",
        gradientMiddle: "rgba(18, 30, 75, 0.72)",
        gradientEnd: "rgba(8, 15, 34, 0.92)",

        border: "rgba(91, 117, 255, 0.78)",

        glow: "#627AFF",

        ringStrong: "rgba(115, 139, 255, 0.55)",
        ringSoft: "rgba(115, 139, 255, 0.22)",

        label: "#7890FF",

        fieldLine: "rgba(103, 126, 255, 0.32)",
      }
    : {
        core: "#E657A8",
        coreLight: "#FFD0EB",

        gradientStart: "rgba(112, 25, 78, 0.72)",
        gradientMiddle: "rgba(68, 19, 57, 0.68)",
        gradientEnd: "rgba(13, 11, 29, 0.94)",

        border: "rgba(230, 70, 164, 0.72)",

        glow: "#E447A5",

        ringStrong: "rgba(235, 87, 177, 0.52)",
        ringSoft: "rgba(235, 87, 177, 0.20)",

        label: "#F06BB9",

        fieldLine: "rgba(230, 79, 170, 0.30)",
      };

  const date = normalizeDate(activity.activityDate);

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View>
      {/* DATE */}

      {showDate ? (
        <View className="mb-2.5 mt-4 flex-row items-center">
          <Text className="text-[11px] font-bold uppercase tracking-[1.6px] text-[#7A87A3]">
            {formatDateHeading(date)}
          </Text>

          <View className="ml-4 h-[1px] flex-1 bg-[#303A55]/70" />
        </View>
      ) : null}

      {/* CARD */}

      <Pressable
        onPress={() => router.push(`/activities/${activity.id}`)}
        className="mb-2.5 overflow-hidden rounded-[20px]"
        style={({ pressed }) => ({
          transform: [
            {
              scale: pressed ? 0.985 : 1,
            },
          ],

          shadowColor: palette.glow,
          shadowOpacity: pressed ? 0.42 : 0.22,
          shadowRadius: pressed ? 22 : 16,
          shadowOffset: {
            width: 0,
            height: 7,
          },

          elevation: 8,
        })}
      >
        <LinearGradient
          colors={[
            palette.gradientStart,
            palette.gradientMiddle,
            palette.gradientEnd,
          ]}
          start={{
            x: 0,
            y: 0.5,
          }}
          end={{
            x: 1,
            y: 0.5,
          }}
          style={{
            minHeight: 104,

            borderRadius: 20,

            borderWidth: 1.1,
            borderColor: palette.border,

            overflow: "hidden",
          }}
        >
          {/* ====================================== */}
          {/* LEFT ENERGY GLOW                       */}
          {/* ====================================== */}

          <View
            pointerEvents="none"
            className="absolute -left-14 -top-16 h-[190px] w-[190px] rounded-full"
            style={{
              backgroundColor: palette.glow,
              opacity: 0.08,
            }}
          />

          {/* ====================================== */}
          {/* LARGE SUBTLE FIELD ARC                 */}
          {/* ====================================== */}

          <View
            pointerEvents="none"
            className="absolute -bottom-[115px] left-[120px] h-[210px] w-[330px] rounded-[180px] border"
            style={{
              borderColor: palette.fieldLine,
              transform: [
                {
                  rotate: "-8deg",
                },
              ],
            }}
          />

          <View
            pointerEvents="none"
            className="absolute -bottom-[138px] left-[135px] h-[220px] w-[360px] rounded-[190px] border"
            style={{
              borderColor: serves
                ? "rgba(103,126,255,0.13)"
                : "rgba(230,79,170,0.13)",

              transform: [
                {
                  rotate: "-8deg",
                },
              ],
            }}
          />

          {/* tiny field particle */}

          <View
            pointerEvents="none"
            className="absolute bottom-[28px] right-[95px] h-[4px] w-[4px] rounded-full"
            style={{
              backgroundColor: palette.core,

              shadowColor: palette.core,
              shadowOpacity: 1,
              shadowRadius: 7,
              shadowOffset: {
                width: 0,
                height: 0,
              },
            }}
          />

          {/* another tiny particle */}

          <View
            pointerEvents="none"
            className="absolute right-[165px] top-[27px] h-[2px] w-[2px] rounded-full"
            style={{
              backgroundColor: palette.coreLight,
              opacity: 0.55,
            }}
          />

          {/* ====================================== */}
          {/* CONTENT                                */}
          {/* ====================================== */}

          <View className="min-h-[104px] flex-row items-center px-4">
            {/* PARTICLE */}

            <View className="mr-3">
              <ActivityParticle
                color={palette.core}
                coreLight={palette.coreLight}
                ringStrong={palette.ringStrong}
                ringSoft={palette.ringSoft}
              />
            </View>

            {/* INFO */}

            <View className="flex-1 pr-3">
              <Text
                numberOfLines={1}
                className="text-[16px] font-semibold text-white"
              >
                {activity.title}
              </Text>

              <View className="mt-2 flex-row items-center">
                <Text
                  className="text-[11px] font-bold tracking-[0.5px]"
                  style={{
                    color: palette.label,
                  }}
                >
                  {serves ? "GROWING" : "LIFE LEAK"}
                </Text>

                <View className="mx-2 h-[3px] w-[3px] rounded-full bg-[#7A8399]" />

                <Text className="text-[12px] text-[#9AA5BC]">
                  {activity.durationMinutes} min
                </Text>
              </View>
            </View>

            {/* TIME */}

            <View className="flex-row items-center">
              <Text className="mr-3 text-[14px] font-semibold text-[#D2D8E8]">
                {time}
              </Text>

              <Ionicons name="chevron-forward" size={18} color="#8A96B1" />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function ActivityParticle({
  color,
  coreLight,
  ringStrong,
  ringSoft,
}: {
  color: string;
  coreLight: string;
  ringStrong: string;
  ringSoft: string;
}) {
  return (
    <View className="h-16 w-16 items-center justify-center">
      {/* outer glow */}

      <View
        className="absolute h-16 w-16 rounded-full"
        style={{
          backgroundColor: color,
          opacity: 0.07,

          shadowColor: color,
          shadowOpacity: 0.65,
          shadowRadius: 24,
          shadowOffset: {
            width: 0,
            height: 0,
          },
        }}
      />

      {/* outer orbit */}

      <View
        className="absolute h-[54px] w-[54px] rounded-full border"
        style={{
          borderColor: ringSoft,
        }}
      />

      {/* orbit particle */}

      <View
        className="absolute right-[4px] top-[21px] h-[4px] w-[4px] rounded-full"
        style={{
          backgroundColor: color,

          shadowColor: color,
          shadowOpacity: 1,
          shadowRadius: 7,
          shadowOffset: {
            width: 0,
            height: 0,
          },
        }}
      />

      {/* middle orbit */}

      <View
        className="absolute h-[42px] w-[42px] rounded-full border"
        style={{
          borderColor: ringStrong,
        }}
      />

      {/* middle glow */}

      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{
          backgroundColor: color,
          opacity: 0.22,
        }}
      >
        {/* luminous core */}

        <View
          className="h-5 w-5 items-center justify-center rounded-full"
          style={{
            backgroundColor: color,

            shadowColor: color,
            shadowOpacity: 1,
            shadowRadius: 14,
            shadowOffset: {
              width: 0,
              height: 0,
            },
          }}
        >
          {/* white center */}

          <View className="h-2 w-2 rounded-full" />
        </View>
      </View>
    </View>
  );
}

/* ====================================================== */
/* EMPTY FIELD                                            */
/* ====================================================== */

function EmptyField() {
  return (
    <View className="items-center pt-20">
      <View className="h-20 w-20 items-center justify-center rounded-full border border-[#7188FF]/15 bg-[#7188FF]/5">
        <View
          className="h-2.5 w-2.5 rounded-full bg-[#7188FF]"
          style={{
            shadowColor: "#7188FF",
            shadowOpacity: 1,
            shadowRadius: 18,
            shadowOffset: {
              width: 0,
              height: 0,
            },
          }}
        />
      </View>

      <Text className="mt-5 text-base font-semibold text-[#DDE2EF]">
        Your field is quiet
      </Text>

      <Text className="mt-1.5 text-[13px] text-[#5E6982]">
        Create a moment to leave your first trace.
      </Text>
    </View>
  );
}

/* ====================================================== */
/* BACKGROUND                                             */
/* ====================================================== */

function ActivitiesBackground() {
  return (
    <View className="absolute inset-0 bg-[#02040D]">
      <View className="absolute -right-36 -top-36 h-80 w-80 rounded-full bg-[#3042A8]/[0.04]" />

      <View className="absolute -bottom-44 -left-32 h-96 w-96 rounded-full bg-[#8D286F]/[0.035]" />
    </View>
  );
}

/* ====================================================== */
/* DATE HELPERS                                           */
/* ====================================================== */

function normalizeDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function isSameDay(first: Date | string, second: Date | string) {
  const a = normalizeDate(first);
  const b = normalizeDate(second);

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateHeading(date: Date) {
  const today = new Date();

  if (isSameDay(date, today)) {
    return "Today";
  }

  const yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function EnergyFilter({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  const activeColor = color ?? "#8B9BFF";

  return (
    <Pressable
      onPress={onPress}
      className={`h-[34px] flex-1 flex-row items-center justify-center rounded-[10px] ${
        selected ? "bg-[#11182D]" : "bg-transparent"
      }`}
      style={
        selected
          ? {
              shadowColor: activeColor,
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: {
                width: 0,
                height: 0,
              },
            }
          : undefined
      }
    >
      {color ? (
        <View
          className="mr-1.5 h-[5px] w-[5px] rounded-full"
          style={{
            backgroundColor: selected ? activeColor : "#455168",

            shadowColor: activeColor,
            shadowOpacity: selected ? 0.8 : 0,
            shadowRadius: 4,
            shadowOffset: {
              width: 0,
              height: 0,
            },
          }}
        />
      ) : null}

      <Text
        className="text-[11px] font-semibold"
        style={{
          color: selected ? (color ?? "#D3D9FF") : "#59657D",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
