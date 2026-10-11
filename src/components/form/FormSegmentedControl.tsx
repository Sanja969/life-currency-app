import { useState } from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

import { ActivityClassification } from "@/types/activity";
import { COLORS } from "@/theme/colors";
import { CLASSIFICATION_THEME } from "@/theme/classification";

type SegmentItem = {
  label: string;
  value: string;
};

type FormSegmentedControlProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  items: SegmentItem[];
};

const CLASSIFICATION_ICONS = {
  [ActivityClassification.Serves]: "sparkles",
  [ActivityClassification.Restores]: "leaf-outline",
  [ActivityClassification.DoesNotServe]: "pulse-outline",
} as const;

const CARD_HEIGHT = 94;
const CORNER_CUT = 12;

type SegmentCardProps = {
  item: SegmentItem;
  selected: boolean;
  onPress: () => void;
};

function isActivityClassification(
  value: string,
): value is ActivityClassification {
  return Object.values(ActivityClassification).some(
    (classification) => classification === value,
  );
}

function SegmentCard({ item, selected, onPress }: SegmentCardProps) {
  const [width, setWidth] = useState(0);

  const classification = isActivityClassification(item.value)
    ? item.value
    : null;

  const theme = classification ? CLASSIFICATION_THEME[classification] : null;

  const accent = theme?.color ?? COLORS.gold;

  const background = theme?.background ?? COLORS.goldBackground;

  const description = theme?.description ?? "";

  const icon = classification
    ? CLASSIFICATION_ICONS[classification]
    : "ellipse-outline";

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
      accessibilityState={{
        checked: selected,
      }}
      accessibilityLabel={item.label}
      style={({ pressed }) => [
        styles.card,
        {
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {/* CARD SHAPE */}

      {width > 0 && (
        <Svg
          pointerEvents="none"
          width={width}
          height={CARD_HEIGHT}
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={shapePath}
            fill={selected ? background : COLORS.surface}
            stroke={selected ? accent : COLORS.goldBorder}
            strokeWidth={selected ? 1.5 : 1}
          />

          {selected && (
            <Path
              d={`
                M ${CORNER_CUT} 0
                L ${Math.min(width - 4, CORNER_CUT + 34)} 0
              `}
              stroke={accent}
              strokeWidth={2}
            />
          )}
        </Svg>
      )}

      {/* CARD CONTENT */}

      <View style={styles.cardContent}>
        {/* ICON */}

        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: selected ? `${accent}20` : COLORS.surface,

              borderColor: selected ? `${accent}65` : COLORS.border,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={selected ? accent : COLORS.muted}
          />
        </View>

        {/* TEXT */}

        <View style={styles.textContainer}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.cardTitle,
              {
                color: selected ? COLORS.text : COLORS.muted,
              },
            ]}
          >
            {item.label}
          </Text>

          <Text
            numberOfLines={2}
            style={[
              styles.cardDescription,
              {
                color: selected ? accent : COLORS.muted,
              },
            ]}
          >
            {description}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function FormSegmentedControl<T extends FieldValues>({
  control,
  name,
  label,
  items,
}: FormSegmentedControlProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <View style={styles.container}>
          {/* LABEL */}

          {label ? <Text style={styles.label}>{label}</Text> : null}

          {/* CLASSIFICATION CARDS */}

          <View style={styles.row} accessibilityRole="radiogroup">
            {items.map((item) => (
              <SegmentCard
                key={item.value}
                item={item}
                selected={field.value === item.value}
                onPress={() => field.onChange(item.value)}
              />
            ))}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  row: {
    flexDirection: "row",
    gap: 8,
  },

  card: {
    flex: 1,
    minWidth: 0,
    height: CARD_HEIGHT,
    justifyContent: "center",
  },

  cardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    gap: 6,
  },

  iconContainer: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  textContainer: {
    width: "100%",
    alignItems: "center",
    gap: 3,
  },

  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  cardDescription: {
    fontSize: 9,
    lineHeight: 12,
    textAlign: "center",
  },
});
