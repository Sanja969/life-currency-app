import { useEffect, useState } from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

type FormDatePickerProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
};

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
};

function DateTimeFields({
  value,
  label,
  error,
  onChange,
}: DateTimeFieldsProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);

  const [timeText, setTimeText] = useState(formatTime(value));

  const [timeError, setTimeError] = useState<string | null>(null);

  useEffect(() => {
    setTimeText(formatTime(value));
  }, [value]);

  function updateTime(text: string) {
    const normalized = normalizeTime(text);

    setTimeText(normalized);

    const parsed = parseTime(normalized);

    if (!parsed) {
      return;
    }

    const nextDate = new Date(value);

    nextDate.setHours(parsed.hours, parsed.minutes, 0, 0);

    setTimeError(null);
    onChange(nextDate);
  }

  function handleTimeBlur() {
    if (!parseTime(timeText)) {
      setTimeError("Use HH:mm, for example 14:30");
      return;
    }

    setTimeError(null);
  }

  return (
    <View className="gap-3">
      {label ? (
        <Text className="text-sm font-medium text-slate-200">{label}</Text>
      ) : null}

      <View className="flex-row gap-3">
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="flex-1 rounded-2xl border border-[#26365A] bg-[#0D152B]/90 px-4 py-3"
        >
          <Text className="text-xs text-slate-500">Date</Text>

          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-white">
              {format(value, "dd.MM.yyyy")}
            </Text>

            <Ionicons name="calendar-outline" size={21} color="#9CA7FF" />
          </View>
        </Pressable>

        <View className="flex-1 flex-row items-center rounded-2xl border border-[#26365A] bg-[#0D152B]/90 px-4">
          <View className="flex-1 py-2">
            <Text className="text-xs text-slate-500">Time</Text>

            <TextInput
              value={timeText}
              onChangeText={updateTime}
              onBlur={handleTimeBlur}
              keyboardType="number-pad"
              placeholder="14:30"
              placeholderTextColor="#68738D"
              selectionColor="#7C83FF"
              cursorColor="#7C83FF"
              maxLength={5}
              selectTextOnFocus
              className="mt-1 p-0 text-base font-semibold text-white"
            />
          </View>

          <Pressable onPress={() => setShowTimePicker(true)} hitSlop={10}>
            <Ionicons name="time-outline" size={23} color="#9CA7FF" />
          </Pressable>
        </View>
      </View>

      {timeError ? (
        <Text className="text-sm text-red-400">{timeError}</Text>
      ) : null}

      {error ? <Text className="text-sm text-red-400">{error}</Text> : null}

      <Modal
        transparent
        animationType="fade"
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/80 px-5">
          <View className="w-full rounded-3xl border border-[#26365A] bg-[#091124] p-5">
            <Text className="mb-3 text-lg font-semibold text-white">
              Select date
            </Text>

            <DateTimePicker
              value={value}
              mode="date"
              themeVariant="dark"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_, selectedDate) => {
                if (!selectedDate) {
                  return;
                }

                const nextDate = new Date(value);

                nextDate.setFullYear(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate(),
                );

                onChange(nextDate);

                if (Platform.OS !== "ios") {
                  setShowDatePicker(false);
                }
              }}
            />

            {Platform.OS === "ios" ? (
              <Pressable
                onPress={() => setShowDatePicker(false)}
                className="mt-4 self-end rounded-xl bg-[#172653] px-5 py-2.5"
              >
                <Text className="font-semibold text-indigo-100">Done</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={showTimePicker}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/80 px-5">
          <View className="w-full rounded-3xl border border-[#26365A] bg-[#091124] p-5">
            <Text className="mb-2 text-lg font-semibold text-white">
              Select time
            </Text>

            <DateTimePicker
              value={value}
              mode="time"
              themeVariant="dark"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              is24Hour
              onChange={(_, selectedDate) => {
                if (!selectedDate) {
                  return;
                }

                const nextDate = new Date(value);

                nextDate.setHours(
                  selectedDate.getHours(),
                  selectedDate.getMinutes(),
                  0,
                  0,
                );

                setTimeText(formatTime(nextDate));

                setTimeError(null);
                onChange(nextDate);

                if (Platform.OS !== "ios") {
                  setShowTimePicker(false);
                }
              }}
            />

            {Platform.OS === "ios" ? (
              <Pressable
                onPress={() => setShowTimePicker(false)}
                className="mt-4 self-end rounded-xl bg-[#172653] px-5 py-2.5"
              >
                <Text className="font-semibold text-indigo-100">Done</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
