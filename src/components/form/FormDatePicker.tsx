import { useState } from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Button, HelperText, Text } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
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
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <>
          <Text variant="labelLarge">{label}</Text>

          <Button mode="outlined" onPress={() => setOpen(true)}>
            {field.value ? format(field.value, "dd.MM.yyyy") : "Select date"}
          </Button>

          <DatePickerModal
            locale="en"
            mode="single"
            visible={open}
            onDismiss={() => setOpen(false)}
            date={field.value ?? new Date()}
            onConfirm={({ date }) => {
              setOpen(false);

              if (date) {
                field.onChange(date);
              }
            }}
          />

          <HelperText type="error" visible={!!error}>
            {error?.message}
          </HelperText>
        </>
      )}
    />
  );
}
