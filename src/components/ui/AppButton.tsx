import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import Svg, { Path } from "react-native-svg";

import { COLORS } from "@/theme/colors";

type IconName = ComponentProps<typeof Ionicons>["name"];

type AppButtonProps = {
  children?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  variant?: "primary" | "secondary" | "icon";
  tone?: "primary" | "secondary";
  icon?: IconName;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  accessibilityLabel,
  tone = "primary",
  icon = "add",
  leadingIcon,
  trailingIcon,
  style,
}: AppButtonProps) {
  const [width, setWidth] = useState(0);

  const isDisabled = disabled || loading;
  const isIcon = variant === "icon";

  const isPrimary =
    variant === "primary" || (variant === "icon" && tone === "primary");

  const height = isIcon ? 52 : variant === "secondary" ? 48 : 54;
  const cut = isIcon ? 12 : 10;

  function handleLayout(event: LayoutChangeEvent) {
    const nextWidth = event.nativeEvent.layout.width;

    setWidth((previous) =>
      Math.abs(nextWidth - previous) > 0.5 ? nextWidth : previous,
    );
  }

  const shapePath = `
    M ${cut} 0
    L ${width} 0
    L ${width} ${height - cut}
    L ${width - cut} ${height}
    L 0 ${height}
    L 0 ${cut}
    Z
  `;

  const foreground = isPrimary ? COLORS.background : COLORS.lightGold;

  return (
    <Pressable
      onPress={onPress}
      onLayout={handleLayout}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ??
        (typeof children === "string"
          ? children
          : isIcon
            ? "Icon button"
            : undefined)
      }
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      style={({ pressed }) => [
        styles.container,
        {
          height,
          width: isIcon ? 52 : undefined,
          alignSelf: isIcon ? "flex-start" : "stretch",
          opacity: isDisabled ? 0.4 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
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
            d={shapePath}
            fill={isPrimary ? COLORS.gold : COLORS.goldBackground}
            stroke={isPrimary ? COLORS.lightGold : COLORS.goldBorder}
            strokeWidth={1}
          />

          <Path
            d={`M ${cut} 0 L ${Math.min(width - 4, cut + 25)} 0`}
            stroke={isPrimary ? COLORS.lightGold : COLORS.gold}
            strokeWidth={1.4}
          />
        </Svg>
      )}

      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : isIcon ? (
        <Ionicons name={icon} size={27} color={foreground} />
      ) : (
        <View style={styles.content}>
          {leadingIcon && (
            <View style={styles.leadingIconContainer}>
              <Ionicons name={leadingIcon} size={18} color={foreground} />
            </View>
          )}

          <Text
            style={[
              styles.label,
              {
                color: foreground,
                fontSize: variant === "secondary" ? 13 : 15,
              },
            ]}
          >
            {children}
          </Text>

          {trailingIcon && (
            <Ionicons name={trailingIcon} size={16} color={foreground} />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    paddingHorizontal: 16,
  },

  leadingIconContainer: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.25)",
    backgroundColor: "rgba(214,173,101,0.10)",
  },

  label: {
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
