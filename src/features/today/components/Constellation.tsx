import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

import { COLORS } from "@/theme/colors";

export type ConstellationPoint = {
  x: number;
  y: number;
};

type ConstellationProps = {
  title: string;
  color: string;
  points: ConstellationPoint[];
  active: boolean;
  onPress: () => void;
};

const WIDTH = 130;
const HEIGHT = 105;

export function Constellation({
  title,
  color,
  points,
  active,
  onPress,
}: ConstellationProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Explore ${title} constellation`}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.visual}>
        <Svg
          width={WIDTH}
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          {/* CONNECTIONS */}

          {points.slice(0, -1).map((point, index) => {
            const next = points[index + 1];

            return (
              <Line
                key={`line-${index}`}
                x1={point.x}
                y1={point.y}
                x2={next.x}
                y2={next.y}
                stroke={color}
                strokeWidth={1}
                strokeOpacity={active ? 0.55 : 0.15}
              />
            );
          })}

          {/* STARS */}

          {points.map((point, index) => (
            <Circle
              key={`star-${index}`}
              cx={point.x}
              cy={point.y}
              r={index === 0 ? 5 : 3.5}
              fill={active ? color : COLORS.subtle}
              opacity={active ? 0.95 : 0.35}
            />
          ))}
        </Svg>
      </View>

      <Text
        style={[
          styles.title,
          active && { color },
        ]}
      >
        {title.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },

  pressed: {
    opacity: 0.7,
  },

  visual: {
    width: 130,
    height: 105,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginTop: 2,
  },
});