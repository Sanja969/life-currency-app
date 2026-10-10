import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { useOnboardingCompletion } from "@/lib/OnboardingContext";
import { completeOnboarding } from "@/lib/onboarding";

const COLORS = {
  background: "#080A10",
  gold: "#D6AD65",
  lightGold: "#F3D49B",
  text: "#F5F0E7",
  muted: "#B1AAA1",
};

const STEPS = [
  {
    eyebrow: "01 — THE VALUE OF TIME",
    title: "Time is your most\nvaluable currency.",
    description:
      "Every moment is precious. Discover the true value of the time you have.",
    image: require("@assets/onboarding/time.jpg"),
  },
  {
    eyebrow: "02 — YOUR DAILY MOMENTS",
    title: "See where your\ntime goes.",
    description:
      "Track your daily activities and discover how your moments shape your life.",
    image: require("@assets/onboarding/track.jpg"),
  },
  {
    eyebrow: "03 — YOUR ENERGY",
    title: "Invest in what\nmakes you grow.",
    description:
      "Recognize what gives you energy, what drains it, and what truly matters.",
    image: require("@assets/onboarding/grow.jpg"),
  },
  {
    eyebrow: "04 — YOUR LIFE FIELD",
    title: "Create a more\nmeaningful life.",
    description:
      "See the patterns of your time. Make conscious choices. Let your life take shape.",
    image: require("@assets/onboarding/life-field.jpg"),
  },
] as const;

export default function OnboardingScreen() {
  const { markOnboardingCompleted } = useOnboardingCompletion();

  const { width, height } = useWindowDimensions();

  const [stepIndex, setStepIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const fade = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1)).current;

  const isTablet = width >= 768;
  const isCompact = height < 720;

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  useEffect(() => {
    fade.setValue(0);
    translateY.setValue(18);
    imageScale.setValue(1.045);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [stepIndex, fade, translateY, imageScale]);

  function handleNext() {
    if (isFinishing) return;

    if (!isLastStep) {
      setStepIndex((current) => current + 1);
      return;
    }

    void handleFinish();
  }

  function handleBack() {
    if (isFinishing || stepIndex === 0) return;

    setStepIndex((current) => current - 1);
  }

  async function handleFinish() {
    if (isFinishing) return;

    try {
      setIsFinishing(true);

      await completeOnboarding();
      markOnboardingCompleted();

      router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      setIsFinishing(false);
    }
  }

  return (
    <View style={styles.screen}>
      {/* FULL-SCREEN BACKGROUND */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: fade,
            transform: [{ scale: imageScale }],
          },
        ]}
      >
        <ImageBackground
          source={step.image}
          resizeMode="cover"
          imageStyle={{
            opacity: 0.9,
          }}
          style={styles.backgroundImage}
        />
      </Animated.View>

      {/* ATMOSPHERIC OVERLAY */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(8,10,16,0.35)",
          "rgba(8,10,16,0.04)",
          "rgba(8,10,16,0.18)",
          "rgba(8,10,16,0.78)",
          "#080A10",
        ]}
        locations={[0, 0.22, 0.48, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* WARM GOLDEN ATMOSPHERE */}
      <LinearGradient
        pointerEvents="none"
        colors={["transparent", "rgba(169,110,44,0.06)", "transparent"]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View
          style={[
            styles.content,
            {
              maxWidth: isTablet ? 760 : 500,
              paddingHorizontal: isTablet ? 48 : 28,
            },
          ]}
        >
          {/* TOP BAR */}
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandDot} />

              <Text style={styles.brandText}>LIFE CURRENCY</Text>
            </View>

            <Text style={styles.counter}>
              {String(stepIndex + 1).padStart(2, "0")}
              {" / "}
              {String(STEPS.length).padStart(2, "0")}
            </Text>
          </View>

          {/* SPACE RESERVED FOR ARTWORK */}
          <View style={styles.artworkSpace} />

          {/* TEXT */}
          <Animated.View
            style={[
              styles.textContent,
              {
                opacity: fade,
                transform: [{ translateY }],
                paddingBottom: isCompact ? 22 : 30,
              },
            ]}
          >
            <Text style={styles.eyebrow}>{step.eyebrow}</Text>

            <Text
              style={[
                styles.title,
                {
                  fontSize: isTablet ? 52 : isCompact ? 33 : 39,
                  lineHeight: isTablet ? 62 : isCompact ? 40 : 48,
                },
              ]}
            >
              {step.title}
            </Text>

            <Text style={styles.goldSparkle}>✦</Text>

            <Text
              style={[
                styles.description,
                {
                  fontSize: isTablet ? 17 : 14,
                  lineHeight: isTablet ? 27 : 23,
                },
              ]}
            >
              {step.description}
            </Text>
          </Animated.View>

          {/* BOTTOM NAVIGATION */}
          <View style={styles.footer}>
            <View style={styles.leftNavigation}>
              {stepIndex > 0 && (
                <Pressable
                  onPress={handleBack}
                  disabled={isFinishing}
                  accessibilityRole="button"
                  accessibilityLabel="Previous step"
                  style={styles.backButton}
                >
                  <Ionicons
                    name="arrow-back"
                    size={19}
                    color={COLORS.lightGold}
                  />
                </Pressable>
              )}

              <View style={styles.dots}>
                {STEPS.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === stepIndex
                        ? styles.activeDot
                        : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            </View>

            <AppButton
              variant="onboarding"
              icon={isLastStep ? "checkmark" : "arrow-forward"}
              onPress={handleNext}
              loading={isFinishing}
            >
              {isLastStep ? "Begin" : "Next"}
            </AppButton>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },

  header: {
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },

  brandText: {
    color: COLORS.lightGold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.3,
  },

  counter: {
    color: "rgba(245,240,231,0.65)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
  },

  artworkSpace: {
    flex: 1,
    minHeight: 20,
  },

  textContent: {
    width: "100%",
  },

  eyebrow: {
    color: COLORS.lightGold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.1,
    marginBottom: 18,
  },

  title: {
    color: COLORS.text,
    fontWeight: "700",
    letterSpacing: -1.2,
  },

  goldSparkle: {
    color: "#D6AD65",
    fontSize: 18,
    fontWeight: "300",
    marginTop: 16,
    marginBottom: 14,
    opacity: 0.85,
  },

  description: {
    color: COLORS.muted,
    maxWidth: 440,
    fontWeight: "400",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 15,
    minHeight: 78,
  },

  leftNavigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  dot: {
    height: 6,
    borderRadius: 3,
  },

  activeDot: {
    width: 23,
    backgroundColor: COLORS.lightGold,
  },

  inactiveDot: {
    width: 6,
    backgroundColor: "rgba(243,212,155,0.25)",
  },
});
