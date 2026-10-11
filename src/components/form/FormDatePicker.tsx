import { useEffect, useRef, useState, type ReactNode } from "react";

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

import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import Svg, { Path } from "react-native-svg";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { AppButton } from "@/components/ui/AppButton";
import { COLORS } from "@/theme/colors";

/*
 * TYPES
 */

type FormDatePickerProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
};

type DateTimeFieldsProps = {
  value: Date;
  label?: string;
  error?: string;
  onChange: (value: Date) => void;
  onBlur: () => void;
};

type AngularSurfaceProps = {
  children: ReactNode;
  focused?: boolean;
  error?: boolean;
};

/*
 * CONSTANTS
 */

const CORNER_CUT = 10;

const MODAL_SURFACE = "#151720";
const MODAL_OVERLAY = "rgba(0,0,0,0.82)";

const TIME_ERROR_MESSAGE = "Use HH:mm, for example 14:30";

/*
 * HELPERS
 */

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

function normalizeTime(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function parseTime(text: string): {
  hours: number;
  minutes: number;
} | null {
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
 * ANGULAR SURFACE
 */

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
    ? COLORS.danger
    : focused
      ? COLORS.gold
      : COLORS.goldBorder;

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
              d={`
                M ${CORNER_CUT} 0
                L ${Math.min(width - 4, CORNER_CUT + 30)} 0
              `}
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
 * REACT HOOK FORM INTEGRATION
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

        const value = fieldValue instanceof Date ? fieldValue : new Date(NaN);

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

/*
 * DATE AND TIME FIELDS
 */

function DateTimeFields({
  value,
  label,
  error,
  onChange,
  onBlur,
}: DateTimeFieldsProps) {
  const { width: screenWidth } = useWindowDimensions();

  const modalWidth = Math.min(screenWidth - 32, 380);

  /*
   * PICKER STATE
   */

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);

  /*
   * TIME INPUT STATE
   */

  const [timeText, setTimeText] = useState(
    isValidDate(value) ? formatTime(value) : "",
  );

  const [timeError, setTimeError] = useState<string | null>(null);

  const [timeFocused, setTimeFocused] = useState(false);

  /*
   * LAST VALID DATE
   *
   * Prevent losing the selected date
   * when the user enters invalid time.
   */

  const lastValidDateRef = useRef<Date>(
    isValidDate(value) ? new Date(value) : new Date(),
  );

  /*
   * UPDATE LAST VALID DATE
   */

  useEffect(() => {
    if (isValidDate(value)) {
      lastValidDateRef.current = new Date(value);
    }
  }, [value]);

  /*
   * DISPLAY DATE
   *
   * Never pass Invalid Date to date-fns
   * or native date/time pickers.
   */

  const displayDate = isValidDate(value) ? value : lastValidDateRef.current;

  /*
   * SYNC TIME INPUT
   *
   * Do not overwrite the user's text
   * while they are editing it.
   */

  useEffect(() => {
    if (!timeFocused && isValidDate(value)) {
      setTimeText(formatTime(value));
    }
  }, [value, timeFocused]);

  /*
   * UPDATE TIME FROM TEXT INPUT
   */

  function updateTime(text: string) {
    const normalized = normalizeTime(text);

    setTimeText(normalized);

    const parsed = parseTime(normalized);

    if (!parsed) {
      setTimeError(TIME_ERROR_MESSAGE);

      /*
       * Mark the RHF field as invalid.
       * Zod will block form submission.
       */
      onChange(new Date(NaN));

      return;
    }

    /*
     * Preserve the selected calendar date.
     */
    const nextDate = new Date(lastValidDateRef.current);

    nextDate.setHours(parsed.hours, parsed.minutes, 0, 0);

    setTimeError(null);

    onChange(nextDate);
  }

  /*
   * TIME INPUT BLUR
   */

  function handleTimeBlur() {
    setTimeFocused(false);

    if (!parseTime(timeText)) {
      setTimeError(TIME_ERROR_MESSAGE);
    } else {
      setTimeError(null);
    }

    onBlur();
  }

  /*
   * DATE CHANGE
   */

  function handleDateChange(selectedDate: Date) {
    const nextDate = new Date(lastValidDateRef.current);

    nextDate.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    /*
     * Preserve invalid time state.
     *
     * Selecting a new date must not
     * silently validate an invalid
     * time input.
     */
    if (timeError) {
      lastValidDateRef.current = nextDate;
      return;
    }

    lastValidDateRef.current = nextDate;

    onChange(nextDate);
  }

  /*
   * TIME CHANGE FROM NATIVE PICKER
   */

  function handleTimeChange(selectedDate: Date) {
    const nextDate = new Date(lastValidDateRef.current);

    nextDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);

    lastValidDateRef.current = nextDate;

    setTimeText(formatTime(nextDate));
    setTimeError(null);

    onChange(nextDate);
  }

  /*
   * OPEN DATE PICKER
   */

  function openDatePicker() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: displayDate,
        mode: "date",

        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            handleDateChange(selectedDate);
          }
        },
      });

      return;
    }

    setShowDatePicker(true);
  }

  /*
   * OPEN TIME PICKER
   */

  function openTimePicker() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: displayDate,
        mode: "time",
        is24Hour: true,

        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            handleTimeChange(selectedDate);
          }
        },
      });

      return;
    }

    setShowTimePicker(true);
  }

  /*
   * RENDER
   */

  return (
    <View style={styles.container}>
      {/* LABEL */}

      {label ? <Text style={styles.label}>{label}</Text> : null}

      {/* DATE AND TIME */}

      <View style={styles.fieldsRow}>
        {/* DATE */}

        <View style={styles.fieldColumn}>
          <AngularSurface>
            <Pressable
              onPress={openDatePicker}
              accessibilityRole="button"
              accessibilityLabel="Select date"
              style={({ pressed }) => [
                styles.fieldContent,
                {
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Text style={styles.fieldCaption}>DATE</Text>

              <View style={styles.fieldValueRow}>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={styles.fieldValue}
                >
                  {format(displayDate, "dd.MM.yyyy")}
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
                  accessibilityLabel="Activity time"
                  style={styles.timeInput}
                />

                <Pressable
                  onPress={openTimePicker}
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

      {/* VALIDATION ERRORS */}

      {timeError ? <Text style={styles.errorText}>{timeError}</Text> : null}

      {error && !timeError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {/* IOS DATE MODAL */}

      {Platform.OS === "ios" && (
        <Modal
          transparent
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            {/* BACKDROP */}

            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowDatePicker(false)}
              accessibilityRole="button"
              accessibilityLabel="Close date picker"
            />

            <View
              style={[
                styles.modalCard,
                {
                  width: modalWidth,
                },
              ]}
            >
              <Text style={styles.modalEyebrow}>LIFE CURRENCY</Text>

              <Text style={styles.modalTitle}>Select date</Text>

              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={displayDate}
                  mode="date"
                  themeVariant="dark"
                  display="inline"
                  style={{
                    width: "100%",
                    alignSelf: "center",
                  }}
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      handleDateChange(selectedDate);
                    }
                  }}
                />
              </View>

              <View style={styles.modalFooter}>
                <AppButton
                  variant="secondary"
                  onPress={() => setShowDatePicker(false)}
                  style={styles.doneButton}
                >
                  Done
                </AppButton>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* IOS TIME MODAL */}

      {Platform.OS === "ios" && (
        <Modal
          transparent
          animationType="fade"
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            {/* BACKDROP */}

            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowTimePicker(false)}
              accessibilityRole="button"
              accessibilityLabel="Close time picker"
            />

            <View
              style={[
                styles.modalCard,
                {
                  width: modalWidth,
                },
              ]}
            >
              <Text style={styles.modalEyebrow}>LIFE CURRENCY</Text>

              <Text style={styles.modalTitle}>Select time</Text>

              <View style={styles.timePickerContainer}>
                <DateTimePicker
                  value={displayDate}
                  mode="time"
                  themeVariant="dark"
                  display="spinner"
                  is24Hour
                  style={{
                    width: "100%",
                    height: 180,
                    alignSelf: "center",
                  }}
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      handleTimeChange(selectedDate);
                    }
                  }}
                />
              </View>

              <View style={styles.modalFooter}>
                <AppButton
                  variant="secondary"
                  onPress={() => setShowTimePicker(false)}
                  style={styles.doneButton}
                >
                  Done
                </AppButton>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

/*
 * STYLES
 */

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
    color: COLORS.danger,
    fontSize: 12,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: MODAL_OVERLAY,
  },

  modalCard: {
    backgroundColor: MODAL_SURFACE,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
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
