import { PropsWithChildren, Ref } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  scrollRef?: Ref<ScrollView>;
}>;

const BACKGROUND = "#080A10";

export function Screen({
  children,
  scrollable = false,
  scrollRef,
}: ScreenProps) {
  if (scrollable) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: BACKGROUND }}
        className="bg-background"
        edges={["top", "left", "right", "bottom"]}
      >
        <ScrollView
          ref={scrollRef}
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
          keyboardDismissMode="interactive"
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
