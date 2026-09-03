import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

import { activityService } from "../../services/ActivityService";
import { Activity, ActivityClassification } from "../../types/activity";
import { ActivityCard } from "../../components/activity/ActivityCard";
import { FAB, Button, Menu, Text, Searchbar } from "react-native-paper";
import { router, useFocusEffect } from "expo-router";
import { SegmentedButtons } from "react-native-paper";

type ClassificationFilter = "all" | ActivityClassification;

type SortOption =
  | "newest"
  | "oldest"
  | "durationAsc"
  | "durationDesc"
  | "title";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  durationAsc: "Shortest duration",
  durationDesc: "Longest duration",
  title: "Title A–Z",
};

export default function HomeScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] =
    useState<ClassificationFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [isSortMenuVisible, setIsSortMenuVisible] = useState(false);

  const hasLoadedOnceRef = useRef(false);

  const filteredActivities = activities.filter((activity) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !query ||
      activity.title.toLowerCase().includes(query) ||
      activity.description?.toLowerCase().includes(query);

    const matchesClassification =
      classificationFilter === "all" ||
      activity.classification === classificationFilter;

    return matchesSearch && matchesClassification;
  });

  function handleSortChange(option: SortOption) {
    setSortOption(option);
    setIsSortMenuVisible(false);
  }

  const hasActiveFilters =
    searchQuery.trim().length > 0 || classificationFilter !== "all";

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return b.activityDate.getTime() - a.activityDate.getTime();

      case "oldest":
        return a.activityDate.getTime() - b.activityDate.getTime();

      case "durationAsc":
        return a.durationMinutes - b.durationMinutes;

      case "durationDesc":
        return b.durationMinutes - a.durationMinutes;

      case "title":
        return a.title.localeCompare(b.title);

      default:
        return 0;
    }
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadActivities() {
        try {
          if (!hasLoadedOnceRef.current) {
            setIsLoading(true);
          }
          setErrorMessage(null);

          const result = await activityService.getAllActivities();

          if (isActive) {
            setActivities(result);
            hasLoadedOnceRef.current = true;
          }
        } catch (error) {
          if (isActive) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "An unexpected error occurred.",
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadActivities();

      return () => {
        isActive = false;
      };
    }, []),
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center gap-2">
        <ActivityIndicator size="large" />
        <Text className="text-base text-slate-600">Loading activities...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-base text-red-600">
          {errorMessage}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Searchbar
        placeholder="Search activities"
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="mx-4 mt-4"
      />
      <SegmentedButtons
        value={classificationFilter}
        onValueChange={(value) =>
          setClassificationFilter(value as ClassificationFilter)
        }
        buttons={[
          {
            value: "all",

            label: "All",
          },

          {
            value: ActivityClassification.Serves,

            label: "Serves",
          },

          {
            value: ActivityClassification.DoesNotServe,

            label: "Doesn't serve",
          },
        ]}
      />
      <View className="items-end px-4">
        <Menu
          visible={isSortMenuVisible}
          onDismiss={() => setIsSortMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="sort"
              onPress={() => setIsSortMenuVisible(true)}
            >
              {sortLabels[sortOption]}
            </Button>
          }
        >
          <Menu.Item
            title="Newest first"
            leadingIcon={sortOption === "newest" ? "check" : undefined}
            onPress={() => handleSortChange("newest")}
          />

          <Menu.Item
            title="Oldest first"
            leadingIcon={sortOption === "oldest" ? "check" : undefined}
            onPress={() => handleSortChange("oldest")}
          />

          <Menu.Item
            title="Shortest duration"
            leadingIcon={sortOption === "durationAsc" ? "check" : undefined}
            onPress={() => handleSortChange("durationAsc")}
          />

          <Menu.Item
            title="Longest duration"
            leadingIcon={sortOption === "durationDesc" ? "check" : undefined}
            onPress={() => handleSortChange("durationDesc")}
          />

          <Menu.Item
            title="Title A–Z"
            leadingIcon={sortOption === "title" ? "check" : undefined}
            onPress={() => handleSortChange("title")}
          />
        </Menu>
      </View>
      <FlatList
        data={sortedActivities}
        keyExtractor={(activity) => activity.id.toString()}
        renderItem={({ item }) => <ActivityCard activity={item} />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8">
            <Text variant="headlineSmall" className="text-center">
              {activities.length === 0
                ? "No activities yet"
                : "No matching activities"}
            </Text>

            <Text variant="bodyMedium" className="mt-2 text-center opacity-70">
              {activities.length === 0
                ? "Tap the plus button to add your first activity."
                : hasActiveFilters
                  ? "Try changing your search or filter."
                  : "No activities are available."}
            </Text>
          </View>
        }
        contentContainerClassName={
          filteredActivities.length === 0 ? "flex-1" : "pb-24 p-4"
        }
      />
      <FAB
        icon="plus"
        className="absolute bottom-6 right-6"
        onPress={() => router.navigate("/activities/new")}
      />
    </View>
  );
}
