import { useEffect, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { getDailyThought } from "../data/dailyThoughts";
import { ThoughtDetails } from "./ThoughtDetails";
import { COLORS } from "@/theme/colors";

const WARM_WHITE = "#EAE4DC";

function ThoughtStar() {
  const reducedMotion = useReducedMotion();
  const glow = useSharedValue(0.45);

  useEffect(() => {
    if (reducedMotion) {
      glow.value = 0.8;
      return;
    }

    glow.value = withRepeat(
      withTiming(1, {
        duration: 3200,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    return () => cancelAnimation(glow);
  }, [glow, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [
      {
        scale: 0.8 + glow.value * 0.25,
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="sparkles-outline" size={15} color={COLORS.lightGold} />
    </Animated.View>
  );
}

export function DailyThought() {
  const [visible, setVisible] = useState(false);
  const [today, setToday] = useState(() => new Date());

  const thought = getDailyThought(today);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      setToday((previous) => {
        const sameDay =
          previous.getFullYear() === now.getFullYear() &&
          previous.getMonth() === now.getMonth() &&
          previous.getDate() === now.getDate();

        return sameDay ? previous : now;
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.goldDot} />

            <Text style={styles.eyebrow}>A THOUGHT IN TIME</Text>
          </View>

          <ThoughtStar />
        </View>

        <Text style={styles.quote}>“{thought.quote}”</Text>

        <Text style={styles.author}>— {thought.author}</Text>

        <Pressable
          onPress={() => setVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Explore today's thought"
          style={({ pressed }) => [
            styles.exploreButton,
            pressed && { opacity: 0.65 },
          ]}
        >
          <Text style={styles.exploreText}>EXPLORE THIS THOUGHT</Text>

          <Ionicons name="arrow-forward" size={13} color={COLORS.gold} />
        </Pressable>

        <Pressable
          onPress={() => router.push("/thought-library")}
          accessibilityRole="button"
          accessibilityLabel="Explore all thoughts"
          style={styles.libraryButton}
        >
          <Text style={styles.libraryText}>Explore all thoughts</Text>

          <Ionicons name="arrow-forward" size={13} color={COLORS.muted} />
        </Pressable>
      </View>

      <ThoughtDetails
        thought={thought}
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    paddingTop: 13,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.gold}25`,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.6,
  },

  quote: {
    color: WARM_WHITE,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    marginTop: 10,
  },

  author: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 6,
  },

  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    marginTop: 8,
    paddingVertical: 7,
  },

  exploreText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  libraryButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    paddingVertical: 7,
    marginTop: 1,
  },

  libraryText: {
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
