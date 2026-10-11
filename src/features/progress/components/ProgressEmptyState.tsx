import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";

export function ProgressEmptyState() {
  return (
    <View className="items-center px-3 pt-10">
      {/* EMPTY STATE VISUAL */}

      <View
        className="h-[200px] w-[200px] items-center justify-center rounded-full border"
        style={{
          borderColor: "rgba(214, 173, 101, 0.10)",
          backgroundColor: "rgba(214, 173, 101, 0.015)",
        }}
      >
        {/* MIDDLE CIRCLE */}

        <View
          className="h-[145px] w-[145px] items-center justify-center rounded-full border"
          style={{
            borderColor: "rgba(214, 173, 101, 0.16)",
          }}
        >
          {/* INNER CIRCLE */}

          <View
            className="h-[84px] w-[84px] items-center justify-center rounded-full border"
            style={{
              borderColor: "rgba(214, 173, 101, 0.30)",
              backgroundColor: "#24231F",
            }}
          >
            <Ionicons name="analytics-outline" size={30} color="#D6AD65" />
          </View>
        </View>

        {/* SMALL DECORATIVE POINTS */}

        <View className="absolute left-[40px] top-[64px] h-[4px] w-[4px] rounded-full bg-[#D6AD65] opacity-40" />

        <View className="absolute right-[38px] top-[93px] h-[3px] w-[3px] rounded-full bg-[#D6AD65] opacity-30" />

        <View className="absolute bottom-[43px] left-[80px] h-[3px] w-[3px] rounded-full bg-[#D6AD65] opacity-30" />
      </View>

      {/* TITLE */}

      <Text className="mt-8 text-center text-[21px] font-bold text-[#F5F0E8]">
        Your patterns are still forming
      </Text>

      {/* DESCRIPTION */}

      <Text className="mt-3 max-w-[315px] text-center text-[14px] leading-[22px] text-[#9295A3]">
        Trace activities over time and your patterns will begin to emerge here.
      </Text>

      <Text className="mt-3 max-w-[315px] text-center text-[13px] leading-[20px] text-[#686C7A]">
        Your Growing time, Life Leaks, life areas and changes will become
        visible as your history grows.
      </Text>

      {/* CTA BUTTON */}

      <View style={{ marginTop: 32 }}>
        <AppButton
          variant="primary"
          leadingIcon="add"
          onPress={() => router.push("/activities/new")}
          accessibilityLabel="Trace an activity"
        >
          Trace an activity
        </AppButton>
      </View>
    </View>
  );
}
