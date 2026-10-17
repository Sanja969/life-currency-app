import { useCallback, useRef, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  View,
  Text,
  Pressable,
} from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Section } from "@/components/ui/section";

import { TodayOverview } from "./components/TodayOverview";
import { LifeMandala } from "./components/LifeMandala";
import { TodaySignal } from "./components/TodaySignal";
import { TodayActivitySummary } from "./components/TodayActivitySummary";
import { DailyReflectionCard } from "./components/DailyReflectionCard";
import { TheSpaceBetween } from "./components/TheSpaceBetween";

import { useToday } from "./hooks/useToday";
import { COLORS } from "@/theme/colors";

import { router } from "expo-router";

type TodayProps = {
  scrollRef?: React.RefObject<ScrollView | null>;
};

export function Today({ scrollRef }: TodayProps) {
  const { activities, statistics, isLoading, errorMessage } = useToday();

  const [suggestedQuestion, setSuggestedQuestion] = useState<string | null>(
    null,
  );

  const [openRequestId, setOpenRequestId] = useState(0);

  const reflectionY = useRef(0);

  const handleReflect = useCallback(
    (question: string) => {
      setSuggestedQuestion(question);

      setOpenRequestId((previous) => previous + 1);

      requestAnimationFrame(() => {
        scrollRef?.current?.scrollTo({
          y: Math.max(0, reflectionY.current - 24),
          animated: true,
        });
      });
    },
    [scrollRef],
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  if (errorMessage || !statistics) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.background,
          paddingHorizontal: 24,
        }}
      >
        <AppText>{errorMessage ?? "Unable to load data."}</AppText>
      </View>
    );
  }

  return (
    <View style={{ width: "100%" }}>
      <Section>
        <TodayOverview />
      </Section>

      <Section>
        <LifeMandala activities={activities} />
      </Section>

      <Pressable
        onPress={() => router.push("/my-universe")}
        style={{
          marginTop: 18,
          marginBottom: 24,
          paddingVertical: 16,
          paddingHorizontal: 18,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: "rgba(212,175,55,0.18)",
        }}
      >
        <Text
          style={{
            color: "#D4AF37",
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          YOUR COSMIC JOURNEY
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#F5E6C8",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Your universe is evolving
            </Text>

            <Text
              style={{
                color: "#9A94AA",
                fontSize: 12,
                marginTop: 6,
              }}
            >
              Explore the world you're creating.
            </Text>
          </View>

          <Text
            style={{
              color: "#D4AF37",
              fontSize: 23,
              marginLeft: 12,
            }}
          >
            →
          </Text>
        </View>
      </Pressable>

      <Section>
        <TodaySignal statistics={statistics} onReflect={handleReflect} />
      </Section>

      <Section>
        <TodayActivitySummary statistics={statistics} />
      </Section>
      <Section>
        <TheSpaceBetween activities={activities} />
      </Section>

      <View
        onLayout={(event) => {
          reflectionY.current = event.nativeEvent.layout.y;
        }}
      >
        <Section>
          <DailyReflectionCard
            suggestedQuestion={suggestedQuestion}
            openRequestId={openRequestId}
          />
        </Section>
      </View>
    </View>
  );
}
