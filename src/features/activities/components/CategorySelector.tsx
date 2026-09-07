import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { ActivityCategory } from "@/types/activity";

type CategoryOption = {
  value: ActivityCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: ActivityCategory.Work,
    label: "Work",
    icon: "briefcase-outline",
  },
  {
    value: ActivityCategory.Learning,
    label: "Learning",
    icon: "book-outline",
  },
  {
    value: ActivityCategory.Health,
    label: "Health",
    icon: "fitness-outline",
  },
  {
    value: ActivityCategory.Relationships,
    label: "Relationships",
    icon: "people-outline",
  },
  {
    value: ActivityCategory.Rest,
    label: "Rest",
    icon: "moon-outline",
  },
  {
    value: ActivityCategory.Entertainment,
    label: "Entertainment",
    icon: "game-controller-outline",
  },
  {
    value: ActivityCategory.Mindfulness,
    label: "Mindfulness",
    icon: "leaf-outline",
  },
  {
    value: ActivityCategory.Other,
    label: "Other",
    icon: "ellipsis-horizontal-outline",
  },
];

type CategorySelectorProps = {
  value: ActivityCategory;
  onChange: (category: ActivityCategory) => void;
};

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <View>
      <View className="mb-3 flex-row items-end justify-between">
        <View>
          <Text className="text-[11px] font-bold tracking-[1.3px] text-[#65728D]">
            LIFE AREA
          </Text>

          <Text className="mt-1 text-[12px] text-[#56637D]">
            Where did this time go?
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap justify-between">
        {CATEGORY_OPTIONS.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              className="mb-3 w-[48.5%] overflow-hidden rounded-[18px] border px-4 py-4"
              style={({ pressed }) => ({
                borderColor: selected
                  ? "rgba(113,139,255,0.75)"
                  : "rgba(31,46,75,0.9)",

                backgroundColor: selected
                  ? "rgba(57,75,163,0.22)"
                  : "rgba(7,16,31,0.9)",

                opacity: pressed ? 0.75 : 1,

                transform: [
                  {
                    scale: pressed ? 0.98 : 1,
                  },
                ],

                shadowColor: "#718BFF",
                shadowOpacity: selected ? 0.18 : 0,
                shadowRadius: selected ? 12 : 0,
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
              })}
            >
              <View className="flex-row items-center">
                <View
                  className="h-9 w-9 items-center justify-center rounded-[12px]"
                  style={{
                    backgroundColor: selected
                      ? "rgba(113,139,255,0.16)"
                      : "rgba(17,27,47,0.9)",
                  }}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={selected ? "#8295FF" : "#64718D"}
                  />
                </View>

                <Text
                  numberOfLines={1}
                  className="ml-3 flex-1 text-[13px] font-semibold"
                  style={{
                    color: selected ? "#DCE2FF" : "#8793AC",
                  }}
                >
                  {option.label}
                </Text>
              </View>

              {selected ? (
                <View
                  className="absolute right-3 top-3 h-[7px] w-[7px] rounded-full bg-[#718BFF]"
                  style={{
                    shadowColor: "#718BFF",
                    shadowOpacity: 1,
                    shadowRadius: 7,
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                  }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
