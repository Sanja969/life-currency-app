import { View } from "react-native";

export function ActivitiesBackground() {
  return (
    <View className="absolute inset-0 bg-[#02040D]">
      <View className="absolute -right-36 -top-36 h-80 w-80 rounded-full bg-[#3042A8]/[0.04]" />

      <View className="absolute -bottom-44 -left-32 h-96 w-96 rounded-full bg-[#8D286F]/[0.035]" />
    </View>
  );
}
