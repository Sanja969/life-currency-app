import "../global.css";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { initializeDatabase } from "../database/migrations";
import { PaperProvider } from "react-native-paper";
import { en, registerTranslation } from "react-native-paper-dates";

export default function RootLayout() {

  registerTranslation("en", en);
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

  if (!isDatabaseReady) {
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
    <PaperProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Životna valuta",
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
