import { format } from "date-fns";
import { Card, Text } from "react-native-paper";

import { Activity } from "../../types/activity";
import { useRouter } from "expo-router";
import { formatDuration } from "../../utils/formatDuration";

type ActivityCardProps = {
  activity: Activity;
};

export function ActivityCard({
  activity,
}: ActivityCardProps) {
  const router = useRouter();
  return (
    <Card mode="outlined" onPress={() => router.navigate(`/activities/${activity.id}`)}>
      <Card.Content>
        <Text variant="titleMedium">{activity.title}</Text>

        <Text variant="bodyMedium">
          Duration: {formatDuration(activity.durationMinutes)}
        </Text>

        <Text variant="bodyMedium">
          Classification: {activity.classification}
        </Text>

        <Text variant="bodyMedium">
          Date: {format(activity.activityDate, "dd.MM.yyyy HH:mm")}
        </Text>

        {activity.description && (
          <Text variant="bodyMedium">{activity.description}</Text>
        )}
      </Card.Content>
    </Card>
  );
}