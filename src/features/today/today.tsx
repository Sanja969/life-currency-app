import { useCallback, useRef, useState } from "react";

import { ActivityIndicator, ScrollView, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Section } from "@/components/ui/section";

import { TodayOverview } from "./components/TodayOverview";
import { LifeMandala } from "./components/LifeMandala";
import { TodaySignal } from "./components/TodaySignal";
import { TodayActivitySummary } from "./components/TodayActivitySummary";
import { DailyReflectionCard } from "./components/DailyReflectionCard";

import { useToday } from "./hooks/useToday";
import { COLORS } from "@/theme/colors";

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

      <Section>
        <TodaySignal statistics={statistics} onReflect={handleReflect} />
      </Section>

      <Section>
        <TodayActivitySummary statistics={statistics} />
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
