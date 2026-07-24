import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { initializeDatabase } from "../database/migrations";

export default function RootLayout() {
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
      <View style={styles.centeredContainer}>
        <Text style={styles.errorTitle}>Baza nije pokrenuta</Text>
        <Text style={styles.errorMessage}>{databaseError}</Text>
      </View>
    );
  }

  if (!isDatabaseReady) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Pripremamo aplikaciju...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Životna valuta",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorTitle: {
    marginBottom: 8,
    fontSize: 20,
    fontWeight: "700",
  },
  errorMessage: {
    textAlign: "center",
    fontSize: 15,
  },
});