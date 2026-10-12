import type { ReactNode } from "react";

import {
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { COLORS } from "@/theme/colors";

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  highlightedTitle?: string;
  subtitle?: string;
  rightAction?: ReactNode;
  eyebrowAccessory?: ReactNode;
  variant?: "default" | "editorial";
  style?: ViewStyle;
};

export function ScreenHeader({
  eyebrow,
  title,
  highlightedTitle,
  subtitle,
  rightAction,
  eyebrowAccessory,
  variant = "default",
  style,
}: ScreenHeaderProps) {
  const editorial = variant === "editorial";

  const titleStyle: TextStyle = editorial
    ? styles.editorialTitle
    : styles.title;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.eyebrowRow}>
        <View style={styles.dot} />

        <Text style={styles.eyebrow}>{eyebrow}</Text>

        {eyebrowAccessory && (
          <View style={styles.eyebrowAccessory}>{eyebrowAccessory}</View>
        )}
      </View>

      <View style={styles.titleRow}>
        <Text style={titleStyle} accessibilityRole="header">
          {title}

          {highlightedTitle && (
            <Text style={styles.highlight}>{highlightedTitle}</Text>
          )}
        </Text>

        {rightAction}
      </View>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  eyebrowAccessory: {
    marginLeft: "auto",
    marginRight: 5,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  title: {
    flexShrink: 1,
    color: COLORS.text,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "600",
    letterSpacing: -0.7,
  },

  editorialTitle: {
    flexShrink: 1,
    color: "#EAE4DC",
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "500",
    letterSpacing: 1.1,
  },

  highlight: {
    color: COLORS.lightGold,
    fontWeight: "700",
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
});
