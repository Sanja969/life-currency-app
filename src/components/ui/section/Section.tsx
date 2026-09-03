import { PropsWithChildren } from "react";
import { View } from "react-native";

import { SectionContent } from "./SectionContent";
import { SectionHeader } from "./SectionHeader";

type SectionRootProps = PropsWithChildren;

function SectionRoot({ children }: SectionRootProps) {
  return <View className="mb-section">{children}</View>;
}

export const Section = Object.assign(SectionRoot, {
  Header: SectionHeader,
  Content: SectionContent,
});