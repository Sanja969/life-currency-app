import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import {
  HelperText,
  SegmentedButtons,
  Text,
} from "react-native-paper";

type SegmentItem = {
  label: string;
  value: string;
};

type FormSegmentedControlProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  items: SegmentItem[];
};

export function FormSegmentedControl<T extends FieldValues>({
  control,
  name,
  label,
  items,
}: FormSegmentedControlProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <>
          <Text variant="labelLarge">{label}</Text>

          <SegmentedButtons
            value={field.value}
            onValueChange={field.onChange}
            buttons={items.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
          />

          <HelperText type="error" visible={!!error}>
            {error?.message}
          </HelperText>
        </>
      )}
    />
  );
}