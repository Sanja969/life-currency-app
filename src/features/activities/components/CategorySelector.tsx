import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { ActivityCategory } from "@/types/activity";

type CategorySelectorProps = {
  value: ActivityCategory;
  onChange: (value: ActivityCategory) => void;
};

const CATEGORY_OPTIONS: ActivityCategory[] = [
  ActivityCategory.Work,
  ActivityCategory.Learning,
  ActivityCategory.Health,
  ActivityCategory.Relationships,
  ActivityCategory.Rest,
  ActivityCategory.Entertainment,
  ActivityCategory.Mindfulness,
  ActivityCategory.Other,
];

const COLORS = {
  gold: "#D6AD65",
  lightGold: "#F3D49B",
  text: "#F5F0E7",
  muted: "#9295A5",
  surface: "#11141D",
  selectedSurface: "#211D17",
};

const CARD_HEIGHT = 70;
const CORNER_CUT = 10;

type CategoryCardProps = {
  category: ActivityCategory;
  selected: boolean;
  onPress: () => void;
};

function CategoryCard({ category, selected, onPress }: CategoryCardProps) {
  const [width, setWidth] = useState(0);

  const meta = getActivityCategoryMeta(category);

  function handleLayout(event: LayoutChangeEvent) {
    const nextWidth = event.nativeEvent.layout.width;

    if (Math.abs(nextWidth - width) > 0.5) {
      setWidth(nextWidth);
    }
  }

  const shapePath = `
    M ${CORNER_CUT} 0
    L ${width} 0
    L ${width} ${CARD_HEIGHT - CORNER_CUT}
    L ${width - CORNER_CUT} ${CARD_HEIGHT}
    L 0 ${CARD_HEIGHT}
    L 0 ${CORNER_CUT}
    Z
  `;

  return (
    <Pressable
      onPress={onPress}
      onLayout={handleLayout}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={meta.label}
      style={({ pressed }) => [
        styles.card,
        {
          opacity: pressed ? 0.75 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {width > 0 && (
        <Svg
          pointerEvents="none"
          width={width}
          height={CARD_HEIGHT}
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={shapePath}
            fill={selected ? COLORS.selectedSurface : COLORS.surface}
            stroke={selected ? COLORS.gold : "rgba(214,173,101,0.18)"}
            strokeWidth={selected ? 1.5 : 1}
          />

          {selected && (
            <Path
              d={`M ${CORNER_CUT} 0 L ${Math.min(
                width - 4,
                CORNER_CUT + 28,
              )} 0`}
              stroke={COLORS.lightGold}
              strokeWidth={1.5}
            />
          )}
        </Svg>
      )}

      <View style={styles.cardContent}>
        {/* ICON */}

        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: selected
                ? "rgba(214,173,101,0.13)"
                : "rgba(255,255,255,0.035)",
              borderColor: selected
                ? "rgba(214,173,101,0.3)"
                : "rgba(255,255,255,0.06)",
            },
          ]}
        >
          <Ionicons
            name={meta.icon}
            size={18}
            color={selected ? COLORS.lightGold : COLORS.muted}
          />
        </View>

        {/* LABEL */}

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.categoryLabel,
            {
              color: selected ? COLORS.text : COLORS.muted,
            },
          ]}
        >
          {meta.label}
        </Text>

        {/* SELECTED INDICATOR */}

        {selected && <View style={styles.selectedIndicator} />}
      </View>
    </Pressable>
  );
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.label}>Life area</Text>

        <Text style={styles.subtitle}>Where did this time go?</Text>
      </View>

      {/* CATEGORY GRID */}

      <View style={styles.grid} accessibilityRole="radiogroup">
        {CATEGORY_OPTIONS.map((category) => (
          <CategoryCard
            key={category}
            category={category}
            selected={value === category}
            onPress={() => onChange(category)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  header: {
    gap: 5,
  },

  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  card: {
    width: "48.5%",
    height: CARD_HEIGHT,
    justifyContent: "center",
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
  },

  iconContainer: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  categoryLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.1,
  },

  selectedIndicator: {
    position: "absolute",
    top: -12,
    right: 0,
    width: 5,
    height: 5,
    backgroundColor: COLORS.gold,
  },
});
