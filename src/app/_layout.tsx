import "../global.css";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { en, registerTranslation } from "react-native-paper-dates";

import { initializeDatabase } from "../database/migrations";

registerTranslation("en", en);

export default function RootLayout() {
  const [fontsLoaded] = useFonts(MaterialCommunityIcons.font);

  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  const [databaseError, setDatabaseError] = useState<string | null>(null);

  useEffect(() => {
    async function prepareDatabase() {
      try {
        await initializeDatabase();
        setIsDatabaseReady(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);

        setDatabaseError(
          error instanceof Error
            ? error.message
            : "Došlo je do greške pri otvaranju baze.",
        );
      }
    }

    void prepareDatabase();
  }, []);

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

  if (!fontsLoaded || !isDatabaseReady) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator size="large" />

        <Text className="mt-3 text-base text-slate-600">
          Pripremamo aplikaciju...
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
