import { useEffect } from "react";
import { View } from "react-native";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type ActivityParticleProps = {
  color: string;
  coreLight: string;
  ringStrong: string;
  ringSoft: string;
  arriving?: boolean;
};

export function ActivityParticle({
  color,
  coreLight,
  ringStrong,
  ringSoft,
  arriving = false,
}: ActivityParticleProps) {
  const particleScale = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(1);

  const particleArrivalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: particleScale.value }],
  }));

  const arrivalRingStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  useEffect(() => {
    if (!arriving) {
      return;
    }

    particleScale.value = 0.7;

    particleScale.value = withDelay(
      620,
      withSequence(
        withTiming(1.35, {
          duration: 180,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        }),
      ),
    );

    ringScale.value = 0.7;
    ringOpacity.value = 0;

    ringScale.value = withDelay(
      620,
      withTiming(1.75, {
        duration: 520,
        easing: Easing.out(Easing.cubic),
      }),
    );

    ringOpacity.value = withDelay(
      620,
      withSequence(
        withTiming(0.8, {
          duration: 120,
        }),
        withTiming(0, {
          duration: 400,
        }),
      ),
    );
  }, [arriving]);

  return (
    <View className="h-16 w-16 items-center justify-center">
      <View
        className="absolute h-16 w-16 rounded-full"
        style={{
          backgroundColor: color,
          opacity: 0.07,
          shadowColor: color,
          shadowOpacity: 0.65,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 0 },
        }}
      />

      <View
        className="absolute h-[54px] w-[54px] rounded-full border"
        style={{ borderColor: ringSoft }}
      />

      <View
        className="absolute right-[4px] top-[21px] h-[4px] w-[4px] rounded-full"
        style={{
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 1,
          shadowRadius: 7,
          shadowOffset: { width: 0, height: 0 },
        }}
      />

      <View
        className="absolute h-[42px] w-[42px] rounded-full border"
        style={{ borderColor: ringStrong }}
      />

      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{
          backgroundColor: color,
          opacity: 0.22,
        }}
      >
        {arriving ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                width: 54,
                height: 54,
                borderRadius: 27,
                borderWidth: 1.5,
                borderColor: color,
              },
              arrivalRingStyle,
            ]}
          />
        ) : null}

        <Animated.View style={particleArrivalStyle}>
          <View
            className="h-5 w-5 items-center justify-center rounded-full"
            style={{
              backgroundColor: color,
              shadowColor: color,
              shadowOpacity: 1,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: coreLight }}
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
