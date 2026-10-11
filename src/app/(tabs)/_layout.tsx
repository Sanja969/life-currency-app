import { Tabs } from "expo-router";

import { FloatingOrbitalTabBar } from "@/components/navigation/FloatingOrbitalTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingOrbitalTabBar {...props} />}
      screenOptions={{
        headerShown: false,

        sceneStyle: {
          backgroundColor: "#080A10",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
        }}
      />

      <Tabs.Screen
        name="activities"
        options={{
          title: "Activities",
        }}
      />

      <Tabs.Screen
        name="plan"
        options={{
          title: "Plan",
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
