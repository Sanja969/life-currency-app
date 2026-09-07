import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import {
  ActivityCategory,
  ActivityCategoryStatistics,
  ActivityStatistics,
} from "@/types/activity";

import { formatDuration } from "../utils/formatDuration";

type TodaySignalProps = {
  statistics: ActivityStatistics;
};

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  [ActivityCategory.Work]: "Work",
  [ActivityCategory.Learning]: "Learning",
  [ActivityCategory.Health]: "Health",
  [ActivityCategory.Relationships]: "Relationships",
  [ActivityCategory.Rest]: "Rest",
  [ActivityCategory.Entertainment]: "Entertainment",
  [ActivityCategory.Mindfulness]: "Mindfulness",
  [ActivityCategory.Other]: "Other",
};

function getSignal(
  strongestInvestment?: ActivityCategoryStatistics,
  biggestLeak?: ActivityCategoryStatistics,
) {
  if (!strongestInvestment && !biggestLeak) {
    return {
      icon: "sparkles-outline" as const,
      title: "Your field is still forming",
      message:
        "Trace more of your day to reveal where your time is creating energy.",
      accent: "#718BFF",
    };
  }

  if (strongestInvestment && !biggestLeak) {
    return {
      icon: "trending-up-outline" as const,
      title: "Strong investment today",
      message: `${
        CATEGORY_LABELS[strongestInvestment.category]
      } is your strongest investment with ${formatDuration(
        strongestInvestment.servesDurationMinutes,
      )} of Growing time.`,
      accent: "#718BFF",
    };
  }

  if (!strongestInvestment && biggestLeak) {
    return {
      icon: "trending-down-outline" as const,
      title: "Main leak today",
      message: `${
        CATEGORY_LABELS[biggestLeak.category]
      } is your biggest Life Leak with ${formatDuration(
        biggestLeak.doesNotServeDurationMinutes,
      )}.`,
      accent: "#E657A8",
    };
  }

  if (
    strongestInvestment &&
    biggestLeak &&
    strongestInvestment.servesDurationMinutes >=
      biggestLeak.doesNotServeDurationMinutes
  ) {
    return {
      icon: "sparkles-outline" as const,
      title: "Your strongest signal",
      message: `${
        CATEGORY_LABELS[strongestInvestment.category]
      } is leading your day with ${formatDuration(
        strongestInvestment.servesDurationMinutes,
      )} of Growing time.`,
      accent: "#718BFF",
    };
  }

  return {
    icon: "pulse-outline" as const,
    title: "Watch this pattern",
    message: `${
      CATEGORY_LABELS[biggestLeak!.category]
    } is your largest Life Leak today at ${formatDuration(
      biggestLeak!.doesNotServeDurationMinutes,
    )}.`,
    accent: "#E657A8",
  };
}

export function TodaySignal({ statistics }: TodaySignalProps) {
  const signal = getSignal(
    statistics.strongestInvestment,
    statistics.biggestLeak,
  );

  return (
    <View className="mt-7">
      <Text className="mb-3 text-[11px] font-bold tracking-[1.4px] text-[#65728D]">
        TODAY'S SIGNAL
      </Text>

      <View
        className="rounded-[22px] border p-4"
        style={{
          borderColor:
            signal.accent === "#718BFF"
              ? "rgba(113,139,255,0.24)"
              : "rgba(230,87,168,0.24)",
          backgroundColor:
            signal.accent === "#718BFF"
              ? "rgba(54,72,154,0.10)"
              : "rgba(118,30,80,0.10)",
        }}
      >
        <View className="flex-row items-start">
          <View
            className="h-10 w-10 items-center justify-center rounded-[13px]"
            style={{
              backgroundColor:
                signal.accent === "#718BFF"
                  ? "rgba(113,139,255,0.14)"
                  : "rgba(230,87,168,0.14)",
            }}
          >
            <Ionicons name={signal.icon} size={20} color={signal.accent} />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-[15px] font-semibold text-[#E3E8F3]">
              {signal.title}
            </Text>

            <Text className="mt-1.5 text-[13px] leading-[20px] text-[#8491AA]">
              {signal.message}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
