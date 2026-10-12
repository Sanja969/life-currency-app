import { useEffect, useId, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
} from "react-native-svg";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";

type EnergyThreadProps = {
  progress: number;
  color: string;
  completed?: boolean;
  height?: number;
};

export function EnergyThread({
  progress,
  color,
  completed = false,
  height = 34,
}: EnergyThreadProps) {
  const [width, setWidth] = useState(0);

  const gradientId = useId().replace(/:/g, "");

  const pulse = useSharedValue(0);

  const clampedProgress = Math.max(
    0,
    Math.min(progress, 100),
  );

  const padding = 12;
  const startX = padding;
  const endX = Math.max(width - padding, padding);
  const lineWidth = Math.max(endX - startX, 0);

  const progressX =
    startX + (lineWidth * clampedProgress) / 100;

  const centerY = height / 2;

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {
        duration: 2300,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(pulse);
    };
  }, [pulse]);

  const animatedGlow = useAnimatedStyle(() => ({
    opacity: 0.12 + pulse.value * 0.18,
    transform: [
      {
        scale: 0.85 + pulse.value * 0.3,
      },
    ],
  }));

  function handleLayout(event: LayoutChangeEvent) {
    const nextWidth = event.nativeEvent.layout.width;

    if (nextWidth !== width) {
      setWidth(nextWidth);
    }
  }

  return (
    <View
      onLayout={handleLayout}
      style={[styles.container, { height }]}
    >
      {width > 0 && (
        <>
          <Svg
            width={width}
            height={height}
            pointerEvents="none"
          >
            <Defs>
              <LinearGradient
                id={gradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <Stop
                  offset="0%"
                  stopColor={color}
                  stopOpacity={0.35}
                />

                <Stop
                  offset="45%"
                  stopColor={color}
                  stopOpacity={0.85}
                />

                <Stop
                  offset="100%"
                  stopColor="#FFF1C9"
                  stopOpacity={1}
                />
              </LinearGradient>
            </Defs>

            {/* DORMANT ENERGY */}

            <Line
              x1={startX}
              y1={centerY}
              x2={endX}
              y2={centerY}
              stroke="#68718A"
              strokeOpacity={0.28}
              strokeWidth={1.2}
            />

            {/* SOFT ENERGY HALO */}

            {clampedProgress > 0 && (
              <>
                <Line
                  x1={startX}
                  y1={centerY}
                  x2={progressX}
                  y2={centerY}
                  stroke={color}
                  strokeOpacity={0.09}
                  strokeWidth={13}
                />

                <Line
                  x1={startX}
                  y1={centerY}
                  x2={progressX}
                  y2={centerY}
                  stroke={color}
                  strokeOpacity={0.2}
                  strokeWidth={6}
                />
              </>
            )}

            {/* MAIN ENERGY THREAD */}

            {clampedProgress > 0 && (
              <Line
                x1={startX}
                y1={centerY}
                x2={progressX}
                y2={centerY}
                stroke={`url(#${gradientId})`}
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            )}

            {/* ENERGY FILAMENTS */}

            {clampedProgress > 10 && (
              <>
                <Path
                  d={`
                    M ${startX} ${centerY - 3}
                    Q ${(startX + progressX) / 2} ${centerY - 7}
                    ${progressX} ${centerY - 2}
                  `}
                  stroke={color}
                  strokeOpacity={0.22}
                  strokeWidth={0.7}
                  fill="none"
                />

                <Path
                  d={`
                    M ${startX} ${centerY + 3}
                    Q ${(startX + progressX) / 2} ${centerY + 7}
                    ${progressX} ${centerY + 2}
                  `}
                  stroke={color}
                  strokeOpacity={0.18}
                  strokeWidth={0.7}
                  fill="none"
                />
              </>
            )}

            {/* STARTING STAR */}

            <Circle
              cx={startX}
              cy={centerY}
              r={2}
              fill={color}
              opacity={0.75}
            />

            {/* ENERGY CORE */}

            {clampedProgress > 0 && (
              <>
                <Circle
                  cx={progressX}
                  cy={centerY}
                  r={8}
                  fill={color}
                  opacity={0.1}
                />

                <Circle
                  cx={progressX}
                  cy={centerY}
                  r={4}
                  fill={color}
                  opacity={0.25}
                />

                <Circle
                  cx={progressX}
                  cy={centerY}
                  r={2.5}
                  fill={color}
                  opacity={0.9}
                />

                <Circle
                  cx={progressX}
                  cy={centerY}
                  r={1.2}
                  fill="#FFFFFF"
                />
              </>
            )}

            {/* COMPLETED INTENTION */}

            {completed && (
              <Path
                d={`
                  M ${endX} ${centerY - 9}
                  L ${endX + 2} ${centerY - 2}
                  L ${endX + 9} ${centerY}
                  L ${endX + 2} ${centerY + 2}
                  L ${endX} ${centerY + 9}
                  L ${endX - 2} ${centerY + 2}
                  L ${endX - 9} ${centerY}
                  L ${endX - 2} ${centerY - 2}
                  Z
                `}
                fill="#FFF1C9"
                opacity={0.95}
              />
            )}
          </Svg>

          {/* PULSING ENERGY */}

          {clampedProgress > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ambientGlow,
                {
                  left: progressX - 10,
                  top: centerY - 10,
                  backgroundColor: color,
                },
                animatedGlow,
              ]}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
    justifyContent: "center",
  },

  ambientGlow: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});