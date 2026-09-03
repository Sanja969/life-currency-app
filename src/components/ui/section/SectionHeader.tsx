import { PropsWithChildren } from "react";
import { View } from "react-native";

type SectionHeaderProps = PropsWithChildren;

export function SectionHeader({
  children,
}: SectionHeaderProps) {
  return (
    <View className="mb-md">
      {children}
    </View>
  );
}