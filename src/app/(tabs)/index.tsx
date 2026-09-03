import { Screen } from "@/components/ui/Screen";
import { Today } from "@/features/today";

export default function HomePage() {
  return (
    <Screen scrollable>
      <Today />
    </Screen>
  );
}