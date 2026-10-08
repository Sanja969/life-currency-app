import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function ProgressEmptyState() {
  return (
    <View className="items-center px-3 pt-10">
      {/* EMPTY QUANTUM FIELD */}
      <View
        className="h-[210px] w-[210px] items-center justify-center rounded-full border"
        style={{
          borderColor: "rgba(113, 139, 255, 0.10)",
          backgroundColor: "rgba(113, 139, 255, 0.015)",
          shadowColor: "#718BFF",
          shadowOpacity: 0.12,
          shadowRadius: 40,
          shadowOffset: {
            width: 0,
            height: 0,
          },
        }}
      >
        <View
          className="h-[150px] w-[150px] items-center justify-center rounded-full border"
          style={{
            borderColor: "rgba(113, 139, 255, 0.15)",
          }}
        >
          <View
            className="h-[86px] w-[86px] items-center justify-center rounded-full border"
            style={{
              borderColor: "rgba(113, 139, 255, 0.25)",
              backgroundColor: "rgba(113, 139, 255, 0.04)",
            }}
          >
            <Ionicons name="analytics-outline" size={29} color="#8FA3FF" />
          </View>
        </View>

        <View className="absolute left-[43px] top-[67px] h-[4px] w-[4px] rounded-full bg-[#718BFF] opacity-40" />

        <View className="absolute right-[42px] top-[95px] h-[3px] w-[3px] rounded-full bg-[#A4B2FF] opacity-40" />

        <View className="absolute bottom-[47px] left-[82px] h-[3px] w-[3px] rounded-full bg-[#718BFF] opacity-30" />
      </View>

      {/* COPY */}
      <Text className="mt-8 text-center text-[21px] font-bold text-[#F1F4FF]">
        Your patterns are still forming
      </Text>

      <Text className="mt-3 max-w-[315px] text-center text-[14px] leading-[22px] text-[#7F8CA8]">
        Trace activities over time and your patterns will begin to emerge here.
      </Text>

      <Text className="mt-3 max-w-[315px] text-center text-[13px] leading-[20px] text-[#65728D]">
        Your Growing time, Life Leaks, life areas and changes will become
        visible as your history grows.
      </Text>

      {/* CTA */}
      <Pressable
        onPress={() => router.push("/activities/new")}
        className="mt-8 h-[54px] flex-row items-center justify-center rounded-[18px] bg-[#718BFF] px-7"
        style={({ pressed }) => ({
          opacity: pressed ? 0.78 : 1,
          transform: [
            {
              scale: pressed ? 0.985 : 1,
            },
          ],
          shadowColor: "#718BFF",
          shadowOpacity: 0.22,
          shadowRadius: 15,
          shadowOffset: {
            width: 0,
            height: 6,
          },
        })}
      >
        <Ionicons name="add" size={19} color="#FFFFFF" />

        <Text className="ml-2 text-[14px] font-bold text-white">
          Trace an activity
        </Text>
      </Pressable>
    </View>
  );
}
