import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";

import Svg, { Path } from "react-native-svg";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { COLORS } from "@/theme/colors";
import { ActivityCategory } from "@/types/activity";

/*
 * TYPES
 */

type CategorySelectorProps = {
  value?: ActivityCategory;
  onChange: (value: ActivityCategory) => void;
};

type CategoryCardProps = {
  category: ActivityCategory;
  selected: boolean;
  onPress: () => void;
};

/*
 * CONSTANTS
 */

const CATEGORY_OPTIONS: ActivityCategory[] = [
  ActivityCategory.Work,
  ActivityCategory.Learning,
  ActivityCategory.Health,
  ActivityCategory.Relationships,
  ActivityCategory.Rest,
  ActivityCategory.Entertainment,
  ActivityCategory.Mindfulness,
  ActivityCategory.Household,
  ActivityCategory.ChoresErrands,
  ActivityCategory.SocialMedia,
  ActivityCategory.Commuting,
  ActivityCategory.PersonalCare,
  ActivityCategory.Shopping,
  ActivityCategory.Gaming,
  ActivityCategory.AdministrativeTasks,
  ActivityCategory.Other,
];

const INITIAL_VISIBLE_COUNT = 8;

const CARD_HEIGHT = 62;
const CUT = 9;

const CARD_SURFACE = COLORS.surface;
const SELECTED_SURFACE = "#211D18";

const CARD_BORDER = "rgba(214,173,101,0.17)";
const ICON_BACKGROUND = "#171A24";
const ICON_BORDER = "rgba(214,173,101,0.12)";

const SELECTED_ICON_BACKGROUND = "rgba(214,173,101,0.12)";
const SELECTED_ICON_BORDER = "rgba(214,173,101,0.38)";

/*
 * CATEGORY CARD
 */

function CategoryCard({ category, selected, onPress }: CategoryCardProps) {
  const meta = getActivityCategoryMeta(category);

  const [width, setWidth] = useState(0);

  function handleLayout(event: LayoutChangeEvent) {
    const nextWidth = event.nativeEvent.layout.width;

    setWidth((previousWidth) => {
      if (Math.abs(nextWidth - previousWidth) < 0.5) {
        return previousWidth;
      }

      return nextWidth;
    });
  }

  const path = `
    M ${CUT} 0
    L ${width} 0
    L ${width} ${CARD_HEIGHT - CUT}
    L ${width - CUT} ${CARD_HEIGHT}
    L 0 ${CARD_HEIGHT}
    L 0 ${CUT}
    Z
  `;

  return (
    <Pressable
      onPress={onPress}
      onLayout={handleLayout}
      accessibilityRole="radio"
      accessibilityLabel={meta.label}
      accessibilityState={{
        checked: selected,
      }}
      style={({ pressed }) => [
        styles.card,
        {
          opacity: pressed ? 0.75 : 1,
          transform: [
            {
              scale: pressed ? 0.98 : 1,
            },
          ],
        },
      ]}
    >
      {/* ANGULAR BACKGROUND */}

      {width > 0 && (
        <Svg
          width={width}
          height={CARD_HEIGHT}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Path
            d={path}
            fill={selected ? SELECTED_SURFACE : CARD_SURFACE}
            stroke={selected ? COLORS.gold : CARD_BORDER}
            strokeWidth={1}
          />

          {/* SELECTED ACCENTS */}

          {selected && (
            <>
              <Path
                d={`
                  M ${CUT} 0
                  L ${Math.min(width - 4, CUT + 30)} 0
                `}
                stroke={COLORS.lightGold}
                strokeWidth={1.5}
              />

              <Path
                d={`
                  M ${width - CUT - 24} ${CARD_HEIGHT}
                  L ${width - CUT} ${CARD_HEIGHT}
                  L ${width} ${CARD_HEIGHT - CUT}
                `}
                stroke={COLORS.lightGold}
                strokeWidth={1.5}
                fill="none"
              />
            </>
          )}
        </Svg>
      )}

      {/* CARD CONTENT */}

      <View style={styles.cardContent}>
        {/* ICON */}

        <View style={[styles.iconFrame, selected && styles.selectedIconFrame]}>
          <Ionicons
            name={meta.icon}
            size={16}
            color={selected ? COLORS.lightGold : COLORS.muted}
          />
        </View>

        {/* LABEL */}

        <Text
          numberOfLines={2}
          style={[
            styles.categoryLabel,
            selected && styles.selectedCategoryLabel,
          ]}
        >
          {meta.label}
        </Text>
      </View>

      {/* SELECTED INDICATOR */}

      {selected && (
        <View pointerEvents="none" style={styles.selectedIndicator} />
      )}
    </Pressable>
  );
}

/*
 * CATEGORY SELECTOR
 */

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const [expanded, setExpanded] = useState(false);

  /*
   * INITIAL CATEGORIES
   */

  const initialCategories = CATEGORY_OPTIONS.slice(0, INITIAL_VISIBLE_COUNT);

  /*
   * KEEP SELECTED CATEGORY VISIBLE
   *
   * If a selected category is outside
   * the initial eight, include it in
   * the collapsed list.
   */

  const selectedCategoryIsHidden =
    value !== undefined &&
    CATEGORY_OPTIONS.indexOf(value) >= INITIAL_VISIBLE_COUNT;

  const visibleCategories = expanded
    ? CATEGORY_OPTIONS
    : selectedCategoryIsHidden
      ? [...initialCategories, value]
      : initialCategories;

  /*
   * RENDER
   */

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.heading}>Life area</Text>

        <Text style={styles.subtitle}>Where did this time go?</Text>
      </View>

      {/* CATEGORY GRID */}

      <View style={styles.grid} accessibilityRole="radiogroup">
        {visibleCategories.map((category) => (
          <View key={category} style={styles.gridItem}>
            <CategoryCard
              category={category}
              selected={value === category}
              onPress={() => onChange(category)}
            />
          </View>
        ))}
      </View>

      {/* SHOW MORE / LESS */}

      <Pressable
        onPress={() => {
          setExpanded((previous) => !previous);
        }}
        accessibilityRole="button"
        accessibilityLabel={
          expanded ? "Show fewer life areas" : "Show all life areas"
        }
        accessibilityState={{
          expanded,
        }}
        style={({ pressed }) => [
          styles.expandButton,
          {
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={styles.expandText}>
          {expanded ? "Show fewer categories" : "Show all categories"}
        </Text>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={15}
          color={COLORS.gold}
        />
      </Pressable>
    </View>
  );
}

/*
 * STYLES
 */

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  header: {},

  heading: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },

  /*
   * GRID
   */

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },

  gridItem: {
    width: "48.5%",
  },

  /*
   * CARD
   */

  card: {
    height: CARD_HEIGHT,
    width: "100%",
    justifyContent: "center",
    position: "relative",
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 9,
  },

  /*
   * ICON
   */

  iconFrame: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: ICON_BORDER,
    backgroundColor: ICON_BACKGROUND,
  },

  selectedIconFrame: {
    borderColor: SELECTED_ICON_BORDER,
    backgroundColor: SELECTED_ICON_BACKGROUND,
  },

  /*
   * LABEL
   */

  categoryLabel: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "600",
  },

  selectedCategoryLabel: {
    color: COLORS.lightGold,
  },

  /*
   * SELECTED INDICATOR
   */

  selectedIndicator: {
    position: "absolute",
    top: 7,
    right: 8,
    width: 4,
    height: 4,
    backgroundColor: COLORS.gold,
  },

  /*
   * EXPAND BUTTON
   */

  expandButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 10,
  },

  expandText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
