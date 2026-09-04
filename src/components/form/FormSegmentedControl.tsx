import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type SegmentItem = {
  label: string;
  value: string;
};

type FormSegmentedControlProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  items: SegmentItem[];
};

export function FormSegmentedControl<T extends FieldValues>({
  control,
  name,
  label,
  items,
}: FormSegmentedControlProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <View className="gap-3">
          {label ? (
            <Text className="text-sm font-medium text-slate-200">{label}</Text>
          ) : null}

          <View className="flex-row gap-3">
            {items.map((item, index) => {
              const selected = field.value === item.value;

              if (selected) {
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => field.onChange(item.value)}
                    className="flex-1 overflow-hidden rounded-2xl border border-[#727BFF]"
                  >
                    <LinearGradient
                      colors={["#183D8D", "#3935A9", "#5B2E8C"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        minHeight: 76,
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                      }}
                    >
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/10">
                        <Ionicons
                          name={index === 0 ? "sparkles" : "ellipse-outline"}
                          size={20}
                          color="#FFFFFF"
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="font-semibold text-white">
                          {item.label}
                        </Text>

                        <Text className="mt-1 text-xs text-indigo-100">
                          {index === 0 ? "Builds my life" : "Drains my energy"}
                        </Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={item.value}
                  onPress={() => field.onChange(item.value)}
                  className="min-h-[76px] flex-1 flex-row items-center rounded-2xl border border-[#26365A] bg-[#0D152B]/90 px-4"
                >
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/5">
                    <Ionicons
                      name="ellipse-outline"
                      size={20}
                      color="#68738D"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="font-semibold text-slate-300">
                      {item.label}
                    </Text>

                    <Text className="mt-1 text-xs text-slate-500">
                      {index === 0 ? "Builds my life" : "Drains my energy"}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    />
  );
}
