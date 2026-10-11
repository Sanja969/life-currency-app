import { useEffect, useState, type ReactNode } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import Svg, { Path } from "react-native-svg";

import { AppButton } from "@/components/ui/AppButton";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

type FormDatePickerProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
};

const COLORS = {
  background: "#080A10",
  surface: "#11141D",
  modalSurface: "#151720",
  gold: "#D6AD65",
  lightGold: "#F3D49B",
  text: "#F5F0E7",
  muted: "#9295A5",
  error: "#E78A8A",
};

const CORNER_CUT = 10;

function formatTime(date: Date) {
  return format(date, "HH:mm");
}

function normalizeTime(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function parseTime(text: string) {
  const match = text.match(/^([01]\d|2[0-3]):([0-5]\d)$/);

  if (!match) {
    return null;
  }

  return {
    hours: Number(match[1]),
    minutes: Number(match[2]),
  };
}

/*
 * Reusable angular background
 */

type AngularSurfaceProps = {
  children: ReactNode;
  focused?: boolean;
  error?: boolean;
};

function AngularSurface({
  children,
  focused = false,
  error = false,
}: AngularSurfaceProps) {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;

    setSize((previous) => {
      if (
        Math.abs(previous.width - width) < 0.5 &&
        Math.abs(previous.height - height) < 0.5
      ) {
        return previous;
      }

      return { width, height };
    });
  }

  const { width, height } = size;

  const shapePath = `
    M ${CORNER_CUT} 0
    L ${width} 0
    L ${width} ${height - CORNER_CUT}
    L ${width - CORNER_CUT} ${height}
    L 0 ${height}
    L 0 ${CORNER_CUT}
    Z
  `;

  const borderColor = error
    ? COLORS.error
    : focused
      ? COLORS.gold
      : "rgba(214,173,101,0.22)";

  return (
    <View style={styles.angularSurface} onLayout={handleLayout}>
      {width > 0 && height > 0 && (
        <Svg
          pointerEvents="none"
          width={width}
          height={height}
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={shapePath}
            fill={COLORS.surface}
            stroke={borderColor}
            strokeWidth={focused ? 1.5 : 1}
          />

          {focused && (
            <Path
              d={`M ${CORNER_CUT} 0 L ${Math.min(
                width - 4,
                CORNER_CUT + 30,
              )} 0`}
              stroke={COLORS.lightGold}
              strokeWidth={1.5}
            />
          )}
        </Svg>
      )}

      {children}
    </View>
  );
}

/*
 * React Hook Form integration
 */

export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
}: FormDatePickerProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const fieldValue: unknown = field.value;
        const value = fieldValue instanceof Date ? fieldValue : new Date();

        return (
          <DateTimeFields
            value={value}
            label={label}
            error={fieldState.error?.message}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        );
      }}
    />
  );
}

type DateTimeFieldsProps = {
  value: Date;
  label?: string;
  error?: string;
  onChange: (value: Date) => void;
  onBlur: () => void;
};

