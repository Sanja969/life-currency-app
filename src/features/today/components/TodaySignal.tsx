import { Ionicons } from "@expo/vector-icons";
import { Text, View, StyleSheet } from "react-native";

import {
  ActivityCategoryStatistics,
  ActivityStatistics,
} from "@/types/activity";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";

import { formatDuration } from "@/utils/formatDuration";
import { CosmicPanel } from "@/components/ui/CosmicPanel";

type TodaySignalProps = {
  statistics: ActivityStatistics;
};

const COLORS = {
  background: "#080A10",
  surface: "#101119",
  gold: "#D6AD65",
  lightGold: "#F3D49B",
  growing: "#8274E8",
  leaks: "#D88455",
  text: "#F5F0E7",
  muted: "#9295A5",
};

type SignalTone = "neutral" | "growing" | "leaks";

function getSignal(
  strongestInvestment?: ActivityCategoryStatistics,
  biggestLeak?: ActivityCategoryStatistics,
): {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  tone: SignalTone;
} {
  if (!strongestInvestment && !biggestLeak) {
    return {
      icon: "sparkles-outline",
      title: "Your field is still forming",
      message:
        "Trace more of your day to reveal where your time is creating energy.",
      tone: "neutral",
    };
  }

  if (strongestInvestment && !biggestLeak) {
    const category = getActivityCategoryMeta(strongestInvestment.category);

    return {
      icon: "trending-up-outline",
      title: "Strong investment today",
      message: `${category.label} is your strongest investment with ${formatDuration(
        strongestInvestment.servesDurationMinutes,
      )} of Growing time.`,
      tone: "growing",
    };
  }

  if (!strongestInvestment && biggestLeak) {
    const category = getActivityCategoryMeta(biggestLeak.category);

    return {
      icon: "trending-down-outline",
      title: "Main leak today",
      message: `${category.label} is your biggest Life Leak with ${formatDuration(
        biggestLeak.doesNotServeDurationMinutes,
      )}.`,
      tone: "leaks",
    };
  }

  if (
    strongestInvestment &&
    biggestLeak &&
    strongestInvestment.servesDurationMinutes >=
      biggestLeak.doesNotServeDurationMinutes
  ) {
    const category = getActivityCategoryMeta(strongestInvestment.category);

    return {
      icon: "sparkles-outline",
      title: "Your strongest signal",
      message: `${category.label} is leading your day with ${formatDuration(
        strongestInvestment.servesDurationMinutes,
      )} of Growing time.`,
      tone: "growing",
    };
  }

  const category = getActivityCategoryMeta(biggestLeak!.category);

  return {
    icon: "pulse-outline",
    title: "Watch this pattern",
    message: `${category.label} is your largest Life Leak today at ${formatDuration(
      biggestLeak!.doesNotServeDurationMinutes,
    )}.`,
    tone: "leaks",
  };
}

export function TodaySignal({ statistics }: TodaySignalProps) {
  const signal = getSignal(
    statistics.strongestInvestment,
    statistics.biggestLeak,
  );

  const accent =
    signal.tone === "neutral"
      ? COLORS.gold
      : signal.tone === "growing"
        ? COLORS.growing
        : COLORS.leaks;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>TODAY'S SIGNAL</Text>

      <CosmicPanel
        variant="signal"
        accent={accent}
        contentStyle={styles.content}
      >
        <View>
          <View style={styles.topRow}>
            <View style={styles.iconFrame}>
              <Ionicons name={signal.icon} size={18} color={accent} />
            </View>

            <Text style={styles.systemLabel}>LIFE INTELLIGENCE</Text>
          </View>

          <Text style={styles.title}>{signal.title}</Text>

          <Text style={styles.message}>{signal.message}</Text>

          <View style={styles.bottomRow}>
            <View style={[styles.signalDot, { backgroundColor: accent }]} />

            <Text style={styles.statusText}>
              {signal.tone === "neutral"
                ? "AWAITING ACTIVITY"
                : "SIGNAL DETECTED"}
            </Text>

            <View style={styles.bottomLine} />
          </View>
        </View>
      </CosmicPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 26,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: COLORS.gold,
    marginBottom: 12,
  },

  panel: {
    position: "relative",
    minHeight: 145,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconFrame: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.20)",
    backgroundColor: "rgba(214,173,101,0.055)",
  },

  systemLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#77716B",
  },

  title: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },

  message: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },

  bottomRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  signalDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  statusText: {
    marginLeft: 7,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "#77716B",
  },

  bottomLine: {
    flex: 1,
    height: 1,
    marginLeft: 12,
    backgroundColor: "rgba(214,173,101,0.12)",
  },
});
