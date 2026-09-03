import { PropsWithChildren } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

type SectionProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
}>;

export function Section({
  title,
  subtitle,
  children,
}: SectionProps) {
  return (
    <View className="mb-section">
      {title && (
        <Text className="text-h2 font-semibold text-textPrimary">
          {title}
        </Text>
      )}

      {subtitle && (
        <Text className="mt-xs text-body text-textSecondary">
          {subtitle}
        </Text>
      )}

      <View className="mt-md">
        {children}
      </View>
    </View>
  );
}