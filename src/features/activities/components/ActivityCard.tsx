import { Pressable, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Activity, ActivityClassification } from "@/types/activity";
import { formatDuration } from "@/utils/formatDuration";
import { useRouter } from "expo-router";

type ActivityCardProps = {
  activity: Activity;
};

export function ActivityCard({ activity }: ActivityCardProps) {
  const router = useRouter();

  const indicatorColor =
    activity.classification === ActivityClassification.Serves
      ? "bg-success"
      : "bg-warning";

  return (
    <Pressable onPress={() => router.push(`/activities/${activity.id}`)}>
      <AppCard>
        <View className="flex-row items-center">
          <View className={`mr-md h-3 w-3 rounded-full ${indicatorColor}`} />

          <View className="flex-1">
            <AppText variant="title">{activity.title}</AppText>

            {activity.description ? (
              <AppText variant="caption" className="mt-xs">
                {activity.description}
              </AppText>
            ) : null}
          </View>

          <AppText variant="title">
            {formatDuration(activity.durationMinutes)}
          </AppText>
        </View>
      </AppCard>
    </Pressable>
  );
}
