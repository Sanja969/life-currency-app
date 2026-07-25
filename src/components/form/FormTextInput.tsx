import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { TextInput, HelperText } from "react-native-paper";
import { TextInputProps } from "react-native";

type PaperTextInputProps = React.ComponentProps<typeof TextInput>;

type FormTextInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
} & Omit<PaperTextInputProps, "value" | "onChangeText" | "onBlur">;

export function FormTextInput<T extends FieldValues>({
  control,
  name,
  label,
  ...textInputProps
}: FormTextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <>
          <TextInput
            mode="outlined"
            label={label}
            value={field.value?.toString() ?? ""}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={!!error}
            {...textInputProps}
          />

          <HelperText type="error" visible={!!error}>
            {error?.message}
          </HelperText>
        </>
      )}
    />
  );
}
