import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

import { ActivityClassification } from "@/types/activity";

import { EnergyFilter } from "./EnergyFilter";

type ActivitiesHeaderProps = {
  growingPercent: number;
  leaksPercent: number;
  searchQuery: string;
  filter: "all" | ActivityClassification;
  errorMessage: string | null;
  setSearchQuery: (value: string) => void;
  setFilter: (value: "all" | ActivityClassification) => void;
};

export function ActivitiesHeader({
  growingPercent,
  leaksPercent,
  searchQuery,
  filter,
  errorMessage,
  setSearchQuery,
  setFilter,
}: ActivitiesHeaderProps) {
  return (
    <View className="px-5">
      <View className="pb-6 pt-2">
        <Text className="text-[34px] font-bold tracking-[-1.2px] text-white">
          Activities
        </Text>

        <Text className="mt-2 text-[15px] text-[#7483A3]">
          Track where your time becomes energy.
        </Text>
      </View>

      <View
        className="mb-4 overflow-hidden rounded-[22px] border border-[#334D9B]/70 bg-[#071020]"
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
        <View
          pointerEvents="none"
          className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#334BC0]"
          style={{
            opacity: 0.08,
          }}
        />

        <View className="px-5 pb-4 pt-4">
          <View className="flex-row items-center">
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

            <View className="mx-4 h-12 w-[1px] bg-[#33405D]" />

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

      <View
        className="mb-3 h-[52px] flex-row items-center rounded-[18px] border border-[#1A2846] bg-[#08101F] px-4"
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

      <View className="mb-4 flex-row rounded-[18px] border border-[#182744] bg-[#07101F] p-[4px]">
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
  );
}
