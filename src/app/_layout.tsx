import "../global.css";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useSegments, router } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { en, registerTranslation } from "react-native-paper-dates";

import { initializeDatabase } from "../database/migrations";
import { hasCompletedOnboarding } from "../lib/onboarding";

registerTranslation("en", en);

export default function RootLayout() {
  const [fontsLoaded] = useFonts(MaterialCommunityIcons.font);

  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [isOnboardingReady, setIsOnboardingReady] = useState(false);
  const [hasCompleted, setHasCompleted] = useState<boolean | null>(null);

  const [databaseError, setDatabaseError] = useState<string | null>(null);

  const segments = useSegments();

  useEffect(() => {
    async function prepareApp() {
      try {
        await initializeDatabase();

        const completed = await hasCompletedOnboarding();

        setHasCompleted(completed);
        setIsDatabaseReady(true);
        setIsOnboardingReady(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);

        setDatabaseError(
          error instanceof Error
            ? error.message
            : "Došlo je do greške pri pokretanju aplikacije.",
        );
      }
    }

    void prepareApp();
  }, []);

  useEffect(() => {
    if (
      !fontsLoaded ||
      !isDatabaseReady ||
      !isOnboardingReady ||
      hasCompleted === null
    ) {
      return;
    }

    const isOnboardingRoute = segments[0] === "onboarding";

    async function checkRoute() {
      if (!hasCompleted && !isOnboardingRoute) {
        const completed = await hasCompletedOnboarding();

        if (completed) {
          setHasCompleted(true);
          return;
        }

        router.replace("/onboarding");
        return;
      }

      if (hasCompleted && isOnboardingRoute) {
        router.replace("/(tabs)");
      }
    }

    void checkRoute();
  }, [fontsLoaded, isDatabaseReady, isOnboardingReady, hasCompleted, segments]);

  if (databaseError) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-2xl font-bold text-red-600">
          Baza nije pokrenuta
        </Text>

        <Text className="text-center text-base text-slate-600">
          {databaseError}
        </Text>
      </View>
    );
  }

  if (
    !fontsLoaded ||
    !isDatabaseReady ||
    !isOnboardingReady ||
    hasCompleted === null
  ) {
    return (
      <View className="flex-1 items-center justify-center bg-[#030712] px-6">
        <ActivityIndicator size="large" color="#718BFF" />

        <Text className="mt-3 text-base text-[#7F8CA8]">
          Preparing your Life Field...
        </Text>
      </View>
    );
  }

  return (
    <PaperProvider
      settings={{
        icon: (props) => <MaterialCommunityIcons {...props} />,
      }}
    >
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="activities/new"
          options={{
            title: "New Activity",
            presentation: "modal",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="activities/[id]/index"
          options={{
            title: "Activity Details",
          }}
        />

        <Stack.Screen
          name="activities/[id]/edit"
          options={{
            title: "Edit Activity",
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
