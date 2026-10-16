import { ScrollView, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenTopBar } from "@/components/layout/ScreenTopBar";
import { MyUniverse } from "@/features/universe/components/MyUniverse";
import { COLORS } from "@/theme/colors";

export default function MyUniverseScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* SHARED NAVIGATION HEADER */}

        <ScreenTopBar title="MY UNIVERSE" />

        {/* UNIVERSE CONTENT */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <MyUniverse />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
});
