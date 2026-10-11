import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { dailyReflectionService } from "@/services/DailyReflectionService";
import { COLORS } from "@/theme/colors";

import type { DailyReflection } from "@/types/dailyReflection";

function formatReflectionDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ReflectionHistory() {
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadReflections() {
        setIsLoading(true);
        setErrorMessage(null);

        try {
          const data =
            await dailyReflectionService.getRecentReflections(100);

          if (active) {
            setReflections(data);
          }
        } catch (error) {
          if (active) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Unable to load reflections.",
            );
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      }

      void loadReflections();

      return () => {
        active = false;
      };
    }, []),
  );

  const renderReflection = useCallback(
    ({ item }: { item: DailyReflection }) => (
      <View style={styles.reflectionCard}>
        <View style={styles.cardAccent} />

        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={15}
            color={COLORS.gold}
          />

          <Text style={styles.dateText}>
            {formatReflectionDate(item.reflectionDate)}
          </Text>
        </View>

        <Text style={styles.reflectionText}>
          {item.content}
        </Text>
      </View>
    ),
    [],
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Reflection History
            </Text>

            <Text style={styles.subtitle}>
              Moments worth remembering.
            </Text>
          </View>
        </View>

        {/* CONTENT */}

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator
              size="large"
              color={COLORS.gold}
            />
          </View>
        ) : errorMessage ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          </View>
        ) : (
          <FlatList
            data={reflections}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderReflection}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              reflections.length === 0 && styles.emptyList,
            ]}
            ListHeaderComponent={
              reflections.length > 0 ? (
                <View style={styles.intro}>
                  <View style={styles.goldDot} />

                  <Text style={styles.introText}>
                    A collection of what mattered to you.
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="sparkles-outline"
                  size={32}
                  color={COLORS.gold}
                />

                <Text style={styles.emptyTitle}>
                  Your story begins with a moment.
                </Text>

                <Text style={styles.emptyDescription}>
                  When you save a daily reflection,
                  you'll find it here.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },

  intro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },

  goldDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
  },

  introText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },

  reflectionCard: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: 20,
    marginBottom: 14,
    position: "relative",
  },

  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 48,
    height: 2,
    backgroundColor: COLORS.gold,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 15,
  },

  dateText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },

  reflectionText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 23,
  },

  emptyState: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 40,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 22,
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
  },
});