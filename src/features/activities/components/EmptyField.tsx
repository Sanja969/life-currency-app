import { Text, View } from "react-native";

export function EmptyField() {
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
