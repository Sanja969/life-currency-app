import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { ActivityCategory } from "@/types/activity";

type CategorySelectorProps = {
  value: ActivityCategory;
  onChange: (value: ActivityCategory) => void;
};

const CATEGORY_OPTIONS: ActivityCategory[] = [
  ActivityCategory.Work,
  ActivityCategory.Learning,
  ActivityCategory.Health,
  ActivityCategory.Relationships,
  ActivityCategory.Rest,
  ActivityCategory.Entertainment,
  ActivityCategory.Mindfulness,
  ActivityCategory.Other,
];

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <View className="gap-3">
      <View>
        <Text className="text-sm font-medium text-slate-200">Life area</Text>

        <Text className="mt-1 text-xs text-slate-400">
          Where did this time go?
        </Text>
      </View>

      <View className="flex-row flex-wrap justify-between">
        {CATEGORY_OPTIONS.map((category) => {
          const meta = getActivityCategoryMeta(category);
          const selected = value === category;

          return (
            <Pressable
              key={category}
              onPress={() => onChange(category)}
              className="mb-3 w-[48.5%] rounded-[18px] border px-4 py-4"
              style={({ pressed }) => ({
                borderColor: selected ? "rgba(113, 139, 255, 0.72)" : "#26365A",

                backgroundColor: selected
                  ? "rgba(41, 36, 93, 0.85)"
                  : "#0D152B",

                opacity: pressed ? 0.75 : 1,

                transform: [
                  {
                    scale: pressed ? 0.98 : 1,
                  },
                ],

                shadowColor: selected ? "#718BFF" : "transparent",

                shadowOpacity: selected ? 0.2 : 0,
                shadowRadius: selected ? 12 : 0,

                shadowOffset: {
                  width: 0,
                  height: 4,
                },
              })}
            >
              <View className="flex-row items-center">
                <View
                  className="h-9 w-9 items-center justify-center rounded-[12px]"
                  style={{
                    backgroundColor: selected
                      ? "rgba(113, 139, 255, 0.18)"
                      : "#101A30",
                  }}
                >
                  <Ionicons
                    name={meta.icon}
                    size={18}
                    color={selected ? "#9EACFF" : "#71809D"}
                  />
                </View>

                <Text
                  numberOfLines={1}
                  className="ml-3 flex-1 text-[13px] font-semibold"
                  style={{
                    color: selected ? "#FFFFFF" : "#A0ABC0",
                  }}
                >
                  {meta.label}
                </Text>
              </View>

              {selected ? (
                <View
                  className="absolute right-3 top-3 h-[6px] w-[6px] rounded-full"
                  style={{
                    backgroundColor: "#8FA3FF",
                    shadowColor: "#718BFF",
                    shadowOpacity: 1,
                    shadowRadius: 6,
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
