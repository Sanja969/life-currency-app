import { router } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Button, Searchbar } from "react-native-paper";

import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { ActivityClassification } from "@/types/activity";

import { ActivityList } from "./components/ActivityList";
import { useActivities } from "./hooks/useActivities";

export function Activities() {
  const {
    activities,
    searchQuery,
    filter,
    isLoading,
    errorMessage,
    setSearchQuery,
    setFilter,
  } = useActivities();

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 gap-4">
        <AppText variant="headline">Activities</AppText>

        <Searchbar
          placeholder="Search activities"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View className="flex-row flex-wrap gap-2">
          <Button
            mode={filter === "all" ? "contained" : "outlined"}
            onPress={() => setFilter("all")}
          >
            All
          </Button>

          <Button
            mode={
              filter === ActivityClassification.Serves
                ? "contained"
                : "outlined"
            }
            onPress={() =>
              setFilter(ActivityClassification.Serves)
            }
          >
            Growing
          </Button>

          <Button
            mode={
              filter === ActivityClassification.DoesNotServe
                ? "contained"
                : "outlined"
            }
            onPress={() =>
              setFilter(ActivityClassification.DoesNotServe)
            }
          >
            Life leaks
          </Button>
        </View>

        {errorMessage ? (
          <AppText>{errorMessage}</AppText>
        ) : (
          <ActivityList activities={activities} />
        )}

        <Button
          mode="contained"
          icon="plus"
          onPress={() => router.push("/activities/new")}
        >
          Add activity
        </Button>
      </View>
    </Screen>
  );
}