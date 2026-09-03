import { FlatList } from "react-native";

import { ActivityCard } from "@/features/activities/components/ActivityCard";
import { Activity } from "@/types/activity";

type ActivityListProps = {
  activities: Activity[];
};

export function ActivityList({
  activities,
}: ActivityListProps) {
  return (
    <FlatList
      data={activities}
      keyExtractor={(activity) =>
        activity.id.toString()
      }
      contentContainerClassName="gap-3 pb-24"
      renderItem={({ item }) => (
        <ActivityCard activity={item} />
      )}
    />
  );
}