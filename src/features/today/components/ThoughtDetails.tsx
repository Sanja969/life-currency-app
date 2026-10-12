import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type { DailyThought } from "../data/dailyThoughts";
import { COLORS } from "@/theme/colors";

type Props = {
  thought: DailyThought | null;
  visible: boolean;
  onClose: () => void;
};

export function ThoughtDetails({ thought, visible, onClose }: Props) {
  return (
    <Modal
      visible={visible && thought !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close thought"
        />

        {thought && (
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetEyebrowRow}>
                <View style={styles.goldDot} />

                <Text style={styles.sheetEyebrow}>A THOUGHT IN TIME</Text>
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

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              <Text style={styles.sheetQuote}>“{thought.quote}”</Text>

              <Text style={styles.sheetAuthor}>— {thought.author}</Text>

              <Text style={styles.sheetSource}>{thought.source}</Text>

              <View style={styles.divider} />

              <Text style={styles.sectionLabel}>BEYOND THE WORDS</Text>

              <Text style={styles.explanation}>{thought.explanation}</Text>

              <View style={styles.reflectionContainer}>
                <View style={styles.reflectionHeader}>
                  <Ionicons
                    name="sparkles-outline"
                    size={15}
                    color={COLORS.gold}
                  />

                  <Text style={styles.sectionLabel}>A MOMENT TO REFLECT</Text>
                </View>

                <Text style={styles.reflectionText}>{thought.reflection}</Text>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.75)",
  },

  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderTopWidth: 1,
    borderColor: `${COLORS.gold}50`,
    paddingHorizontal: 23,
    paddingTop: 22,
    paddingBottom: 35,
    maxHeight: "85%",
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sheetEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  sheetEyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  sheetContent: {
    paddingBottom: 15,
  },

  sheetQuote: {
    color: "#EAE4DC",
    fontSize: 22,
    lineHeight: 33,
    fontStyle: "italic",
    marginTop: 30,
  },

  sheetAuthor: {
    color: COLORS.lightGold,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 17,
  },

  sheetSource: {
    color: COLORS.subtle,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: `${COLORS.gold}25`,
    marginVertical: 26,
  },

  sectionLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.3,
  },

  explanation: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 23,
    marginTop: 12,
  },

  reflectionContainer: {
    marginTop: 27,
    padding: 17,
    backgroundColor: `${COLORS.gold}0D`,
    borderWidth: 1,
    borderColor: `${COLORS.gold}30`,
    borderRadius: 12,
  },

  reflectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  reflectionText: {
    color: "#EAE4DC",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
});
