import React, { ReactNode, useId, useState } from "react";

import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
} from "react-native-svg";

type CosmicPanelVariant = "default" | "signal" | "subtle";

type CosmicPanelProps = {
  children: ReactNode;
  variant?: CosmicPanelVariant;
  accent?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

const GOLD = "#D6AD65";

const SHAPES = {
  default: {
    topLeft: 16,
    topRight: 24,
    bottomRight: 4,
    bottomLeft: 4,
  },

  signal: {
    topLeft: 22,
    topRight: 30,
    bottomRight: 20,
    bottomLeft: 0,
  },

  subtle: {
    topLeft: 8,
    topRight: 16,
    bottomRight: 4,
    bottomLeft: 4,
  },
};

function getPanelPath(
  width: number,
  height: number,
  variant: CosmicPanelVariant,
) {
  const { topLeft, topRight, bottomRight, bottomLeft } = SHAPES[variant];

  return `
    M ${topLeft} 0
    H ${width - topRight}
    L ${width} ${topRight}
    V ${height - bottomRight}
    L ${width - bottomRight} ${height}
    H ${bottomLeft}
    L 0 ${height - bottomLeft}
    V ${topLeft}
    Z
  `;
}

export function CosmicPanel({
  children,
  variant = "default",
  accent = GOLD,
  style,
  contentStyle,
  onPress,
}: CosmicPanelProps) {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const reactId = useId();
  const gradientId = `cosmic-gradient-${reactId.replace(/:/g, "")}`;

  const { width, height } = size;

  return (
    <Pressable
      onLayout={(event) => {
        const { width: nextWidth, height: nextHeight } =
          event.nativeEvent.layout;

        if (nextWidth !== width || nextHeight !== height) {
          setSize({
            width: nextWidth,
            height: nextHeight,
          });
        }
      }}
      onPress={onPress}
      style={
        onPress
          ? ({ pressed }: { pressed: boolean }) => [
              styles.container,
              style,
              {
                opacity: pressed ? 0.82 : 1,
                transform: [
                  {
                    scale: pressed ? 0.985 : 1,
                  },
                ],
              },
            ]
          : [styles.container, style]
      }
    >
      {width > 0 && height > 0 && (
        <Svg
          width={width}
          height={height}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0" stopColor="#191A22" />
              <Stop offset="0.55" stopColor="#111219" />
              <Stop offset="1" stopColor="#090B10" />
            </SvgGradient>
          </Defs>

          <Path
            d={getPanelPath(width, height, variant)}
            fill={`url(#${gradientId})`}
            stroke="rgba(214,173,101,0.20)"
            strokeWidth={1}
          />

          <Path
            d={`M ${SHAPES[variant].topLeft + 2} 1 H ${
              SHAPES[variant].topLeft + 72
            }`}
            stroke={accent}
            strokeWidth={1.4}
            opacity={0.75}
          />

          <Path
            d={`
              M ${width - SHAPES[variant].topRight} 1
              L ${width - 1} ${SHAPES[variant].topRight}
            `}
            stroke={accent}
            strokeWidth={1}
            opacity={0.35}
          />

          <Path
            d={`
              M ${width - 75} ${height - 1}
              H ${width - SHAPES[variant].bottomRight}
            `}
            stroke={accent}
            strokeWidth={1}
            opacity={0.25}
          />
        </Svg>
      )}

      <View style={[styles.content, contentStyle]}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },

  content: {
    padding: 18,
  },
});
