import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { COLORS } from "@/theme/colors";

export function TodayOverview() {
  const formattedDate = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  function handleTraceActivity() {
    router.push({
      pathname: "/activities/new",
      params: {
        source: "today",
      },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        <View style={styles.dateDot} />

        <Text style={styles.dateText}>TODAY · {formattedDate}</Text>
      </View>

      <Text style={styles.title}>Your life, today</Text>

      <Text style={styles.subtitle}>
        Not about doing more. About living more intentionally.
      </Text>

      <AppButton
        variant="secondary"
        leadingIcon="add"
        trailingIcon="arrow-forward"
        accessibilityLabel="Trace activity"
        onPress={handleTraceActivity}
        style={styles.traceButton}
      >
        Trace activity
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  dateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  dateText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  title: {
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "600",
    letterSpacing: -1.1,
    marginTop: 15,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 23,
    marginTop: 9,
    maxWidth: 420,
  },

  traceButton: {
    alignSelf: "flex-start",
    marginTop: 23,
    marginBottom: 4,
  },
});
