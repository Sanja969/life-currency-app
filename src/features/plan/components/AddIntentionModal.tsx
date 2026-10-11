import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { CosmicPanel } from "@/components/ui/CosmicPanel";

import { COLORS } from "@/theme/colors";

import { ActivityCategory } from "@/types/activity";
import type { WeeklyIntentionProgress } from "@/types/weeklyIntention";

type Props = {
  visible: boolean;
  intention?: WeeklyIntentionProgress | null;
  existingCategories: ActivityCategory[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (category: ActivityCategory, targetMinutes: number) => Promise<void>;
};

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
  onClose,
  onSave,
}: Props) {
  const [category, setCategory] = useState<ActivityCategory | null>(null);

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const isEditing = Boolean(intention);

  /*
   * INITIALIZE FORM
   */

  useEffect(() => {
    if (!visible) return;

    setCategory(intention?.category ?? null);

    setHours(intention ? String(Math.floor(intention.targetMinutes / 60)) : "");

    setMinutes(intention ? String(intention.targetMinutes % 60) : "");
  }, [visible, intention]);

  /*
   * AVAILABLE CATEGORIES
   *
   * Prevent duplicate weekly intentions.
   */

  const availableCategories = Object.values(ActivityCategory).filter(
    (item) =>
      item === intention?.category || !existingCategories.includes(item),
  );

  /*
   * SAVE INTENTION
   */

  async function handleSave() {
    if (isSaving) return;

    if (!category) {
      Alert.alert(
        "Choose a category",
        "Select the life area you want to focus on.",
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
      await onSave(category, targetMinutes);

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
        if (!isSaving) {
          onClose();
        }
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        style={{
          backgroundColor: COLORS.background,
        }}
      >
        {/* HEADER */}

        <View
          className="flex-row items-center justify-between px-5 pb-5 pt-7"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
        >
          <View className="flex-1 pr-4">
            <Text
              className="text-[10px] font-bold tracking-[2px]"
              style={{
                color: COLORS.gold,
              }}
            >
              LIFE CURRENCY
            </Text>

            <Text
              className="mt-3 text-[27px] font-semibold tracking-[-0.5px]"
              style={{
                color: COLORS.text,
              }}
            >
              {isEditing ? "Edit intention" : "New intention"}
            </Text>

            <Text
              className="mt-2 text-[12px]"
              style={{
                color: COLORS.muted,
              }}
            >
              Invest your time with purpose.
            </Text>
          </View>

          {/* CLOSE */}

          <Pressable
            onPress={onClose}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Close intention modal"
            className="h-10 w-10 items-center justify-center"
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: COLORS.goldBorder,
              backgroundColor: COLORS.goldBackground,
              opacity: isSaving ? 0.5 : pressed ? 0.75 : 1,
            })}
          >
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={COLORS.gold}
            />
          </Pressable>
        </View>

        {/* CONTENT */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 26,
            paddingBottom: 50,
          }}
        >
          {/* LIFE AREA */}

          <View className="mb-4 flex-row items-center">
            <View
              className="mr-2 h-[6px] w-[6px]"
              style={{
                backgroundColor: COLORS.gold,
              }}
            />

            <Text
              className="text-[10px] font-bold tracking-[1.8px]"
              style={{
                color: COLORS.muted,
              }}
            >
              LIFE AREA
            </Text>
          </View>

          <Text
            className="mb-5 text-[13px] leading-[21px]"
            style={{
              color: COLORS.muted,
            }}
          >
            Choose where you want to invest your time.
          </Text>

          {/* CATEGORY SELECTOR */}

          <View className="flex-row flex-wrap">
            {availableCategories.map((item) => {
              const selected = category === item;

              const disabled = isEditing || isSaving;

              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                    disabled,
                  }}
                  className="mb-2 mr-2 border px-4 py-3"
                  style={({ pressed }) => ({
                    backgroundColor: selected
                      ? COLORS.goldBackground
                      : COLORS.surface,

                    borderColor: selected ? COLORS.gold : COLORS.border,

                    opacity:
                      isEditing && !selected
                        ? 0.45
                        : disabled
                          ? 0.7
                          : pressed
                            ? 0.75
                            : 1,
                  })}
                >
                  <Text
                    className="text-[13px] font-medium"
                    style={{
                      color: selected ? COLORS.lightGold : COLORS.muted,
                    }}
                  >
                    {formatCategory(item)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* DIVIDER */}

          <View
            className="my-7 h-[1px]"
            style={{
              backgroundColor: COLORS.border,
            }}
          />

          {/* WEEKLY TIME INTENTION */}

          <View className="mb-5 flex-row items-center">
            <View
              className="mr-2 h-[6px] w-[6px]"
              style={{
                backgroundColor: COLORS.gold,
              }}
            />

            <Text
              className="text-[10px] font-bold tracking-[1.8px]"
              style={{
                color: COLORS.muted,
              }}
            >
              WEEKLY TIME INTENTION
            </Text>
          </View>

          <CosmicPanel
            variant="subtle"
            contentStyle={{
              padding: 18,
            }}
          >
            <Text
              className="mb-5 text-[13px] leading-[21px]"
              style={{
                color: COLORS.muted,
              }}
            >
              How much time would you like to invest in this area each week?
            </Text>

            {/* HOURS / MINUTES */}

            <View className="flex-row gap-3">
              {/* HOURS */}

              <View className="flex-1">
                <Text
                  className="mb-2 text-[12px] font-medium"
                  style={{
                    color: COLORS.muted,
                  }}
                >
                  Hours
                </Text>

                <TextInput
                  value={hours}
                  onChangeText={setHours}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.subtle}
                  editable={!isSaving}
                  maxLength={3}
                  accessibilityLabel="Hours"
                  style={{
                    height: 58,
                    borderWidth: 1,
                    borderColor: COLORS.goldBorder,
                    backgroundColor: COLORS.goldBackground,
                    paddingHorizontal: 16,
                    color: COLORS.text,
                    fontSize: 20,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                />
              </View>

              {/* MINUTES */}

              <View className="flex-1">
                <Text
                  className="mb-2 text-[12px] font-medium"
                  style={{
                    color: COLORS.muted,
                  }}
                >
                  Minutes
                </Text>

                <TextInput
                  value={minutes}
                  onChangeText={setMinutes}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.subtle}
                  editable={!isSaving}
                  maxLength={2}
                  accessibilityLabel="Minutes"
                  style={{
                    height: 58,
                    borderWidth: 1,
                    borderColor: COLORS.goldBorder,
                    backgroundColor: COLORS.goldBackground,
                    paddingHorizontal: 16,
                    color: COLORS.text,
                    fontSize: 20,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                />
              </View>
            </View>

            {/* HELPER TEXT */}

            <View className="mt-5 flex-row items-start">
              <MaterialCommunityIcons
                name="information-outline"
                size={17}
                color={COLORS.gold}
              />

              <Text
                className="ml-2 flex-1 text-[12px] leading-[19px]"
                style={{
                  color: COLORS.muted,
                }}
              >
                Progress is calculated automatically from activities marked as
                Growing.
              </Text>
            </View>
          </CosmicPanel>

          {/* SAVE BUTTON */}

          <AppButton
            variant="primary"
            leadingIcon={isEditing ? "checkmark" : "add"}
            loading={isSaving}
            accessibilityLabel={
              isEditing ? "Save intention changes" : "Add intention"
            }
            onPress={() => void handleSave()}
            style={{
              marginTop: 32,
            }}
          >
            {isEditing ? "Save changes" : "Add intention"}
          </AppButton>

          {/* FOOTER */}

          <Text
            className="mt-6 text-center text-[12px] italic leading-[19px]"
            style={{
              color: COLORS.subtle,
            }}
          >
            Small intentions. Meaningful change.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
