import { View } from "react-native";

import { AppCard } from "../../../components/ui/AppCard";
import { AppText } from "../../../components/ui/AppText";

export type TodayHeroProps = {
  emoji: string;
  title: string;
  investedTime: string;
  message: string;
};

export function TodayHero({
  emoji,
  title,
 investedTime,
  message,
}: TodayHeroProps) {
  return (
    <AppCard
      elevation={0}
      className="rounded-hero bg-primary p-hero"
    >
      <View className="items-center">

        <AppText
          variant="headline"
          className="text-5xl"
        >
          {emoji}
        </AppText>

        <AppText
          variant="title"
          align="center"
          className="mt-md text-white"
        >
          {title}
        </AppText>

        <AppText
          variant="display"
          align="center"
          className="mt-lg text-white"
        >
          {investedTime}
        </AppText>

        <AppText
          variant="body"
          align="center"
          className="mt-md text-white/90"
        >
          {message}
        </AppText>

      </View>
    </AppCard>
  );
}