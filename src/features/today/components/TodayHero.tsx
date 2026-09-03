import { View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { formatDuration } from "@/utils/formatDuration";

type TodayHeroProps = {
  investedMinutes: number;
};

export function TodayHero({
  investedMinutes,
}: TodayHeroProps) {
  return (
    <AppCard className="overflow-hidden">
      <View className="items-center p-hero">
        <View className="mb-md h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <MaterialCommunityIcons
            name="sprout"
            size={30}
            color="#15803d"
          />
        </View>

        <AppText variant="caption">
          TODAY&apos;S INVESTMENT
        </AppText>

        <AppText
          variant="display"
          className="mt-sm"
        >
          {formatDuration(investedMinutes)}
        </AppText>

        <AppText
          variant="body"
          className="mt-sm text-center"
        >
          Every minute invested today shapes tomorrow.
        </AppText>
      </View>
    </AppCard>
  );
}