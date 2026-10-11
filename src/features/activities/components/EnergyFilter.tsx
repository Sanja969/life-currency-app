import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

type EnergyFilterProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
};

const COLORS = {
  gold: "#D6AD65",
  muted: "#9295A5",
};

export function EnergyFilter({
  label,
  selected,
  onPress,
  color,
}: EnergyFilterProps) {
  const accent = color ?? COLORS.gold;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.75 : 1 },
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
          d="M 10 0 L 100 0 L 100 28 L 90 38 L 0 38 L 0 10 Z"
          fill={selected ? `${accent}14` : "#111219"}
          stroke={selected ? accent : "#303039"}
          strokeWidth={selected ? 1.2 : 0.8}
          vectorEffect="non-scaling-stroke"
        />
      </Svg>

      <View style={styles.content}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: selected
                ? accent
                : color
                  ? `${color}80`
                  : "#777987",
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
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 6,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});