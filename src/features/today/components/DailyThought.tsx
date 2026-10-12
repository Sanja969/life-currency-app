import { useEffect, useState } from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import {
  DailyThought as DailyThoughtType,
  getDailyThought,
} from "../data/dailyThoughts";

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

function ThoughtDetails({
  thought,
  visible,
  onClose,
}: {
  thought: DailyThoughtType;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close thought"
        />

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetEyebrowRow}>
              <View style={styles.goldDot} />

              <Text style={styles.sheetEyebrow}>A THOUGHT IN TIME</Text>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
            >
              <Ionicons name="close" size={23} color={COLORS.muted} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <Text style={styles.sheetQuote}>“{thought.quote}”</Text>

            <Text style={styles.sheetAuthor}>— {thought.author}</Text>

            <Text style={styles.sheetSource}>{thought.source}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>BEYOND THE WORDS</Text>

            <Text style={styles.explanation}>{thought.explanation}</Text>

            <View style={styles.reflectionContainer}>
              <View style={styles.reflectionHeader}>
                <Ionicons
                  name="sparkles-outline"
                  size={15}
                  color={COLORS.gold}
                />

                <Text style={styles.sectionLabel}>A MOMENT TO REFLECT</Text>
              </View>

              <Text style={styles.reflectionText}>{thought.reflection}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function DailyThought() {
  const [visible, setVisible] = useState(false);

  const [today, setToday] = useState(() => new Date());

  const thought = getDailyThought(today);

  /*
   * Recheck the calendar day while the component is mounted.
   * This also handles returning to the app after midnight.
   */
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

  /*
   * MODAL
   */

  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.75)",
  },

  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderTopWidth: 1,
    borderColor: `${COLORS.gold}50`,
    paddingHorizontal: 23,
    paddingTop: 22,
    paddingBottom: 35,
    maxHeight: "85%",
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sheetEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  sheetEyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  sheetContent: {
    paddingBottom: 15,
  },

  sheetQuote: {
    color: WARM_WHITE,
    fontSize: 22,
    lineHeight: 33,
    fontStyle: "italic",
    marginTop: 30,
  },

  sheetAuthor: {
    color: COLORS.lightGold,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 17,
  },

  sheetSource: {
    color: COLORS.subtle,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: `${COLORS.gold}25`,
    marginVertical: 26,
  },

  sectionLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.3,
  },

  explanation: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 23,
    marginTop: 12,
  },

  reflectionContainer: {
    marginTop: 27,
    padding: 17,
    backgroundColor: `${COLORS.gold}0D`,
    borderWidth: 1,
    borderColor: `${COLORS.gold}30`,
    borderRadius: 12,
  },

  reflectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  reflectionText: {
    color: WARM_WHITE,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
});
