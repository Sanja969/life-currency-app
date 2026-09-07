import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import { completeOnboarding } from "@/lib/onboarding";

type OnboardingStep = {
  eyebrow: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const STEPS: OnboardingStep[] = [
  {
    eyebrow: "LIFE CURRENCY",
    title: "Your time is your life currency",
    description:
      "Every hour is part of a finite resource. Life Currency helps you see where it goes.",
    icon: "time-outline",
  },
  {
    eyebrow: "YOUR SIGNAL",
    title: "Growing or Life Leak?",
    description:
      "You decide what serves you. Growing time moves your life forward. Life Leaks are the moments you want to understand or change.",
    icon: "pulse-outline",
  },
  {
    eyebrow: "YOUR LIFE FIELD",
    title: "Watch your Life Field emerge",
    description:
      "Trace your activities. As your history grows, Life Currency reveals how your time moves across your life.",
    icon: "sparkles-outline",
  },
];

export default function OnboardingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  function handleNext() {
    if (!isLastStep) {
      setStepIndex((current) => current + 1);
      return;
    }

    void handleFinish();
  }

  async function handleFinish() {
    if (isFinishing) return;

    try {
      setIsFinishing(true);

      await completeOnboarding();

      router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      setIsFinishing(false);
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#030712",
      }}
    >
      <View className="flex-1 px-6 pb-6 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-[11px] font-bold tracking-[2px] text-[#65728D]">
            LIFE CURRENCY
          </Text>

          <Text className="text-[12px] font-medium text-[#65728D]">
            {stepIndex + 1} / {STEPS.length}
          </Text>
        </View>

        <View className="flex-1 justify-center">
          <View
            className="h-[180px] items-center justify-center"
            style={{
              shadowColor: stepIndex === 1 ? "#E657A8" : "#718BFF",
              shadowOpacity: 0.3,
              shadowRadius: 45,
              shadowOffset: {
                width: 0,
                height: 0,
              },
            }}
          >
            <View
              className="h-[126px] w-[126px] items-center justify-center rounded-full border"
              style={{
                borderColor:
                  stepIndex === 1
                    ? "rgba(230, 87, 168, 0.3)"
                    : "rgba(113, 139, 255, 0.3)",
                backgroundColor:
                  stepIndex === 1
                    ? "rgba(230, 87, 168, 0.06)"
                    : "rgba(113, 139, 255, 0.06)",
              }}
            >
              <View
                className="h-[76px] w-[76px] items-center justify-center rounded-full border"
                style={{
                  borderColor:
                    stepIndex === 1
                      ? "rgba(230, 87, 168, 0.55)"
                      : "rgba(113, 139, 255, 0.55)",
                }}
              >
                <Ionicons
                  name={step.icon}
                  size={32}
                  color={stepIndex === 1 ? "#E657A8" : "#8FA3FF"}
                />
              </View>
            </View>
          </View>

          <Text className="mt-8 text-[11px] font-bold tracking-[1.6px] text-[#718BFF]">
            {step.eyebrow}
          </Text>

          <Text className="mt-3 max-w-[330px] text-[34px] font-bold leading-[40px] text-[#F1F4FF]">
            {step.title}
          </Text>

          <Text className="mt-5 max-w-[340px] text-[15px] leading-[24px] text-[#7F8CA8]">
            {step.description}
          </Text>
        </View>

        <View>
          <View className="mb-6 flex-row gap-2">
            {STEPS.map((_, index) => (
              <View
                key={index}
                className="h-[4px] flex-1 rounded-full"
                style={{
                  backgroundColor: index <= stepIndex ? "#718BFF" : "#18233D",
                }}
              />
            ))}
          </View>

          <Pressable
            disabled={isFinishing}
            onPress={handleNext}
            className="h-[58px] items-center justify-center rounded-[20px]"
            style={({ pressed }) => ({
              backgroundColor: "#718BFF",
              opacity: pressed || isFinishing ? 0.75 : 1,
              transform: [
                {
                  scale: pressed ? 0.985 : 1,
                },
              ],
              shadowColor: "#718BFF",
              shadowOpacity: 0.28,
              shadowRadius: 18,
              shadowOffset: {
                width: 0,
                height: 8,
              },
            })}
          >
            <View className="flex-row items-center">
              <Text className="text-[15px] font-bold text-white">
                {isLastStep ? "Start tracing" : "Continue"}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
                style={{ marginLeft: 8 }}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
