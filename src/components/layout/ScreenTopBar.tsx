import { router } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { COLORS } from "@/theme/colors";

type ScreenTopBarProps = {
  title?: string;
  rightAction?: ReactNode;
};

export function ScreenTopBar({ title, rightAction }: ScreenTopBarProps) {
  return (
    <View style={styles.container}>
      <AppButton
        variant="icon"
        tone="secondary"
        icon="chevron-back"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
      />

      <View style={styles.center}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>

      <View style={styles.right}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textAlign: "center",
  },

  right: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
});
