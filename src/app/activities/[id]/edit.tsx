import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { ActivityForm } from "@/components/ActivityForm";

import { activityService } from "@/services/ActivityService";
import { COLORS } from "@/theme/colors";
import { Activity } from "@/types/activity";
import { ActivityFormOutput } from "@/validation/activitySchema";
import { ScreenTopBar } from "@/components/layout/ScreenTopBar";

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function EditActivityScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const id = normalizeParam(params.id);

  const [activity, setActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // LOAD ACTIVITY

  const loadActivity = useCallback(async () => {
    if (!id) {
      setActivity(null);
      setErrorMessage("Activity id is missing.");
      setIsLoading(false);
      return;
    }

    const numericId = Number(id);

    if (!Number.isSafeInteger(numericId) || numericId <= 0) {
      setActivity(null);
      setErrorMessage("Activity id is invalid.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [activityData, allActivities] = await Promise.all([
        activityService.getActivityById(numericId),
        activityService.getAllActivities(),
      ]);

      setActivity(activityData);
      setActivities(allActivities);

      if (!activityData) {
        setErrorMessage("Activity could not be found.");
      }
    } catch (error) {
      console.error("Unable to load activity:", error);

      setActivity(null);

      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load activity.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadActivity();
    }, [loadActivity]),
  );

  // UPDATE ACTIVITY

  async function handleSubmit(data: ActivityFormOutput) {
    if (!activity) {
      return;
    }

    try {
      await activityService.updateActivity(activity.id, data);

      router.back();
    } catch (error) {
      Alert.alert(
        "Unable to update activity",
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your changes.",
      );

      throw error;
    }
  }

  // LOADING STATE

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />

            <Text style={styles.loadingText}>Loading activity...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ERROR STATE

  if (!activity || errorMessage) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View style={styles.topBar}>
            <AppButton
              variant="icon"
              tone="secondary"
              icon="chevron-back"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
            />

            <View style={styles.topBarLabel}>
              <View style={styles.goldDot} />

              <Text style={styles.headerTitle}>EDIT ACTIVITY</Text>
            </View>

            <View style={styles.backButtonPlaceholder} />
          </View>

          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={30}
                color={COLORS.danger}
              />
            </View>

            <Text style={styles.errorTitle}>Activity unavailable</Text>

            <Text style={styles.errorDescription}>
              {errorMessage ?? "This activity could not be found."}
            </Text>

            <Pressable
              onPress={() => router.replace("/activities")}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.errorButton,
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons
                name="arrow-back-outline"
                size={17}
                color={COLORS.gold}
              />

              <Text style={styles.errorButtonText}>Back to activities</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // EDIT SCREEN

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* TOP BAR */}

        <ScreenTopBar title="EDIT ACTIVITY" />

        {/* FORM */}

        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* PAGE HEADER */}

          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Edit your trace</Text>

            <Text style={styles.pageDescription}>
              Refine the details of how you spent your time.
            </Text>
          </View>

          {/* ACTIVITY FORM */}

          <ActivityForm
            mode="edit"
            initialValues={activity}
            activities={activities}
            activityId={activity.id}
            onSubmit={handleSubmit}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  // TOP BAR

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },

  headerTitle: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  backButtonPlaceholder: {
    width: 52,
    height: 52,
  },

  topBarLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  goldDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
  },

  eyebrow: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  // FORM

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 100,
  },

  pageHeader: {
    marginBottom: 26,
  },

  pageTitle: {
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "600",
    letterSpacing: -1.1,
  },

  pageDescription: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },

  // LOADING

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 16,
  },

  // ERROR

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  errorIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#302019",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  errorTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },

  errorDescription: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 10,
  },

  errorButton: {
    marginTop: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  errorButtonText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: "600",
  },
});
