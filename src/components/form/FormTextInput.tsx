import { useState } from "react";

import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type LayoutChangeEvent,
} from "react-native";

import Svg, { Path } from "react-native-svg";

import { COLORS } from "@/theme/colors";

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
  const [focused, setFocused] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(multiline ? 100 : 56);

  function handleLayout(event: LayoutChangeEvent) {
    const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout;

    setWidth((previous) =>
      Math.abs(nextWidth - previous) > 0.5 ? nextWidth : previous,
    );

    setHeight((previous) =>
      Math.abs(nextHeight - previous) > 0.5 ? nextHeight : previous,
    );
  }

  const cut = 10;

  const path = `
    M ${cut} 0
    L ${width} 0
    L ${width} ${height - cut}
    L ${width - cut} ${height}
    L 0 ${height}
    L 0 ${cut}
    Z
  `;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const borderColor = fieldState.error
          ? COLORS.danger
          : focused
            ? COLORS.gold
            : COLORS.goldBorder;

        return (
          <View style={styles.wrapper}>
            {label ? <Text style={styles.label}>{label}</Text> : null}

            <View
              onLayout={handleLayout}
              style={[
                styles.inputContainer,
                multiline
                  ? styles.multilineContainer
                  : styles.singleLineContainer,
              ]}
            >
              {width > 0 && (
                <Svg
                  pointerEvents="none"
                  width={width}
                  height={height}
                  style={StyleSheet.absoluteFill}
                >
                  <Path
                    d={path}
                    fill={COLORS.surface}
                    stroke={borderColor}
                    strokeWidth={focused ? 1.4 : 1}
                  />

                  {focused && (
                    <Path
                      d={`M ${cut} 0 L ${Math.min(width - 4, cut + 32)} 0`}
                      stroke={COLORS.lightGold}
                      strokeWidth={1.5}
                    />
                  )}
                </Svg>
              )}

              <TextInput
                {...props}
                value={field.value?.toString() ?? ""}
                onChangeText={(value) => {
                  field.onChange(value);
                  props.onChangeText?.(value);
                }}
                onFocus={(event) => {
                  setFocused(true);
                  props.onFocus?.(event);
                }}
                onBlur={(event) => {
                  setFocused(false);
                  field.onBlur();
                  props.onBlur?.(event);
                }}
                multiline={multiline}
                placeholderTextColor={COLORS.muted}
                selectionColor={COLORS.gold}
                cursorColor={COLORS.lightGold}
                textAlignVertical={multiline ? "top" : "center"}
                style={[
                  styles.input,
                  multiline ? styles.multilineInput : styles.singleLineInput,
                  props.style,
                ]}
              />
            </View>

            {fieldState.error && (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 9,
  },

  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  inputContainer: {
    width: "100%",
    justifyContent: "center",
  },

  singleLineContainer: {
    height: 56,
  },

  multilineContainer: {
    minHeight: 100,
  },

  input: {
    color: COLORS.text,
    fontSize: 15,
    paddingHorizontal: 17,
    backgroundColor: "transparent",
  },

  singleLineInput: {
    height: 56,
    paddingVertical: 0,
  },

  multilineInput: {
    minHeight: 100,
    paddingTop: 16,
    paddingBottom: 16,
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    lineHeight: 18,
  },
});
