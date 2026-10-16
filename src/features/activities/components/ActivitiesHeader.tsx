import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import { ActivityClassification } from "@/types/activity";
import { COLORS } from "@/theme/colors";

import { EnergyFilter } from "./EnergyFilter";
import type { ActivityFilter } from "../hooks/useActivities";

type Props = {
  searchQuery: string;
  filter: ActivityFilter;
  errorMessage: string | null;
  setSearchQuery: (value: string) => void;
  setFilter: (value: ActivityFilter) => void;
};

export function ActivitiesHeader({
  searchQuery,
  filter,
  errorMessage,
  setSearchQuery,
  setFilter,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Svg
          style={StyleSheet.absoluteFill}
          width="100%"
          height="100%"
          viewBox="0 0 100 48"
          preserveAspectRatio="none"
          pointerEvents="none"
        >
          <Path
            d="M 12 0 L 100 0 L 100 36 L 88 48 L 0 48 L 0 12 Z"
            fill={COLORS.surface}
            stroke={COLORS.goldBorder}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <Path
            d="M 12 0 L 38 0"
            stroke={COLORS.gold}
            strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
          />
        </Svg>

        <Ionicons name="search-outline" size={20} color={COLORS.gold} />

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search your traces"
          placeholderTextColor={COLORS.subtle}
          style={styles.searchInput}
          selectionColor={COLORS.gold}
          returnKeyType="search"
          accessibilityLabel="Search activities"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => setSearchQuery("")}
            hitSlop={10}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={COLORS.muted}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.filtersContainer}>
        <EnergyFilter
          label="All"
          selected={filter === "all"}
          onPress={() => setFilter("all")}
        />
        <EnergyFilter
          label="Growing"
          color={COLORS.growing}
          selected={filter === ActivityClassification.Serves}
          onPress={() => setFilter(ActivityClassification.Serves)}
        />
        <EnergyFilter
          label="Restoring"
          color={COLORS.restoring}
          selected={filter === ActivityClassification.Restores}
          onPress={() => setFilter(ActivityClassification.Restores)}
        />
        <EnergyFilter
          label="Leaks"
          color={COLORS.leak}
          selected={filter === ActivityClassification.DoesNotServe}
          onPress={() => setFilter(ActivityClassification.DoesNotServe)}
        />
      </View>

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={COLORS.leak}
          />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  searchContainer: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 0,
    fontSize: 14,
    color: COLORS.text,
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    backgroundColor: COLORS.dangerBackground,
    borderRadius: 12,
  },
  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 12,
    lineHeight: 18,
  },
});