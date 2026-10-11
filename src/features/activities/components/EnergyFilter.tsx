import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { COLORS } from "@/theme/colors";

type EnergyFilterProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
};

const FILTER_HEIGHT = 38;

export function EnergyFilter({
  label,
  selected,
  onPress,
  color,
}: EnergyFilterProps) {
  const accent = color ?? COLORS.gold;

  const backgroundColor = selected ? `${accent}14` : COLORS.surface;

  const borderColor = selected ? accent : COLORS.border;

  const dotColor = selected ? accent : color ? `${color}80` : COLORS.subtle;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filter: ${label}`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.container,
        {
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      {/* ANGULAR BACKGROUND */}

      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox="0 0 100 38"
        preserveAspectRatio="none"
        pointerEvents="none"
      >
        <Path
          d="
            M 10 0
            L 100 0
            L 100 28
            L 90 38
            L 0 38
            L 0 10
            Z
          "
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={selected ? 1.2 : 0.8}
          vectorEffect="non-scaling-stroke"
        />
      </Svg>

      {/* FILTER CONTENT */}

      <View style={styles.content}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: dotColor,
            },
          ]}
        />

        <Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: selected ? accent : COLORS.muted,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    height: FILTER_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 6,
  },

  label: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
