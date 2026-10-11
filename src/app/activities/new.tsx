import { useEffect, useState } from "react";

import { Alert, Keyboard, ScrollView, StyleSheet, View } from "react-native";

import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { ActivityForm } from "@/components/ActivityForm";
import { AppButton } from "@/components/ui/AppButton";
import { setPendingActivityArrival } from "@/lib/activityArrival";
import { activityService } from "@/services/ActivityService";
import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";

import {
  Activity,
  ActivityClassification,
  ActivityInput,
} from "@/types/activity";

export default function CreateActivityScreen() {
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>([]);

  const [particleType, setParticleType] = useState<ActivityClassification>(
    ActivityClassification.Serves,
  );

  /*
   * MASTER ANIMATION PROGRESS
   *
   * 0    = hidden
   * 0.15 = particle birth
   * 0.35 = energy build-up
   * 0.60 = quantum wave
   * 1    = particle released into field
   */

  const progress = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  /*
   * LOAD ACTIVITIES
   */

  useEffect(() => {
    async function loadActivities() {
      try {
        const data = await activityService.getAllActivities();

        setActivities(data);
      } catch (error) {
        console.error("Unable to load activities:", error);
      }
    }

    void loadActivities();
  }, []);

  /*
   * ANIMATED STYLES
   */

  const fieldStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  /*
   * CENTRAL PARTICLE
   */

  const particleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.15, 0.35, 0.55, 1],
      [0, 0.35, 1.35, 1, 0.12],
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.08, 0.7, 1],
      [0, 1, 1, 0],
    );

    const translateY = interpolate(progress.value, [0, 0.58, 1], [0, 0, -330]);

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  /*
   * INNER QUANTUM WAVE
   */

  const innerRingStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.25, 0.62, 0.8],
      [0.2, 0.2, 2.8, 4],
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.25, 0.38, 0.75],
      [0, 0, 0.8, 0],
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  /*
   * OUTER QUANTUM WAVE
   */

  const outerRingStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.32, 0.7, 0.9],
      [0.15, 0.15, 4.2, 5.5],
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.32, 0.48, 0.86],
      [0, 0, 0.55, 0],
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  /*
   * PARTICLE GLOW
   */

  const glowStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.18, 0.42, 0.65],
      [0, 0.4, 1.8, 2.6],
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.15, 0.35, 0.7],
      [0, 0.2, 0.7, 0],
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  /*
   * QUANTUM DUST
   */

  const dustStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.2, 0.55, 0.85],
      [0.2, 0.5, 1.3, 1.8],
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.18, 0.4, 0.8],
      [0, 0, 1, 0],
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  /*
   * VERTICAL ENERGY TRAIL
   */

  const trailStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.5, 0.65, 1],
      [0, 0, 0.7, 0],
    );

    const scaleY = interpolate(progress.value, [0.5, 0.75, 1], [0.1, 1, 1.6]);

    return {
      opacity,
      transform: [{ scaleY }],
    };
  });

  /*
   * ANIMATION
   */

  function finishCreation() {
    router.back();
  }

  function playCreationAnimation() {
    progress.value = 0;
    overlayOpacity.value = 0;

    overlayOpacity.value = withTiming(1, {
      duration: 180,
    });

    progress.value = withSequence(
      /*
       * PARTICLE BIRTH
       */

      withTiming(0.18, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      }),

      /*
       * ENERGY BUILDS
       */

      withTiming(0.38, {
        duration: 330,
        easing: Easing.out(Easing.cubic),
      }),

      /*
       * QUANTUM WAVE EXPANDS
       */

      withTiming(0.64, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }),

      /*
       * SUSPENSION
       */

      withDelay(
        100,
        withTiming(0.68, {
          duration: 100,
        }),
      ),

      /*
       * PARTICLE RELEASE
       */

      withTiming(
        1,
        {
          duration: 800,
          easing: Easing.inOut(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(finishCreation)();
          }
        },
      ),
    );
  }

  /*
   * CREATE ACTIVITY
   */

  async function handleCreate(data: ActivityInput): Promise<void> {
    try {
      await activityService.createActivity(data);

      Keyboard.dismiss();

      setParticleType(data.classification);

      setPendingActivityArrival({
        activityDate: data.activityDate.toISOString(),
        classification: data.classification,
      });

      requestAnimationFrame(() => {
        playCreationAnimation();
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Activity overlaps")
      ) {
        throw error;
      }

      Alert.alert(
        "Unable to create activity",
        error instanceof Error ? error.message : "Something went wrong.",
      );

      throw error;
    }
  }

  /*
   * CENTRALIZED PARTICLE THEME
   */

  const classificationTheme = CLASSIFICATION_THEME[particleType];

  const particlePalette = classificationTheme.particle;

  const particleCoreColor = particlePalette.core;
  const particleColor = classificationTheme.color;
  const glowColor = particlePalette.glow;
  const ringColor = particlePalette.ring;
  const particleInnerColor = particlePalette.inner;

  return (
    <View style={styles.screen}>
      {/* NORMAL SCREEN */}

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* BACK BUTTON */}

        <View style={styles.header}>
          <AppButton
            variant="icon"
            tone="secondary"
            icon="chevron-back"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          />
        </View>

        {/* ACTIVITY FORM */}

        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ActivityForm
            mode="create"
            activities={activities}
            onSubmit={handleCreate}
          />
        </ScrollView>
      </SafeAreaView>

      {/* QUANTUM CREATION OVERLAY */}

      <Animated.View
        pointerEvents="none"
        style={[styles.animationOverlay, fieldStyle]}
      >
        {/* DARKEN BACKGROUND */}

        <View style={styles.animationBackdrop} />

        {/* PARTICLE ORIGIN */}

        <View style={styles.particleOrigin}>
          {/* LARGE GLOW */}

          <Animated.View
            style={[
              styles.largeGlow,
              { backgroundColor: glowColor },
              glowStyle,
            ]}
          />

          {/* OUTER QUANTUM WAVE */}

          <Animated.View
            style={[
              styles.outerRing,
              { borderColor: ringColor },
              outerRingStyle,
            ]}
          />

          {/* INNER QUANTUM WAVE */}

          <Animated.View
            style={[
              styles.innerRing,
              { borderColor: ringColor },
              innerRingStyle,
            ]}
          />

          {/* ENERGY TRAIL */}

          <Animated.View
            style={[
              styles.energyTrail,
              { backgroundColor: particleColor },
              trailStyle,
            ]}
          />

          {/* QUANTUM DUST */}

          <Animated.View style={[styles.quantumDust, dustStyle]}>
            <View
              style={[
                styles.dustParticle,
                {
                  left: -90,
                  top: -45,
                  width: 5,
                  height: 5,
                  backgroundColor: particleCoreColor,
                },
              ]}
            />

            <View
              style={[
                styles.dustParticle,
                {
                  left: 68,
                  top: -58,
                  width: 4,
                  height: 4,
                  backgroundColor: particleColor,
                },
              ]}
            />

            <View
              style={[
                styles.dustParticle,
                {
                  left: -62,
                  top: 56,
                  width: 4,
                  height: 4,
                  backgroundColor: "#FFFFFF",
                },
              ]}
            />

            <View
              style={[
                styles.dustParticle,
                {
                  left: 92,
                  top: 28,
                  width: 6,
                  height: 6,
                  backgroundColor: particleColor,
                },
              ]}
            />

            <View
              style={[
                styles.dustParticle,
                {
                  left: 30,
                  top: 82,
                  width: 3,
                  height: 3,
                  backgroundColor: "#FFFFFF",
                },
              ]}
            />

            <View
              style={[
                styles.dustParticle,
                {
                  left: -105,
                  top: 10,
                  width: 3,
                  height: 3,
                  backgroundColor: particleColor,
                },
              ]}
            />
          </Animated.View>

          {/* NEW PARTICLE */}

          <Animated.View
            style={[
              styles.particleGlow,
              { backgroundColor: glowColor },
              particleStyle,
            ]}
          >
            <View
              style={[
                styles.particleInner,
                {
                  backgroundColor: particleInnerColor,
                },
              ]}
            >
              <View
                style={[
                  styles.particleCore,
                  {
                    backgroundColor: particleColor,
                    shadowColor: particleColor,
                  },
                ]}
              >
                <View
                  style={[
                    styles.particleCenter,
                    {
                      backgroundColor: particleCoreColor,
                    },
                  ]}
                />
              </View>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  /*
   * SCREEN
   */

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },

  /*
   * ANIMATION OVERLAY
   */

  animationOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10000,
    elevation: 10000,
  },

  animationBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(1,3,12,0.45)",
  },

  particleOrigin: {
    position: "absolute",
    top: "46%",
    left: "50%",
    width: 0,
    height: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  /*
   * QUANTUM EFFECTS
   */

  largeGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    marginLeft: -90,
    marginTop: -90,
    borderRadius: 90,
  },

  outerRing: {
    position: "absolute",
    width: 90,
    height: 90,
    marginLeft: -45,
    marginTop: -45,
    borderRadius: 45,
    borderWidth: 1,
  },

  innerRing: {
    position: "absolute",
    width: 70,
    height: 70,
    marginLeft: -35,
    marginTop: -35,
    borderRadius: 35,
    borderWidth: 1.5,
  },

  energyTrail: {
    position: "absolute",
    width: 3,
    height: 260,
    left: -1.5,
    top: -260,
    borderRadius: 2,
    transformOrigin: "bottom",
  },

  quantumDust: {
    position: "absolute",
    width: 1,
    height: 1,
  },

  dustParticle: {
    position: "absolute",
    borderRadius: 3,
  },

  /*
   * CENTRAL PARTICLE
   */

  particleGlow: {
    position: "absolute",
    width: 84,
    height: 84,
    marginLeft: -42,
    marginTop: -42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 42,
  },

  particleInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },

  particleCore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  particleCenter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: "#FFFFFF",
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
});
