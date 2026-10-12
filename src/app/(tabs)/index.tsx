import { useRef } from "react";
import { ScrollView } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { Today } from "@/features/today";

export default function HomePage() {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <Screen scrollable scrollRef={scrollRef}>
      <Today scrollRef={scrollRef} />
    </Screen>
  );
}
