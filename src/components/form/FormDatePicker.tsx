import { useState } from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import { format } from "date-fns";

type FormDatePickerProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
};

export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
}: FormDatePickerProps<T>) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const rawValue: unknown = field.value;

        const value =
          rawValue instanceof Date
            ? rawValue
            : typeof rawValue === "string"
              ? new Date(rawValue)
              : new Date();

        function handleDateConfirm(params: { date: Date | undefined }) {
          setIsDatePickerOpen(false);

          if (!params.date) {
            return;
          }

          const nextDate = new Date(value);

          nextDate.setFullYear(
            params.date.getFullYear(),
            params.date.getMonth(),
            params.date.getDate(),
          );

          field.onChange(nextDate);
        }

        function handleTimeConfirm({
          hours,
          minutes,
        }: {
          hours: number;
          minutes: number;
        }) {
          setIsTimePickerOpen(false);

          const nextDate = new Date(value);

          nextDate.setHours(hours, minutes, 0, 0);

          field.onChange(nextDate);
        }

        return (
          <View className="gap-2">
            <Text variant="titleMedium">{label}</Text>

            <View className="flex-row gap-3">
              <TextInput
                mode="outlined"
                label="Date"
                value={format(value, "dd.MM.yyyy")}
                editable={false}
                className="flex-1"
                right={
                  <TextInput.Icon
                    icon="calendar"
                    onPress={() => setIsDatePickerOpen(true)}
                  />
                }
                onPressIn={() => setIsDatePickerOpen(true)}
              />

              <TextInput
                mode="outlined"
                label="Time"
                value={format(value, "HH:mm")}
                editable={false}
                className="flex-1"
                right={
                  <TextInput.Icon
                    icon="clock-outline"
                    onPress={() => setIsTimePickerOpen(true)}
                  />
                }
                onPressIn={() => setIsTimePickerOpen(true)}
              />
            </View>

            <DatePickerModal
              locale="en"
              mode="single"
              visible={isDatePickerOpen}
              date={value}
              onDismiss={() => setIsDatePickerOpen(false)}
              onConfirm={handleDateConfirm}
            />

            <TimePickerModal
              locale="en"
              visible={isTimePickerOpen}
              hours={value.getHours()}
              minutes={value.getMinutes()}
              onDismiss={() => setIsTimePickerOpen(false)}
              onConfirm={handleTimeConfirm}
              use24HourClock
            />

            <HelperText type="error" visible={!!fieldState.error}>
              {fieldState.error?.message}
            </HelperText>
          </View>
        );
      }}
    />
  );
}
