import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Text, TextInput, TextInputProps, View } from "react-native";

type FormTextInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
} & TextInputProps;

export function FormTextInput<T extends FieldValues>({
  control,
  name,
  label,
  multiline,
  ...props
}: FormTextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View className="gap-2">
          {label ? (
            <Text className="text-sm font-medium text-slate-300">{label}</Text>
          ) : null}

          <TextInput
            value={field.value?.toString() ?? ""}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            multiline={multiline}
            placeholderTextColor="#667085"
            selectionColor="#7C83FF"
            cursorColor="#7C83FF"
            textAlignVertical={multiline ? "top" : "center"}
            className={[
              "rounded-2xl border bg-[#0D152B]/90 px-4 text-base text-white",
              multiline ? "min-h-[92px] py-4" : "min-h-[56px]",
              fieldState.error ? "border-red-400" : "border-[#26365A]",
            ].join(" ")}
            {...props}
          />

          {fieldState.error ? (
            <Text className="text-sm text-red-400">
              {fieldState.error.message}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}
