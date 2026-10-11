import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fa } from "zod/v4/locales";

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
}>;

const BACKGROUND = "#080A10";

export function Screen({ children, scrollable = false }: ScreenProps) {
  if (scrollable) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: BACKGROUND }}
        className="bg-background"
        edges={["top", "left", "right", "bottom"]}
      >
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: BACKGROUND,
          }}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 16,
            paddingBottom: 120,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: BACKGROUND }}
      className="bg-background"
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={{ flex: 1, padding: 16 }}>{children}</View>
    </SafeAreaView>
  );
}
