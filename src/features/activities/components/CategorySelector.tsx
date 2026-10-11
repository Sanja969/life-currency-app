import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { ActivityCategory } from "@/types/activity";

type CategorySelectorProps = {
  value?: ActivityCategory;
  onChange: (value: ActivityCategory) => void;
};

const COLORS = {
  gold: "#D6AD65",
  lightGold: "#F3D49B",
  text: "#F5F0E7",
  muted: "#9295A5",
  surface: "#11141D",
  selectedSurface: "#211D18",
};

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

function CategoryCard({
  category,
  selected,
  onPress,
}: {
  category: ActivityCategory;
  selected: boolean;
  onPress: () => void;
}) {
  const meta = getActivityCategoryMeta(category);

  const [width, setWidth] = useState(0);

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
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;

        if (Math.abs(nextWidth - width) > 0.5) {
          setWidth(nextWidth);
        }
      }}
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
          width={width}
          height={CARD_HEIGHT}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Path
            d={path}
            fill={selected ? COLORS.selectedSurface : COLORS.surface}
            stroke={selected ? COLORS.gold : "rgba(214,173,101,0.17)"}
            strokeWidth={1}
          />

          {selected && (
            <>
              {/* TOP ACCENT */}

              <Path
                d={`M ${CUT} 0 L ${Math.min(width - 4, CUT + 30)} 0`}
                stroke={COLORS.lightGold}
                strokeWidth={1.5}
              />

              {/* BOTTOM ACCENT */}

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

      {selected && <View style={styles.selectedIndicator} />}
    </Pressable>
  );
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleCategories = expanded
    ? CATEGORY_OPTIONS
    : [
        ...CATEGORY_OPTIONS.slice(0, INITIAL_VISIBLE_COUNT),
        ...(value && CATEGORY_OPTIONS.indexOf(value) >= INITIAL_VISIBLE_COUNT
          ? [value]
          : []),
      ];

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View>
        <Text style={styles.heading}>Life area</Text>

        <Text style={styles.subtitle}>Where did this time go?</Text>
      </View>

      {/* CATEGORY GRID */}

      <View style={styles.grid}>
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
        onPress={() => setExpanded((previous) => !previous)}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.expandButton,
          { opacity: pressed ? 0.7 : 1 },
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

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },

  gridItem: {
    width: "48.5%",
  },

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

  iconFrame: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.12)",
    backgroundColor: "#171A24",
  },

  selectedIconFrame: {
    borderColor: "rgba(214,173,101,0.38)",
    backgroundColor: "rgba(214,173,101,0.12)",
  },

  categoryLabel: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "600",
  },

  selectedCategoryLabel: {
    color: COLORS.lightGold,
  },

  selectedIndicator: {
    position: "absolute",
    top: 7,
    right: 8,
    width: 4,
    height: 4,
    backgroundColor: COLORS.gold,
  },

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
