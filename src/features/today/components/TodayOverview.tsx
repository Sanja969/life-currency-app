import { router } from "expo-router";

import { StyleSheet, View } from "react-native";

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { AppButton } from "@/components/ui/AppButton";

import { DailyThought } from "./DailyThought";

export function TodayOverview() {
  const formattedDate = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  function handleAddActivity() {
    router.push({
      pathname: "/activities/new",
      params: {
        source: "today",
      },
    });
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        eyebrow={`TODAY · ${formattedDate}`}
        title="Your life, "
        highlightedTitle="today"
      />

      <DailyThought />

      <AppButton
        variant="secondary"
        leadingIcon="add"
        trailingIcon="arrow-forward"
        accessibilityLabel="Add activity"
        onPress={handleAddActivity}
        style={styles.addButton}
      >
        Add activity
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  addButton: {
    alignSelf: "flex-start",
    marginTop: 13,
    marginBottom: 0,
  },
});
