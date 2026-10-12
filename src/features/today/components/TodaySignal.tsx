import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";

import { ActivityClassification, ActivityStatistics } from "@/types/activity";

type TodaySignalProps = {
  statistics: ActivityStatistics;
  onReflect?: (question: string) => void;
};

type ReflectionTheme = {
  title: string;
  description: string;
  question: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function getReflectionTheme(statistics: ActivityStatistics): ReflectionTheme {
  const growing = CLASSIFICATION_THEME[ActivityClassification.Serves];

  const restoring = CLASSIFICATION_THEME[ActivityClassification.Restores];

  const leaks = CLASSIFICATION_THEME[ActivityClassification.DoesNotServe];

  if (statistics.totalDurationMinutes === 0) {
    return {
      title: "The beginning of awareness",
      description:
        "Understanding your life begins with noticing how you spend your moments.",
      question: "What would you like to make more room for today?",
      color: COLORS.gold,
      icon: "sparkles-outline",
    };
  }

  const durations = [
    {
      classification: ActivityClassification.Serves,
      duration: statistics.servesDurationMinutes,
    },
    {
      classification: ActivityClassification.Restores,
      duration: statistics.restoresDurationMinutes,
    },
    {
      classification: ActivityClassification.DoesNotServe,
      duration: statistics.doesNotServeDurationMinutes,
    },
  ];

  durations.sort((a, b) => b.duration - a.duration);

  if (durations[0].duration === durations[1].duration) {
    return {
      title: "The many sides of your day",
      description:
        "A meaningful life can hold growth, rest, and moments of uncertainty at the same time.",
      question: "Which moments felt most aligned with what matters to you?",
      color: COLORS.gold,
      icon: "planet-outline",
    };
  }

  switch (durations[0].classification) {
    case ActivityClassification.Serves:
      return {
        title: "Becoming",
        description:
          "Growth isn't always about achievement. Sometimes it's about discovering who you want to become.",
        question:
          "What part of yourself are you developing through your choices?",
        color: growing.color,
        icon: "leaf-outline",
      };

    case ActivityClassification.Restores:
      return {
        title: "The art of restoration",
        description:
          "Rest can be more than a pause. It can create space to reconnect with yourself.",
        question: "What genuinely restores you, beyond simply taking a break?",
        color: restoring.color,
        icon: "water-outline",
      };

    case ActivityClassification.DoesNotServe:
      return {
        title: "The unexamined moments",
        description:
          "Some habits happen almost automatically. Noticing them can be the beginning of understanding.",
        question: "What might you have been looking for in those moments?",
        color: leaks.color,
        icon: "moon-outline",
      };
  }
}

export function TodaySignal({ statistics, onReflect }: TodaySignalProps) {
  const theme = getReflectionTheme(statistics);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>A MOMENT OF INSIGHT</Text>

      <CosmicPanel
        variant="subtle"
        accent={theme.color}
        contentStyle={styles.panelContent}
      >
        <View style={styles.topRow}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: `${theme.color}14`,
                borderColor: `${theme.color}40`,
              },
            ]}
          >
            <Ionicons name={theme.icon} size={19} color={theme.color} />
          </View>

          <Text style={styles.eyebrow}>A QUESTION FOR YOUR INNER WORLD</Text>
        </View>

        <Text style={styles.title}>{theme.title}</Text>

        <Text style={styles.description}>{theme.description}</Text>

        <View style={styles.questionContainer}>
          <Ionicons name="sparkles-outline" size={15} color={theme.color} />

          <Text style={styles.question}>{theme.question}</Text>
        </View>

        {onReflect && (
          <Pressable
            onPress={() => onReflect(theme.question)}
            accessibilityRole="button"
            accessibilityLabel="Reflect on this question"
            style={({ pressed }) => [
              styles.reflectButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.reflectButtonText}>Reflect on this</Text>

            <Ionicons name="arrow-forward" size={16} color={COLORS.gold} />
          </Pressable>
        )}
      </CosmicPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },

  sectionTitle: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 13,
  },

  panelContent: {
    paddingHorizontal: 18,
    paddingVertical: 19,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  eyebrow: {
    color: COLORS.subtle,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    flexShrink: 1,
    textAlign: "right",
  },

  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 17,
  },

  description: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 20,
    marginTop: 9,
  },

  questionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 19,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.gold}20`,
  },

  question: {
    color: COLORS.lightGold,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
    flex: 1,
  },

  reflectButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 8,
    marginTop: 17,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  reflectButtonText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.65,
  },
});
