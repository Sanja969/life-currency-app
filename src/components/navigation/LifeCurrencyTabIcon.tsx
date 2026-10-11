import React from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

export type LifeCurrencyTab = "today" | "activities" | "progress" | "settings";

type Props = {
  name: LifeCurrencyTab;
  focused: boolean;
  size?: number;
};

const GOLD = "#D6AD65";
const LIGHT_GOLD = "#F3D49B";
const MUTED = "#858999";

export function LifeCurrencyTabIcon({ name, focused, size = 30 }: Props) {
  const color = focused ? LIGHT_GOLD : MUTED;
  const secondary = focused ? GOLD : MUTED;

  return (
    <View
      style={{
        width: 46,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {focused && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(214,173,101,0.09)",
            borderWidth: 1,
            borderColor: "rgba(214,173,101,0.17)",
            shadowColor: GOLD,
            shadowOpacity: 0.24,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
      )}

      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Defs>
          <LinearGradient id="tabGold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={LIGHT_GOLD} />
            <Stop offset="1" stopColor={GOLD} />
          </LinearGradient>
        </Defs>

        {/* TODAY — ORBITAL CLOCK */}
        {name === "today" && (
          <G>
            <Circle
              cx="16"
              cy="16"
              r="10.2"
              fill="none"
              stroke={color}
              strokeWidth="1.45"
            />

            <Ellipse
              cx="16"
              cy="16"
              rx="14"
              ry="6.8"
              rotation="-35"
              origin="16,16"
              fill="none"
              stroke={secondary}
              strokeWidth="1"
              opacity={focused ? 0.85 : 0.5}
            />

            <Path
              d="M16 9.8 V16 L20.2 18.5"
              fill="none"
              stroke={color}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <Circle cx="16" cy="16" r="1.4" fill={color} />

            <Path
              d="M25.4 5.2 L26.3 7.4 L28.5 8.3 L26.3 9.2 L25.4 11.4 L24.5 9.2 L22.3 8.3 L24.5 7.4 Z"
              fill={focused ? "url(#tabGold)" : MUTED}
              opacity={focused ? 1 : 0.65}
            />
          </G>
        )}

        {/* ACTIVITIES — TIME TRACES */}
        {name === "activities" && (
          <G>
            <Path
              d="M7 9 H25"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <Path
              d="M7 16 H25"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <Path
              d="M7 23 H25"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            <Circle cx="11" cy="9" r="2.5" fill={focused ? GOLD : MUTED} />
            <Circle
              cx="21"
              cy="16"
              r="2.5"
              fill={focused ? LIGHT_GOLD : MUTED}
            />
            <Circle cx="15" cy="23" r="2.5" fill={focused ? GOLD : MUTED} />

            <Circle
              cx="11"
              cy="9"
              r="4.1"
              fill="none"
              stroke={secondary}
              strokeWidth="0.8"
              opacity={focused ? 0.55 : 0.2}
            />
          </G>
        )}

        {/* PROGRESS — ASCENDING ENERGY */}
        {name === "progress" && (
          <G>
            <Rect
              x="6"
              y="19"
              width="4.5"
              height="7"
              rx="1.5"
              fill={focused ? GOLD : MUTED}
              opacity="0.65"
            />

            <Rect
              x="13.5"
              y="14"
              width="4.5"
              height="12"
              rx="1.5"
              fill={focused ? GOLD : MUTED}
              opacity="0.8"
            />

            <Rect
              x="21"
              y="9"
              width="4.5"
              height="17"
              rx="1.5"
              fill={focused ? "url(#tabGold)" : MUTED}
            />

            <Path
              d="M5 27.5 H27"
              stroke={color}
              strokeWidth="1"
              opacity="0.55"
            />

            <Path
              d="M23.3 2.5 L24.3 5.2 L27 6.2 L24.3 7.2 L23.3 9.9 L22.3 7.2 L19.6 6.2 L22.3 5.2 Z"
              fill={focused ? LIGHT_GOLD : MUTED}
              opacity={focused ? 1 : 0.65}
            />
          </G>
        )}

        {/* SETTINGS — GEOMETRIC CORE */}
        {name === "settings" && (
          <G>
            <Path
              d="M16 3.8 L26.5 9.8 V22.2 L16 28.2 L5.5 22.2 V9.8 Z"
              fill="none"
              stroke={color}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />

            <Circle
              cx="16"
              cy="16"
              r="6.8"
              fill="none"
              stroke={secondary}
              strokeWidth="1"
              opacity="0.75"
            />

            <Circle
              cx="16"
              cy="16"
              r="3.1"
              fill={focused ? "url(#tabGold)" : MUTED}
            />

            <Line
              x1="16"
              y1="3.8"
              x2="16"
              y2="9.2"
              stroke={secondary}
              strokeWidth="1"
              opacity="0.6"
            />
          </G>
        )}
      </Svg>
    </View>
  );
}
