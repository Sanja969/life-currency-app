import { PropsWithChildren } from "react";

import { View } from "react-native";

type HeroCardProps = PropsWithChildren;

export function HeroCard({ children }: HeroCardProps) {
  return (
    <View
      className="
        rounded-hero
        bg-primary
        p-8

      "
    >
      {children}
    </View>
  );
}
