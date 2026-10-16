import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { CosmicPanel } from "@/components/ui/CosmicPanel";

import { COLORS } from "@/theme/colors";
import { ActivityCategory } from "@/types/activity";

import type {
  IntentionDirection,
  WeeklyIntentionProgress,
} from "@/types/weeklyIntention";

type Props = {
  visible: boolean;
  intention?: WeeklyIntentionProgress | null;
  existingCategories: ActivityCategory[];
  isSaving: boolean;
  defaultDirection?: IntentionDirection;
  onClose: () => void;
  onSave: (
    category: ActivityCategory,
    targetMinutes: number,
    direction: IntentionDirection,
  ) => Promise<void>;
};

type DirectionOption = {
  value: IntentionDirection;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
};

const DIRECTION_OPTIONS: DirectionOption[] = [
  {
    value: "at_least",
    title: "GROW",
    subtitle: "Invest more time",
    icon: "sparkles-outline",
    color: COLORS.gold,
  },
  {
    value: "at_most",
    title: "PROTECT",
    subtitle: "Set a time boundary",
    icon: "shield-outline",
    color: COLORS.growing,
  },
];

function formatCategory(category: ActivityCategory): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AddIntentionModal({
  visible,
  intention,
  existingCategories,
  isSaving,
  defaultDirection = "at_least",
  onClose,
  onSave,
}: Props) {
  const [category, setCategory] = useState<ActivityCategory | null>(null);
  const [direction, setDirection] =
    useState<IntentionDirection>(defaultDirection);

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const isEditing = Boolean(intention);
  const isGrow = direction === "at_least";

  const accentColor = isGrow ? COLORS.gold : COLORS.growing;

  useEffect(() => {
    if (!visible) return;

    setCategory(intention?.category ?? null);
    setDirection(intention?.direction ?? defaultDirection);

    setHours(intention ? String(Math.floor(intention.targetMinutes / 60)) : "");

    setMinutes(intention ? String(intention.targetMinutes % 60) : "");
  }, [visible, intention, defaultDirection]);

  const availableCategories = Object.values(ActivityCategory).filter(
    (item) =>
      item === intention?.category || !existingCategories.includes(item),
  );

  async function handleSave() {
    if (isSaving) return;

    if (!category) {
      Alert.alert(
        "Choose a life area",
        "Select the area of life you want to focus on.",
      );
      return;
    }

    const parsedHours = hours.trim() === "" ? 0 : Number(hours);
    const parsedMinutes = minutes.trim() === "" ? 0 : Number(minutes);

    if (
      !Number.isSafeInteger(parsedHours) ||
      !Number.isSafeInteger(parsedMinutes) ||
      parsedHours < 0 ||
      parsedMinutes < 0 ||
      parsedMinutes > 59
    ) {
      Alert.alert("Invalid duration", "Enter valid hours and minutes (0–59).");
      return;
    }

    const targetMinutes = parsedHours * 60 + parsedMinutes;

    if (!Number.isSafeInteger(targetMinutes) || targetMinutes <= 0) {
      Alert.alert(
        "Invalid duration",
        "Your weekly intention must be greater than zero.",
      );
      return;
    }

    try {
      await onSave(category, targetMinutes, direction);
      onClose();
    } catch (error) {
      console.error("Failed to save intention:", error);

      Alert.alert(
        "Unable to save",
        "Your weekly intention could not be saved. Please try again.",
      );
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        if (!isSaving) onClose();
      }}
    >
      <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>LIFE CURRENCY · YOUR DIRECTION</Text>

              <Text style={styles.title}>
                {isEditing ? "Refine your intention" : "Set your intention"}
              </Text>

              <Text style={styles.subtitle}>Give your time a direction.</Text>
            </View>

            <Pressable
              onPress={onClose}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Close intention modal"
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: isSaving ? 0.5 : pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="close" size={21} color={COLORS.gold} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {/* INTENTION TYPE */}

            <View style={styles.sectionHeading}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionLabel}>
                HOW WILL YOU SHAPE YOUR TIME?
              </Text>
            </View>

            <Text style={styles.sectionDescription}>
              Choose what you'd like to grow or protect.
            </Text>

            <View style={styles.directionRow}>
              {DIRECTION_OPTIONS.map((option) => {
                const selected = direction === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setDirection(option.value)}
                    disabled={isSaving}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: selected,
                      disabled: isSaving,
                    }}
                    style={({ pressed }) => [
                      styles.directionCard,
                      {
                        borderColor: selected ? option.color : COLORS.border,
                        backgroundColor: selected
                          ? COLORS.goldBackground
                          : COLORS.surface,
                        opacity: isSaving ? 0.5 : pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <View style={styles.directionTop}>
                      <View
                        style={[
                          styles.directionIcon,
                          {
                            borderColor: selected
                              ? option.color
                              : COLORS.border,
                          },
                        ]}
                      >
                        <Ionicons
                          name={option.icon}
                          size={20}
                          color={selected ? option.color : COLORS.muted}
                        />
                      </View>

                      <Ionicons
                        name={selected ? "radio-button-on" : "radio-button-off"}
                        size={19}
                        color={selected ? option.color : COLORS.subtle}
                      />
                    </View>

                    <Text
                      style={[
                        styles.directionTitle,
                        { color: selected ? option.color : COLORS.text },
                      ]}
                    >
                      {option.title}
                    </Text>

                    <Text style={styles.directionSubtitle}>
                      {option.subtitle}
                    </Text>

                    <Text style={styles.directionRule}>
                      {option.value === "at_least" ? "AT LEAST" : "AT MOST"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* LIFE AREA */}

            <View style={styles.sectionDivider} />

            <View style={styles.sectionHeading}>
              <View
                style={[styles.sectionDot, { backgroundColor: accentColor }]}
              />
              <Text style={styles.sectionLabel}>LIFE AREA</Text>
            </View>

            <Text style={styles.sectionDescription}>
              Which part of your life does this intention belong to?
            </Text>

            <View style={styles.categories}>
              {availableCategories.map((item) => {
                const selected = category === item;
                const disabled = isEditing || isSaving;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(item)}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled }}
                    style={({ pressed }) => [
                      styles.categoryChip,
                      {
                        borderColor: selected ? accentColor : COLORS.border,
                        backgroundColor: selected
                          ? COLORS.goldBackground
                          : COLORS.surface,
                        opacity:
                          isEditing && !selected
                            ? 0.45
                            : disabled
                              ? 0.7
                              : pressed
                                ? 0.75
                                : 1,
                      },
                    ]}
                  >
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color={accentColor}
                      />
                    )}

                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color: selected ? COLORS.lightGold : COLORS.muted,
                        },
                      ]}
                    >
                      {formatCategory(item)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {isEditing && (
              <Text style={styles.lockedHint}>
                The life area stays the same when editing an intention.
              </Text>
            )}

            {/* WEEKLY TIME */}

            <View style={styles.sectionDivider} />

            <View style={styles.sectionHeading}>
              <View
                style={[styles.sectionDot, { backgroundColor: accentColor }]}
              />
              <Text style={styles.sectionLabel}>WEEKLY TIME</Text>
            </View>

            <Text style={styles.sectionDescription}>
              {isGrow
                ? "How much time would you like to invest each week?"
                : "What's the maximum time you want to spend each week?"}
            </Text>

            <CosmicPanel
              variant="subtle"
              accent={accentColor}
              contentStyle={styles.timePanel}
            >
              <View style={styles.timeHeader}>
                <Ionicons
                  name={isGrow ? "time-outline" : "shield-outline"}
                  size={17}
                  color={accentColor}
                />

                <Text style={[styles.timeRule, { color: accentColor }]}>
                  {isGrow ? "AT LEAST" : "AT MOST"}
                </Text>

                <Text style={styles.timeRuleSuffix}>PER WEEK</Text>
              </View>

              <View style={styles.timeInputs}>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.inputLabel}>HOURS</Text>

                  <TextInput
                    value={hours}
                    onChangeText={setHours}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={COLORS.subtle}
                    editable={!isSaving}
                    maxLength={3}
                    accessibilityLabel="Hours"
                    style={[
                      styles.timeInput,
                      { borderColor: COLORS.goldBorder },
                    ]}
                  />
                </View>

                <Text style={styles.timeSeparator}>:</Text>

                <View style={styles.timeInputGroup}>
                  <Text style={styles.inputLabel}>MINUTES</Text>

                  <TextInput
                    value={minutes}
                    onChangeText={setMinutes}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={COLORS.subtle}
                    editable={!isSaving}
                    maxLength={2}
                    accessibilityLabel="Minutes"
                    style={[
                      styles.timeInput,
                      { borderColor: COLORS.goldBorder },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={accentColor}
                />

                <Text style={styles.infoText}>
                  Time includes all recorded activities in this category,
                  regardless of classification.
                </Text>
              </View>
            </CosmicPanel>

            {/* ACTION */}

            <AppButton
              variant="primary"
              leadingIcon={isEditing ? "checkmark" : "add"}
              loading={isSaving}
              accessibilityLabel={
                isEditing ? "Save intention changes" : "Create intention"
              }
              onPress={() => void handleSave()}
              style={styles.saveButton}
            >
              {isEditing ? "Save changes" : "Create intention"}
            </AppButton>

            <Text style={styles.footer}>
              Small intentions. Meaningful change.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardContainer: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "600",
    letterSpacing: -0.5,
    marginTop: 11,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 8,
  },

  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    backgroundColor: COLORS.goldBackground,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 55,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 10,
  },

  sectionDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
  },

  sectionLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  sectionDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 18,
  },

  directionRow: {
    flexDirection: "row",
    gap: 11,
  },

  directionCard: {
    flex: 1,
    minHeight: 148,
    padding: 14,
    borderWidth: 1,
  },

  directionTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  directionIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  directionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  directionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
  },

  directionRule: {
    color: COLORS.subtle,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: 12,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 28,
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },

  lockedHint: {
    color: COLORS.subtle,
    fontSize: 11,
    marginTop: 12,
  },

  timePanel: {
    padding: 18,
  },

  timeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },

  timeRule: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
  },

  timeRuleSuffix: {
    color: COLORS.subtle,
    fontSize: 10,
    letterSpacing: 1,
  },

  timeInputs: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },

  timeInputGroup: {
    flex: 1,
  },

  inputLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 9,
  },

  timeInput: {
    height: 62,
    borderWidth: 1,
    backgroundColor: COLORS.goldBackground,
    color: COLORS.text,
    textAlign: "center",
    fontSize: 23,
    fontWeight: "600",
  },

  timeSeparator: {
    color: COLORS.gold,
    fontSize: 24,
    paddingBottom: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 20,
  },

  infoText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
  },

  saveButton: {
    marginTop: 32,
  },

  footer: {
    color: COLORS.subtle,
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 23,
  },
});
