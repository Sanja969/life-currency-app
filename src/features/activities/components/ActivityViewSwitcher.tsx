import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/theme/colors";

export type ActivityView = "calendar" | "list";

type Props = {
  value: ActivityView;
  onChange: (view: ActivityView) => void;
};

export function ActivityViewSwitcher({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {(["calendar", "list"] as const).map((view) => {
        const selected = value === view;

        return (
          <Pressable
            key={view}
            onPress={() => onChange(view)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.button, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {view.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.gold}25`,
    marginTop: 22,
  },

  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },

  selected: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold,
  },

  label: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  selectedLabel: {
    color: COLORS.gold,
  },
});
