import { View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { ActivityStatistics } from "@/types/activity";
import { formatDuration } from "@/utils/formatDuration";

type BalanceCardProps = {
  statistics: ActivityStatistics;
};

export function BalanceCard({ statistics }: BalanceCardProps) {
  return (
    <AppCard>
      <View className="items-center">
        <AppText variant="display">
          {statistics.servesPercentage}%
        </AppText>

        <AppText
          variant="caption"
          className="mt-xs"
        >
          Positive balance
        </AppText>
      </View>

      <View className="mt-xl flex-row justify-between">
        <View className="items-center flex-1">
          <AppText variant="caption">
            Growing
          </AppText>

          <AppText variant="title">
            {formatDuration(statistics.servesDurationMinutes)}
          </AppText>
        </View>

        <View className="items-center flex-1">
          <AppText variant="caption">
            Life Leaks
          </AppText>

          <AppText variant="title">
            {formatDuration(statistics.doesNotServeDurationMinutes)}
          </AppText>
        </View>
      </View>

      <View className="mt-xl items-center">
        <AppText variant="caption">
          Net investment
        </AppText>

        <AppText variant="headline">
          {formatDuration(statistics.netDurationMinutes)}
        </AppText>
      </View>
    </AppCard>
  );
}