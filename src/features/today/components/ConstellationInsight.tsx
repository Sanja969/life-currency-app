import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/theme/colors";
import { formatDuration } from "@/utils/formatDuration";

export type ConstellationInsightData = {
  title: string;
  color: string;
  count: number;
  duration: number;
  description: string;
  question: string;
};

type ConstellationInsightProps = {
  visible: boolean;
  data: ConstellationInsightData | null;
  onClose: () => void;
};

export function ConstellationInsight({
  visible,
  data,
  onClose,
}: ConstellationInsightProps) {
  if (!data) {
    return null;
  }

  function handleViewActivities() {
    onClose();
    router.push("/activities");
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close insight"
        />

        <View style={styles.sheet}>
          {/* HANDLE */}

          <View style={styles.handle} />

          {/* HEADER */}

          <View style={styles.header}>
            <View
              style={[
                styles.iconFrame,
                {
                  backgroundColor: `${data.color}18`,
                  borderColor: `${data.color}55`,
                },
              ]}
            >
              <Ionicons name="sparkles-outline" size={22} color={data.color} />
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
            >
              <Ionicons name="close" size={23} color={COLORS.muted} />
            </Pressable>
          </View>

          {/* TITLE */}

          <Text style={styles.eyebrow}>YOUR INNER UNIVERSE</Text>

          <Text style={styles.title}>{data.title}</Text>

          {/* STATISTICS */}

          <View style={styles.statistics}>
            <View>
              <Text style={styles.statValue}>
                {formatDuration(data.duration)}
              </Text>

              <Text style={styles.statLabel}>TIME RECORDED</Text>
            </View>

            <View>
              <Text style={styles.statValue}>{data.count}</Text>

              <Text style={styles.statLabel}>
                {data.count === 1 ? "ACTIVITY" : "ACTIVITIES"}
              </Text>
            </View>
          </View>

          {/* DESCRIPTION */}

          <Text style={styles.description}>{data.description}</Text>

          {/* REFLECTION QUESTION */}

          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>A QUESTION WORTH EXPLORING</Text>

            <Text style={styles.question}>{data.question}</Text>
          </View>

          {/* ACTION */}

          <Pressable
            onPress={handleViewActivities}
            style={styles.actionButton}
            accessibilityRole="button"
          >
            <Text style={styles.actionText}>Explore activities</Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color={COLORS.background}
            />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
  },

  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderColor: COLORS.goldBorder,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 42,
  },

  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 25,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconFrame: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 22,
  },

  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: "600",
    marginTop: 8,
  },

  statistics: {
    flexDirection: "row",
    gap: 45,
    marginTop: 27,
    marginBottom: 22,
  },

  statValue: {
    color: COLORS.lightGold,
    fontSize: 25,
    fontWeight: "600",
  },

  statLabel: {
    color: COLORS.subtle,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginTop: 7,
  },

  description: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 21,
  },

  questionCard: {
    backgroundColor: COLORS.goldBackground,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    padding: 18,
    marginTop: 26,
  },

  questionLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  question: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 25,
    marginTop: 12,
  },

  actionButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 27,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  actionText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: "700",
  },
});
