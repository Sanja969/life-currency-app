import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import eclipseImage from "@assets/images/cosmic-eclipse.png";

import { formatDuration } from "@/utils/formatDuration";

type UniverseBlackHoleProps = {
  duration: number;
  size?: number;
};

export function UniverseBlackHole({
  duration,
  size = 140,
}: UniverseBlackHoleProps) {
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(pulse);

    if (reducedMotion) {
      pulse.value = 1;
      return;
    }

    pulse.value = withRepeat(
      withTiming(1.045, {
        duration: 6000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    return () => cancelAnimation(pulse);
  }, [pulse, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View
      pointerEvents="none"
      style={[styles.container, { width: size, height: size }]}
    >
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image
          source={eclipseImage}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.content}>
        <Text
          style={[styles.duration, { fontSize: size < 140 ? 17 : 19 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatDuration(duration)}
        </Text>

        <Text style={styles.caption}>TIME OBSERVED</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  content: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  duration: {
    color: "#F7D8A7",
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
    textShadowColor: "rgba(245, 190, 110, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  caption: {
    color: "#D4B88D",
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 5,
    textAlign: "center",
  },
  imageContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
