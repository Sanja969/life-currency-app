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
  Stop,
} from "react-native-svg";

export type LifeCurrencyTab =
  | "today"
  | "activities"
  | "plan"
  | "progress"
  | "settings";

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
      {/* ACTIVE HALO */}

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

        {/* ACTIVITIES — ENERGY TIMELINES */}
        {name === "activities" && (
          <G>
            {/* First activity trace */}
            <Path
              d="M6 9 H26"
              stroke={color}
              strokeWidth="1.35"
              strokeLinecap="round"
              opacity={focused ? 0.9 : 0.7}
            />

            <Circle
              cx="11"
              cy="9"
              r="2.3"
              fill={focused ? LIGHT_GOLD : MUTED}
            />

            {/* Second activity trace */}
            <Path
              d="M6 16 H26"
              stroke={color}
              strokeWidth="1.35"
              strokeLinecap="round"
              opacity={focused ? 0.9 : 0.7}
            />

            <Circle cx="21" cy="16" r="2.3" fill={focused ? GOLD : MUTED} />

            {/* Third activity trace */}
            <Path
              d="M6 23 H26"
              stroke={color}
              strokeWidth="1.35"
              strokeLinecap="round"
              opacity={focused ? 0.9 : 0.7}
            />

            <Circle
              cx="15"
              cy="23"
              r="2.3"
              fill={focused ? LIGHT_GOLD : MUTED}
            />

            {/* Orbital accent */}
            <Circle
              cx="21"
              cy="16"
              r="4.4"
              fill="none"
              stroke={secondary}
              strokeWidth="0.75"
              opacity={focused ? 0.55 : 0.2}
            />
          </G>
        )}

        {/* PLAN — CELESTIAL COMPASS */}

        {name === "plan" && (
          <G>
            {/* Outer compass ring */}

            <Circle
              cx="16"
              cy="16"
              r="11.5"
              fill="none"
              stroke={color}
              strokeWidth="1.4"
            />

            {/* Inner orbital ring */}

            <Circle
              cx="16"
              cy="16"
              r="8.3"
              fill="none"
              stroke={secondary}
              strokeWidth="0.8"
              opacity={focused ? 0.65 : 0.35}
            />

            {/* Cardinal markers */}

            <Path
              d="
                M16 2.5 V6.5
                M16 25.5 V29.5
                M2.5 16 H6.5
                M25.5 16 H29.5
              "
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Four-point intention star */}

            <Path
              d="
                M16 7
                L18.8 13.2
                L25 16
                L18.8 18.8
                L16 25
                L13.2 18.8
                L7 16
                L13.2 13.2
                Z
              "
              fill={focused ? "url(#tabGold)" : "none"}
              stroke={color}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Energy core */}

            <Circle
              cx="16"
              cy="16"
              r="2.2"
              fill={focused ? LIGHT_GOLD : MUTED}
            />

            {/* Celestial accent */}

            <Circle
              cx="23.9"
              cy="8.1"
              r="1"
              fill={focused ? LIGHT_GOLD : MUTED}
              opacity={focused ? 0.9 : 0.45}
            />
          </G>
        )}

        {/* PROGRESS — ASCENDING CONSTELLATION */}

        {name === "progress" && (
          <G>
            {/* Ascending energy trajectory */}

            <Path
              d="
                M5 24
                L11.5 19
                L17.5 21
                L25.5 8
              "
              fill="none"
              stroke={color}
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Progress nodes */}

            <Circle cx="5" cy="24" r="2.1" fill={focused ? GOLD : MUTED} />

            <Circle cx="11.5" cy="19" r="2.1" fill={focused ? GOLD : MUTED} />

            <Circle cx="17.5" cy="21" r="2.1" fill={focused ? GOLD : MUTED} />

            <Circle
              cx="25.5"
              cy="8"
              r="2.7"
              fill={focused ? "url(#tabGold)" : MUTED}
            />

            {/* Final milestone halo */}

            <Circle
              cx="25.5"
              cy="8"
              r="5"
              fill="none"
              stroke={secondary}
              strokeWidth="0.8"
              opacity={focused ? 0.65 : 0.25}
            />

            {/* Horizon */}

            <Path
              d="M5 28 H27"
              stroke={secondary}
              strokeWidth="0.8"
              opacity={focused ? 0.45 : 0.25}
            />

            {/* Small celestial spark */}

            <Path
              d="M7.5 5 L8.3 7.2 L10.5 8 L8.3 8.8 L7.5 11 L6.7 8.8 L4.5 8 L6.7 7.2 Z"
              fill={focused ? LIGHT_GOLD : MUTED}
              opacity={focused ? 0.8 : 0.4}
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
