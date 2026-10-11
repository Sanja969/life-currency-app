import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { COLORS } from "@/theme/colors";
import { useDailyReflection } from "../hooks/useDailyReflection";

const MAX_LENGTH = 2000;

export function DailyReflectionCard() {
  const {
    reflection,
    content,
    isLoading,
    isSaving,
    isEditing,
    errorMessage,
    setContent,
    saveReflection,
    startEditing,
    cancelEditing,
  } = useDailyReflection();

  const [isExpanded, setIsExpanded] = useState(false);

  const hasReflection = reflection !== null;

  // Keep the editor closed after saving or cancelling.
  useEffect(() => {
    if (hasReflection && !isEditing) {
      setIsExpanded(false);
    }
  }, [hasReflection, isEditing]);

  const showEditor = isExpanded || isEditing;

  function handleStartWriting() {
    setIsExpanded(true);
  }

  function handleEdit() {
    startEditing();
    setIsExpanded(true);
  }

  function handleCancel() {
    if (hasReflection) {
      cancelEditing();
    } else {
      setContent("");
    }

    setIsExpanded(false);
  }

  async function handleSave() {
    await saveReflection();
  }

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}

      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionTitle}>A MOMENT OF REFLECTION</Text>
        </View>

        <Text style={styles.subtitle}>
          A little space to notice what matters.
        </Text>
      </View>

      {/* REFLECTION CARD */}

      <View style={styles.card}>
        <View style={styles.topAccent} />

        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.gold}
            style={styles.loader}
          />
        ) : (
          <>
            {/* QUESTION */}

            <View style={styles.promptRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="sparkles-outline"
                  size={20}
                  color={COLORS.gold}
                />
              </View>

              <View style={styles.promptTextContainer}>
                <Text style={styles.question}>What made today meaningful?</Text>

                {!showEditor && !hasReflection && (
                  <Text style={styles.hint}>
                    Even the smallest moments can matter.
                  </Text>
                )}
              </View>
            </View>

            {/* EMPTY COLLAPSED STATE */}

            {!hasReflection && !showEditor && (
              <Pressable
                onPress={handleStartWriting}
                accessibilityRole="button"
                accessibilityLabel="Write today's reflection"
                style={({ pressed }) => [
                  styles.writeButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="create-outline" size={17} color={COLORS.gold} />

                <Text style={styles.writeButtonText}>Write a reflection</Text>

                <Ionicons
                  name="chevron-forward"
                  size={15}
                  color={COLORS.gold}
                />
              </Pressable>
            )}

            {/* SAVED REFLECTION */}

            {hasReflection && !showEditor && (
              <View style={styles.savedContainer}>
                <View style={styles.savedAccent} />

                <Text style={styles.savedText}>{reflection.content}</Text>

                <Pressable
                  onPress={handleEdit}
                  accessibilityRole="button"
                  accessibilityLabel="Edit today's reflection"
                  style={styles.editButton}
                >
                  <Ionicons
                    name="create-outline"
                    size={16}
                    color={COLORS.gold}
                  />

                  <Text style={styles.editButtonText}>Edit reflection</Text>
                </Pressable>
              </View>
            )}

            {/* EXPANDED EDITOR */}

            {showEditor && (
              <View style={styles.editorContainer}>
                <Text style={styles.editorHint}>
                  It doesn't have to be something extraordinary. Sometimes the
                  smallest moments matter most.
                </Text>

                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Today, I appreciated..."
                  placeholderTextColor={COLORS.subtle}
                  multiline
                  maxLength={MAX_LENGTH}
                  textAlignVertical="top"
                  editable={!isSaving}
                  style={styles.input}
                  accessibilityLabel="Daily reflection"
                />

                <Text style={styles.characterCount}>
                  {content.length}/{MAX_LENGTH}
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    onPress={handleCancel}
                    disabled={isSaving}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel reflection editing"
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      void handleSave();
                    }}
                    disabled={isSaving || !content.trim()}
                    accessibilityRole="button"
                    accessibilityLabel="Save daily reflection"
                    style={[
                      styles.saveButton,
                      (isSaving || !content.trim()) &&
                        styles.saveButtonDisabled,
                    ]}
                  >
                    {isSaving ? (
                      <ActivityIndicator
                        size="small"
                        color={COLORS.background}
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark"
                          size={17}
                          color={COLORS.background}
                        />

                        <Text style={styles.saveButtonText}>
                          Save reflection
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            )}

            {/* ERROR */}

            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <Pressable
              onPress={() => router.push("/reflections")}
              accessibilityRole="button"
              accessibilityLabel="View past reflections"
              style={styles.historyButton}
            >
              <Ionicons name="time-outline" size={16} color={COLORS.muted} />

              <Text style={styles.historyButtonText}>
                View past reflections
              </Text>

              <Ionicons name="chevron-forward" size={15} color={COLORS.muted} />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 12,
  },

  header: {
    marginBottom: 16,
  },

  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
  },

  sectionTitle: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  subtitle: {
    color: COLORS.subtle,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: 18,
    position: "relative",
  },

  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 52,
    height: 2,
    backgroundColor: COLORS.gold,
  },

  loader: {
    paddingVertical: 28,
  },

  promptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
  },

  iconContainer: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.goldBackground,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  promptTextContainer: {
    flex: 1,
  },

  question: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 23,
  },

  hint: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 9,
  },

  writeButton: {
    marginTop: 20,
    minHeight: 45,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.goldBackground,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  writeButtonText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.7,
  },

  savedContainer: {
    marginTop: 20,
    paddingLeft: 15,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gold,
  },

  savedAccent: {
    display: "none",
  },

  savedText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 23,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    marginTop: 16,
    paddingVertical: 6,
  },

  editButtonText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "600",
  },

  editorContainer: {
    marginTop: 20,
  },

  editorHint: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 15,
  },

  input: {
    minHeight: 125,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
    padding: 14,
  },

  characterCount: {
    color: COLORS.subtle,
    fontSize: 11,
    textAlign: "right",
    marginTop: 10,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 15,
  },

  cancelButton: {
    paddingVertical: 11,
    paddingHorizontal: 6,
  },

  cancelButtonText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },

  saveButton: {
    backgroundColor: COLORS.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 15,
    minHeight: 42,
  },

  saveButtonDisabled: {
    opacity: 0.45,
  },

  saveButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: "700",
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 20,
    paddingTop: 17,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  historyButtonText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
});