function DateTimeFields({
  value,
  label,
  error,
  onChange,
  onBlur,
}: DateTimeFieldsProps) {
  const { width: screenWidth } = useWindowDimensions();
  const modalWidth = Math.min(screenWidth - 32, 380);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [timeText, setTimeText] = useState(formatTime(value));
  const [timeError, setTimeError] = useState<string | null>(null);

  const [timeFocused, setTimeFocused] = useState(false);

  useEffect(() => {
    setTimeText(formatTime(value));
  }, [value]);

  function updateTime(text: string) {
    const normalized = normalizeTime(text);

    setTimeText(normalized);

    const parsed = parseTime(normalized);

    if (!parsed) {
      setTimeError("Use HH:mm, for example 14:30");
      return;
    }

    const nextDate = new Date(value);

    nextDate.setHours(parsed.hours, parsed.minutes, 0, 0);

    setTimeError(null);
    onChange(nextDate);
  }

  function handleTimeBlur() {
    setTimeFocused(false);
    onBlur();

    if (!parseTime(timeText)) {
      setTimeError("Use HH:mm, for example 14:30");
      return;
    }

    setTimeError(null);
  }

  function handleDateChange(selectedDate: Date) {
    const nextDate = new Date(value);

    nextDate.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    onChange(nextDate);
  }

  function handleTimeChange(selectedDate: Date) {
    const nextDate = new Date(value);

    nextDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);

    setTimeText(formatTime(nextDate));
    setTimeError(null);

    onChange(nextDate);
  }

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.fieldsRow}>
        {/* DATE */}

        <View style={styles.fieldColumn}>
          <AngularSurface>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel="Select date"
              style={({ pressed }) => [
                styles.fieldContent,
                { opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Text style={styles.fieldCaption}>DATE</Text>

              <View style={styles.fieldValueRow}>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={styles.fieldValue}
                >
                  {format(value, "dd.MM.yyyy")}
                </Text>

                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={COLORS.gold}
                />
              </View>
            </Pressable>
          </AngularSurface>
        </View>

        {/* TIME */}

        <View style={styles.fieldColumn}>
          <AngularSurface focused={timeFocused} error={Boolean(timeError)}>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldCaption}>TIME</Text>

              <View style={styles.fieldValueRow}>
                <TextInput
                  value={timeText}
                  onChangeText={updateTime}
                  onFocus={() => setTimeFocused(true)}
                  onBlur={handleTimeBlur}
                  keyboardType="number-pad"
                  placeholder="14:30"
                  placeholderTextColor={COLORS.muted}
                  selectionColor={COLORS.gold}
                  cursorColor={COLORS.lightGold}
                  maxLength={5}
                  selectTextOnFocus
                  style={styles.timeInput}
                />

                <Pressable
                  onPress={() => setShowTimePicker(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Select time"
                  hitSlop={10}
                >
                  <Ionicons name="time-outline" size={21} color={COLORS.gold} />
                </Pressable>
              </View>
            </View>
          </AngularSurface>
        </View>
      </View>

      {timeError ? <Text style={styles.errorText}>{timeError}</Text> : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* DATE MODAL */}

      <Modal
        transparent
        animationType="fade"
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowDatePicker(false)}
            accessibilityLabel="Close date picker"
          />
          <View style={[styles.modalCard, { width: modalWidth }]}>
            <Text style={styles.modalEyebrow}>LIFE CURRENCY</Text>

            <Text style={styles.modalTitle}>Select date</Text>

            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={value}
                mode="date"
                themeVariant="dark"
                display={Platform.OS === "ios" ? "inline" : "default"}
                style={{
                  width: "100%",
                  alignSelf: "center",
                }}
                onChange={(_, selectedDate) => {
                  if (!selectedDate) return;

                  handleDateChange(selectedDate);

                  if (Platform.OS !== "ios") {
                    setShowDatePicker(false);
                  }
                }}
              />
            </View>

            {Platform.OS === "ios" && (
              <View style={styles.modalFooter}>
                <AppButton
                  variant="secondary"
                  onPress={() => setShowDatePicker(false)}
                  style={styles.doneButton}
                >
                  Done
                </AppButton>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* TIME MODAL */}

      <Modal
        transparent
        animationType="fade"
        visible={showTimePicker}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowTimePicker(false)}
            accessibilityLabel="Close time picker"
          />
          <View style={[styles.modalCard, { width: modalWidth }]}>
            <Text style={styles.modalEyebrow}>LIFE CURRENCY</Text>

            <Text style={styles.modalTitle}>Select time</Text>

            <View style={styles.timePickerContainer}>
              <DateTimePicker
                value={value}
                mode="time"
                themeVariant="dark"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                is24Hour
                style={{
                  width: "100%",
                  height: 180,
                  alignSelf: "center",
                }}
                onChange={(_, selectedDate) => {
                  if (!selectedDate) return;

                  handleTimeChange(selectedDate);

                  if (Platform.OS !== "ios") {
                    setShowTimePicker(false);
                  }
                }}
              />
            </View>

            {Platform.OS === "ios" && (
              <View style={styles.modalFooter}>
                <AppButton
                  variant="secondary"
                  onPress={() => setShowTimePicker(false)}
                  style={styles.doneButton}
                >
                  Done
                </AppButton>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  fieldsRow: {
    flexDirection: "row",
    gap: 12,
  },

  fieldColumn: {
    flex: 1,
    minWidth: 0,
  },

  angularSurface: {
    height: 76,
    justifyContent: "center",
  },

  fieldContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },

  fieldCaption: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  fieldValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  fieldValue: {
    flex: 1,
    minWidth: 0,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },

  timeInput: {
    flex: 1,
    minWidth: 0,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    padding: 0,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.82)",
  },

  modalCard: {
    backgroundColor: "#151720",
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.3)",
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 16,
  },

  modalEyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 10,
    marginHorizontal: 4,
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "600",
    marginBottom: 12,
    marginHorizontal: 4,
  },

  datePickerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  timePickerContainer: {
    width: "100%",
    height: 190,
    alignItems: "center",
    justifyContent: "center",
  },

  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    paddingHorizontal: 4,
  },

  doneButton: {
    width: 100,
  },
});
