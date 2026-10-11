import { useEffect, useState } from "react";

import {
  ActivityIndicator,
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

import { Ionicons } from "@expo/vector-icons";

import { QuickAddSuggestion } from "@/services/ActivityService";
import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";
import { formatDuration } from "@/utils/formatDuration";

type QuickAddModalProps = {
  suggestion: QuickAddSuggestion | null;
  visible: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: (durationMinutes: number, activityDate: Date) => void;
};

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function parseTime(value: string): {
  hours: number;
  minutes: number;
} | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());

  if (!match) return null;

  return {
    hours: Number(match[1]),
    minutes: Number(match[2]),
  };
}

export function QuickAddModal({
  suggestion,
  visible,
  isSaving,
  errorMessage,
  onClose,
  onConfirm,
}: QuickAddModalProps) {
  const [duration, setDuration] = useState("");
  const [startTime, setStartTime] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!suggestion || !visible) return;

    const now = new Date();

    const start = new Date(now.getTime() - suggestion.durationMinutes * 60_000);

    setDuration(String(suggestion.durationMinutes));
    setStartTime(formatTime(start));
    setLocalError(null);
  }, [suggestion, visible]);

  if (!suggestion) return null;

  const theme = CLASSIFICATION_THEME[suggestion.classification];

  function handleConfirm() {
    const minutes = Number(duration.trim());

    if (!Number.isInteger(minutes) || minutes <= 0) {
      setLocalError("Enter a valid duration in minutes.");
      return;
    }

    const parsedTime = parseTime(startTime);

    if (!parsedTime) {
      setLocalError("Use HH:mm format, for example 14:30.");
      return;
    }

    const now = new Date();

    const activityDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      parsedTime.hours,
      parsedTime.minutes,
    );

    // A start time later than the current clock time is
    // interpreted as yesterday, for activities crossing midnight.
    if (activityDate.getTime() > now.getTime()) {
      activityDate.setDate(activityDate.getDate() - 1);
    }

    setLocalError(null);

    onConfirm(minutes, activityDate);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          disabled={isSaving}
        />

        <View style={styles.modalCard}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View
                style={[
                  styles.iconFrame,
                  {
                    borderColor: `${theme.color}55`,
                    backgroundColor: `${theme.color}12`,
                  },
                ]}
              >
                <Ionicons name="flash-outline" size={21} color={theme.color} />
              </View>

              <Pressable
                onPress={onClose}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Close Quick Add"
              >
                <Ionicons name="close" size={23} color={COLORS.muted} />
              </Pressable>
            </View>

            <Text style={styles.eyebrow}>QUICK ADD</Text>

            <Text style={styles.title}>{suggestion.title}</Text>

            <Text style={styles.subtitle}>
              A familiar moment, ready to trace.
            </Text>

            <View style={styles.classificationRow}>
              <View
                style={[
                  styles.classificationDot,
                  { backgroundColor: theme.color },
                ]}
              />

              <Text style={[styles.classificationText, { color: theme.color }]}>
                {theme.shortLabel}
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.inputLabel}>DURATION · MINUTES</Text>

            <TextInput
              value={duration}
              onChangeText={(value) => {
                setDuration(value);
                setLocalError(null);
              }}
              keyboardType="number-pad"
              style={styles.input}
              placeholder="30"
              placeholderTextColor={COLORS.subtle}
              selectionColor={COLORS.gold}
              editable={!isSaving}
            />

            <Text style={styles.inputLabel}>START TIME · HH:MM</Text>

            <TextInput
              value={startTime}
              onChangeText={(value) => {
                setStartTime(value);
                setLocalError(null);
              }}
              keyboardType="numbers-and-punctuation"
              style={styles.input}
              placeholder="14:30"
              placeholderTextColor={COLORS.subtle}
              selectionColor={COLORS.gold}
              editable={!isSaving}
              autoCapitalize="none"
            />

            <Text style={styles.hint}>
              Suggested duration: {formatDuration(suggestion.durationMinutes)}.
              The start time is initially set so the activity ends now.
            </Text>

            {(localError || errorMessage) && (
              <Text style={styles.error}>{localError || errorMessage}</Text>
            )}

            <Pressable
              onPress={handleConfirm}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Add activity"
              style={({ pressed }) => [
                styles.confirmButton,
                {
                  opacity: isSaving ? 0.6 : pressed ? 0.85 : 1,
                },
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <>
                  <Ionicons name="add" size={19} color={COLORS.background} />

                  <Text style={styles.confirmText}>Add Activity</Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.76)",
  },

  modalCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 16,
    padding: 22,
    maxHeight: "85%",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  iconFrame: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.6,
  },

  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "600",
    marginTop: 9,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  classificationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 17,
  },

  classificationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  classificationText: {
    fontSize: 12,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 22,
  },

  inputLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 9,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 19,
  },

  hint: {
    color: COLORS.subtle,
    fontSize: 11,
    lineHeight: 17,
  },

  error: {
    color: COLORS.danger,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
  },

  confirmButton: {
    height: 49,
    marginTop: 24,
    backgroundColor: COLORS.gold,
    borderRadius: 9,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
  },

  confirmText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: "700",
  },
});
