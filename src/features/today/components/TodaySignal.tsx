import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";

import { ActivityClassification, ActivityStatistics } from "@/types/activity";

import { formatDuration } from "@/utils/formatDuration";

type TodaySignalProps = {
  statistics: ActivityStatistics;
};

type SignalTone = "neutral" | ActivityClassification;

type Signal = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  tone: SignalTone;
};

/*
 * GENERATE TODAY'S INSIGHT
 *
 * Insights are based on recorded activities,
 * not assumptions about the user's emotions
 * or the objective quality of their day.
 */

function getSignal(statistics: ActivityStatistics): Signal {
  const {
    servesDurationMinutes,
    restoresDurationMinutes,
    doesNotServeDurationMinutes,
    totalDurationMinutes,
  } = statistics;

  const growing = servesDurationMinutes;
  const restoring = restoresDurationMinutes;
  const leaks = doesNotServeDurationMinutes;

  const intentionalTime = growing + restoring;

  /*
   * NO ACTIVITIES
   */

  if (totalDurationMinutes === 0) {
    return {
      icon: "sparkles-outline",
      title: "Every moment has meaning",
      message:
        "Start tracing your day to discover what helps you grow, what restores you, and where your time goes.",
      tone: "neutral",
    };
  }

  /*
   * ONLY RESTORING
   */

  if (restoring > 0 && growing === 0 && leaks === 0) {
    return {
      icon: "leaf-outline",
      title: "Making space to recharge",
      message: `You've dedicated ${formatDuration(
        restoring,
      )} to restoration today. Rest is an important part of a meaningful life.`,
      tone: ActivityClassification.Restores,
    };
  }

  /*
   * ONLY GROWING
   */

  if (growing > 0 && restoring === 0 && leaks === 0) {
    return {
      icon: "sparkles-outline",
      title: "Time invested in yourself",
      message: `You've spent ${formatDuration(
        growing,
      )} on activities you've classified as supporting your growth.`,
      tone: ActivityClassification.Serves,
    };
  }

  /*
   * ONLY LIFE LEAKS
   */

  if (leaks > 0 && intentionalTime === 0) {
    return {
      icon: "compass-outline",
      title: "Noticing where time goes",
      message: `${formatDuration(
        leaks,
      )} of your recorded time went toward activities you've marked as Life Leaks. Awareness gives you space to decide what matters next.`,
      tone: ActivityClassification.DoesNotServe,
    };
  }

  /*
   * GROWING AND RESTORING ARE
   * APPROXIMATELY BALANCED
   *
   * This is an observation, not an
   * ideal ratio the user should achieve.
   */

  if (
    growing > 0 &&
    restoring > 0 &&
    Math.abs(growing - restoring) <= intentionalTime * 0.2 &&
    intentionalTime >= leaks
  ) {
    return {
      icon: "infinite-outline",
      title: "Growth and restoration",
      message:
        "You've made room for both personal growth and recovery today. Both deserve a place in your life.",
      tone: "neutral",
    };
  }

  /*
   * RESTORING IS DOMINANT
   */

  if (restoring > growing && restoring >= leaks) {
    return {
      icon: "leaf-outline",
      title: "Restoration is leading",
      message: `You've spent ${formatDuration(
        restoring,
      )} on activities you've marked as Restoring today. Making space for recovery can be just as meaningful as pursuing a goal.`,
      tone: ActivityClassification.Restores,
    };
  }

  /*
   * GROWING IS DOMINANT
   */

  if (growing >= restoring && growing >= leaks) {
    return {
      icon: "sparkles-outline",
      title: "Investing in what matters",
      message: `You've dedicated ${formatDuration(
        growing,
      )} to activities you've marked as Growing today. This is where much of your recorded time has been going.`,
      tone: ActivityClassification.Serves,
    };
  }

  /*
   * LIFE LEAKS ARE DOMINANT
   */

  if (leaks > growing && leaks > restoring) {
    return {
      icon: "compass-outline",
      title: "A moment of awareness",
      message: `${formatDuration(
        leaks,
      )} of your recorded time went toward Life Leaks. Does this reflect how you wanted to spend your time today?`,
      tone: ActivityClassification.DoesNotServe,
    };
  }

  /*
   * FALLBACK
   */

  return {
    icon: "sparkles-outline",
    title: "Your day is taking shape",
    message:
      "Every moment you record helps you understand how you're spending your time and what matters to you.",
    tone: "neutral",
  };
}

/*
 * TODAY'S INSIGHT COMPONENT
 */

export function TodaySignal({ statistics }: TodaySignalProps) {
  const signal = getSignal(statistics);

  const accent =
    signal.tone === "neutral"
      ? COLORS.gold
      : CLASSIFICATION_THEME[signal.tone].color;

  const hasActivities = statistics.totalDurationMinutes > 0;

  return (
    <View style={styles.container}>
      {/* SECTION TITLE */}

      <Text style={styles.sectionLabel}>TODAY'S INSIGHT</Text>

      {/* COSMIC PANEL */}

      <CosmicPanel
        variant="signal"
        accent={accent}
        contentStyle={styles.content}
      >
        <View>
          {/* TOP ROW */}

          <View style={styles.topRow}>
            <View
              style={[
                styles.iconFrame,
                {
                  borderColor: `${accent}33`,
                  backgroundColor: `${accent}0E`,
                },
              ]}
            >
              <Ionicons name={signal.icon} size={18} color={accent} />
            </View>

            <Text style={styles.systemLabel}>YOUR TIME PATTERNS</Text>
          </View>

          {/* INSIGHT TITLE */}

          <Text style={styles.title}>{signal.title}</Text>

          {/* INSIGHT MESSAGE */}

          <Text style={styles.message}>{signal.message}</Text>

          {/* STATUS */}

          <View style={styles.bottomRow}>
            <View
              style={[
                styles.signalDot,
                {
                  backgroundColor: accent,
                },
              ]}
            />

            <Text style={styles.statusText}>
              {hasActivities ? "BASED ON YOUR ACTIVITIES" : "AWAITING ACTIVITY"}
            </Text>

            <View style={styles.bottomLine} />
          </View>
        </View>
      </CosmicPanel>
    </View>
  );
}

/*
 * STYLES
 */

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
  },

  systemLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: COLORS.subtle,
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
    color: COLORS.subtle,
  },

  bottomLine: {
    flex: 1,
    height: 1,
    marginLeft: 12,
    backgroundColor: COLORS.goldBorder,
    opacity: 0.5,
  },
});
