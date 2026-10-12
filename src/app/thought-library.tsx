import { useMemo, useState } from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenTopBar } from "@/components/layout/ScreenTopBar";
import { ThoughtDetails } from "@/features/today/components/ThoughtDetails";

import {
  DAILY_THOUGHTS,
  type DailyThought,
} from "@/features/today/data/dailyThoughts";

import { COLORS } from "@/theme/colors";
import { Stack } from "expo-router";

type Category = DailyThought["category"] | "all";

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "All", value: "all" },
  { label: "Philosophy", value: "philosophy" },
  { label: "Psychology", value: "psychology" },
  { label: "Physics", value: "physics" },
  { label: "Cinema", value: "cinema" },
];

export default function ThoughtLibraryScreen() {
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [selectedThought, setSelectedThought] = useState<DailyThought | null>(
    null,
  );

  const filteredThoughts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return DAILY_THOUGHTS.filter((thought) => {
      const matchesCategory =
        category === "all" || thought.category === category;

      const matchesSearch =
        !query ||
        thought.quote.toLowerCase().includes(query) ||
        thought.author.toLowerCase().includes(query) ||
        thought.source.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  function surpriseMe() {
    if (DAILY_THOUGHTS.length === 0) return;

    const randomIndex = Math.floor(Math.random() * DAILY_THOUGHTS.length);

    setSelectedThought(DAILY_THOUGHTS[randomIndex]);
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScreenTopBar title="THOUGHT LIBRARY" />

        <FlatList
          data={filteredThoughts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <View style={styles.pageHeader}>
                <Text style={styles.title}>Thought Library</Text>

                <Text style={styles.subtitle}>
                  Ideas worth spending time with.
                </Text>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={COLORS.muted}
                />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search thoughts or authors"
                  placeholderTextColor={COLORS.subtle}
                  style={styles.searchInput}
                  autoCorrect={false}
                />
              </View>

              <FlatList
                horizontal
                data={CATEGORIES}
                keyExtractor={(item) => item.value}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filters}
                renderItem={({ item }) => {
                  const active = category === item.value;

                  return (
                    <Pressable
                      onPress={() => setCategory(item.value)}
                      style={[styles.filter, active && styles.activeFilter]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          active && styles.activeFilterText,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                }}
              />

              <Pressable
                onPress={surpriseMe}
                style={styles.surpriseButton}
                accessibilityRole="button"
              >
                <Ionicons
                  name="sparkles-outline"
                  size={17}
                  color={COLORS.lightGold}
                />

                <Text style={styles.surpriseText}>Surprise me</Text>

                <Ionicons name="arrow-forward" size={16} color={COLORS.gold} />
              </Pressable>

              <Text style={styles.resultsLabel}>
                {filteredThoughts.length} THOUGHTS
              </Text>
            </>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedThought(item)}
              style={({ pressed }) => [
                styles.thoughtItem,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.quote}>“{item.quote}”</Text>

              <View style={styles.itemFooter}>
                <Text style={styles.author}>— {item.author}</Text>

                <Ionicons name="arrow-forward" size={15} color={COLORS.gold} />
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No thoughts found. Try another search.
            </Text>
          }
        />
      </SafeAreaView>

      <ThoughtDetails
        thought={selectedThought}
        visible={selectedThought !== null}
        onClose={() => setSelectedThought(null)}
      />
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

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 70,
  },

  pageHeader: {
    marginTop: 20,
    marginBottom: 24,
  },

  title: {
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "600",
    letterSpacing: -1.1,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },

  filters: {
    gap: 9,
    paddingTop: 20,
    paddingBottom: 18,
  },

  filter: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  activeFilter: {
    borderColor: COLORS.gold,
    backgroundColor: `${COLORS.gold}15`,
  },

  filterText: {
    color: COLORS.muted,
    fontSize: 12,
  },

  activeFilterText: {
    color: COLORS.lightGold,
  },

  surpriseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 17,
  },

  surpriseText: {
    color: COLORS.lightGold,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  resultsLabel: {
    color: COLORS.subtle,
    fontSize: 10,
    letterSpacing: 1.4,
    marginTop: 12,
    marginBottom: 12,
  },

  thoughtItem: {
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.gold}20`,
  },

  quote: {
    color: "#EAE4DC",
    fontSize: 16,
    lineHeight: 25,
    fontStyle: "italic",
  },

  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  author: {
    color: COLORS.muted,
    fontSize: 12,
  },

  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 30,
  },
});
