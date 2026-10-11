import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const COLORS = {
  gold: "#D6AD65",
  lightGold: "#F3D49B",
  text: "#F5F0E7",
  muted: "#9295A5",
  surface: "#11141D",
};

export function EmptyField() {
  return (
    <View style={styles.container}>
      {/* EMPTY ENERGY FIELD */}

      <View style={styles.symbolContainer}>
        <Svg width={112} height={112} viewBox="0 0 112 112">
          {/* OUTER ANGULAR FIELD */}

          <Path
            d="M 28 8 L 104 8 L 104 84 L 84 104 L 8 104 L 8 28 Z"
            fill={COLORS.surface}
            stroke="rgba(214,173,101,0.25)"
            strokeWidth={1}
          />

          {/* INNER ENERGY RINGS */}

          <Circle
            cx={56}
            cy={56}
            r={31}
            fill="none"
            stroke={COLORS.gold}
            strokeOpacity={0.14}
            strokeWidth={1}
          />

          <Circle
            cx={56}
            cy={56}
            r={20}
            fill="none"
            stroke={COLORS.gold}
            strokeOpacity={0.3}
            strokeWidth={1}
          />

          {/* DORMANT CORE */}

          <Circle cx={56} cy={56} r={5} fill={COLORS.gold} fillOpacity={0.75} />

          <Circle cx={56} cy={56} r={2} fill={COLORS.lightGold} />

          {/* TOP ACCENT */}

          <Path d="M 28 8 L 52 8" stroke={COLORS.lightGold} strokeWidth={1.5} />
        </Svg>
      </View>

      {/* TEXT */}

      <Text style={styles.title}>Your field is quiet</Text>

      <Text style={styles.description}>
        Create a moment to leave your first trace.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },

  symbolContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: 22,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },

  description: {
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 260,
  },
});
