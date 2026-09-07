import { useEffect, useState } from "react";

import {
  Alert,
  ImageBackground,
  Keyboard,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { setPendingActivityArrival } from "../../lib/activityArrival";

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

import { ActivityForm } from "../../components/ActivityForm";
import { activityService } from "../../services/ActivityService";

import {
  Activity,
  ActivityClassification,
  ActivityInput,
} from "../../types/activity";

export default function CreateActivityScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{
    source?: string;
  }>();
  const [activities, setActivities] = useState<Activity[]>([]);

  const [particleType, setParticleType] = useState<ActivityClassification>(
    ActivityClassification.Serves,
  );

  /*
   * MASTER PROGRESS
   *
   * 0    = hidden
   * 0.15 = birth
   * 0.35 = energy build-up
   * 0.60 = quantum wave
   * 1    = particle released into field
   */
  const progress = useSharedValue(0);

  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    async function loadActivities() {
      try {
        const data = await activityService.getAllActivities();

        setActivities(data);
      } catch (error) {
        console.error("Unable to load activities:", error);
      }
    }

    loadActivities();
  }, []);

  /*
   * --------------------------------------------------
   * ANIMATED STYLES
   * --------------------------------------------------
   */

  const fieldStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

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

      transform: [
        {
          translateY,
        },
        {
          scale,
        },
      ],
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

      transform: [
        {
          scale,
        },
      ],
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

      transform: [
        {
          scale,
        },
      ],
    };
  });

  /*
   * LARGE GLOW BEHIND PARTICLE
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

      transform: [
        {
          scale,
        },
      ],
    };
  });

  /*
   * LITTLE PARTICLES / QUANTUM DUST
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

      transform: [
        {
          scale,
        },
      ],
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

      transform: [
        {
          scaleY,
        },
      ],
    };
  });

  /*
   * --------------------------------------------------
   * ANIMATION
   * --------------------------------------------------
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
       * SMALL MOMENT OF SUSPENSION
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
   * --------------------------------------------------
   * CREATE
   * --------------------------------------------------
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
   * --------------------------------------------------
   * COLOURS
   * --------------------------------------------------
   */

  const serves = particleType === ActivityClassification.Serves;

  const particleCoreColor = serves ? "#E8F3FF" : "#FFE8F7";

  const particleColor = serves ? "#718BFF" : "#E85BAA";

  const glowColor = serves
    ? "rgba(91, 110, 255, 0.22)"
    : "rgba(220, 70, 160, 0.22)";

  const ringColor = serves
    ? "rgba(151, 170, 255, 0.75)"
    : "rgba(238, 135, 201, 0.75)";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#02040D",
      }}
    >
      {/* ================================================= */}
      {/* NORMAL SCREEN                                     */}
      {/* ================================================= */}

      <ImageBackground
        source={require("../../../assets/add.png")}
        resizeMode="cover"
        style={{
          flex: 1,
        }}
        imageStyle={{
          opacity: 0.62,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(2, 4, 13, 0.62)",
          }}
        />

        <SafeAreaView
          style={{
            flex: 1,
          }}
          edges={["top", "left", "right"]}
        >
          {/* BACK */}

          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 4,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                borderWidth: 1,
                borderColor: "#29395F",
                backgroundColor: "rgba(11,20,43,0.9)",
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* FORM */}

          <ScrollView
            style={{
              flex: 1,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 60,
            }}
          >
            <ActivityForm
              mode="create"
              activities={activities}
              onSubmit={handleCreate}
            />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* ================================================= */}
      {/* QUANTUM CREATION OVERLAY                          */}
      {/* ================================================= */}

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,

            zIndex: 10000,
            elevation: 10000,
          },
          fieldStyle,
        ]}
      >
        {/* DARKEN WORLD WHILE PARTICLE FORMS */}

        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,

            backgroundColor: "rgba(1, 3, 12, 0.45)",
          }}
        />

        {/* PARTICLE BIRTH POSITION */}

        <View
          style={{
            position: "absolute",

            top: "46%",
            left: "50%",

            width: 0,
            height: 0,

            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* LARGE ENERGY GLOW */}

          <Animated.View
            style={[
              {
                position: "absolute",

                width: 180,
                height: 180,

                marginLeft: -90,
                marginTop: -90,

                borderRadius: 90,

                backgroundColor: glowColor,
              },
              glowStyle,
            ]}
          />

          {/* OUTER QUANTUM WAVE */}

          <Animated.View
            style={[
              {
                position: "absolute",

                width: 90,
                height: 90,

                marginLeft: -45,
                marginTop: -45,

                borderRadius: 45,

                borderWidth: 1,
                borderColor: ringColor,
              },
              outerRingStyle,
            ]}
          />

          {/* INNER QUANTUM WAVE */}

          <Animated.View
            style={[
              {
                position: "absolute",

                width: 70,
                height: 70,

                marginLeft: -35,
                marginTop: -35,

                borderRadius: 35,

                borderWidth: 1.5,
                borderColor: ringColor,
              },
              innerRingStyle,
            ]}
          />

          {/* VERTICAL ENERGY TRAIL */}

          <Animated.View
            style={[
              {
                position: "absolute",

                width: 3,
                height: 260,

                left: -1.5,
                top: -260,

                borderRadius: 2,

                backgroundColor: particleColor,

                transformOrigin: "bottom",
              },
              trailStyle,
            ]}
          />

          {/* QUANTUM DUST */}

          <Animated.View
            style={[
              {
                position: "absolute",
                width: 1,
                height: 1,
              },
              dustStyle,
            ]}
          >
            <View
              style={{
                position: "absolute",
                left: -90,
                top: -45,
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: "#B8C7FF",
              }}
            />

            <View
              style={{
                position: "absolute",
                left: 68,
                top: -58,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: particleColor,
              }}
            />

            <View
              style={{
                position: "absolute",
                left: -62,
                top: 56,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: "#FFFFFF",
              }}
            />

            <View
              style={{
                position: "absolute",
                left: 92,
                top: 28,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: particleColor,
              }}
            />

            <View
              style={{
                position: "absolute",
                left: 30,
                top: 82,
                width: 3,
                height: 3,
                borderRadius: 2,
                backgroundColor: "#FFFFFF",
              }}
            />

            <View
              style={{
                position: "absolute",
                left: -105,
                top: 10,
                width: 3,
                height: 3,
                borderRadius: 2,
                backgroundColor: particleColor,
              }}
            />
          </Animated.View>

          {/* ============================================= */}
          {/* NEW PARTICLE                                  */}
          {/* ============================================= */}

          <Animated.View
            style={[
              {
                position: "absolute",

                width: 84,
                height: 84,

                marginLeft: -42,
                marginTop: -42,

                alignItems: "center",
                justifyContent: "center",

                borderRadius: 42,

                backgroundColor: glowColor,
              },
              particleStyle,
            ]}
          >
            <View
              style={{
                width: 58,
                height: 58,

                borderRadius: 29,

                alignItems: "center",
                justifyContent: "center",

                backgroundColor: serves
                  ? "rgba(91,110,255,0.24)"
                  : "rgba(220,70,160,0.24)",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,

                  borderRadius: 18,

                  alignItems: "center",
                  justifyContent: "center",

                  backgroundColor: particleColor,

                  shadowColor: particleColor,
                  shadowOpacity: 1,
                  shadowRadius: 18,
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                }}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,

                    borderRadius: 7,

                    backgroundColor: particleCoreColor,

                    shadowColor: "#FFFFFF",
                    shadowOpacity: 1,
                    shadowRadius: 12,
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                  }}
                />
              </View>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}
