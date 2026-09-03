import { PropsWithChildren } from "react";
import { View } from "react-native";

type SectionContentProps = PropsWithChildren;

export function SectionContent({
  children,
}: SectionContentProps) {
  return (
    <View className="gap-md">
      {children}
    </View>
  );
}