import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { QuickAddSuggestion } from "@/services/ActivityService";
import { CLASSIFICATION_THEME } from "@/theme/classification";
import { COLORS } from "@/theme/colors";
import { formatDuration } from "@/utils/formatDuration";

type QuickAddSectionProps = {
  suggestions: QuickAddSuggestion[];
  onSelect: (suggestion: QuickAddSuggestion) => void;
};

export function QuickAddSection({
  suggestions,
  onSelect,
}: QuickAddSectionProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>QUICK ADD</Text>

          <Text style={styles.subtitle}>Familiar moments, one tap away.</Text>
        </View>

        <Ionicons name="flash-outline" size={18} color={COLORS.gold} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {suggestions.map((suggestion) => {
          const theme = CLASSIFICATION_THEME[suggestion.classification];

          return (
            <CosmicPanel
              key={suggestion.key}
              variant="subtle"
              accent={theme.color}
              style={styles.card}
              contentStyle={styles.cardContent}
              onPress={() => onSelect(suggestion)}
            >
              <View style={styles.cardBody}>
                <View
                  style={[styles.accent, { backgroundColor: theme.color }]}
                />

                <Text style={styles.title} numberOfLines={1}>
                  {suggestion.title}
                </Text>

                <Text style={styles.duration}>
                  {formatDuration(suggestion.durationMinutes)}
                </Text>

                <View style={styles.cardFooter}>
                  <Text
                    numberOfLines={1}
                    style={[styles.classification, { color: theme.color }]}
                  >
                    {theme.shortLabel}
                  </Text>

                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color={COLORS.gold}
                  />
                </View>
              </View>
            </CosmicPanel>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 22,
  },

  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  label: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },

  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },

  card: {
    width: 158,
  },

  cardContent: {
    padding: 14,
  },

  cardBody: {
    minHeight: 88,
    justifyContent: "space-between",
  },

  accent: {
    width: 22,
    height: 3,
    backgroundColor: COLORS.gold,
    marginBottom: 12,
  },

  title: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },

  duration: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 7,
  },

  cardFooter: {
    marginTop: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 5,
  },

  classification: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: "600",
  },
});
