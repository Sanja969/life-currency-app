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

const COLORS = {
  growing: "#8274E8",
  restoring: "#58C7B5",
  leak: "#D88455",
  text: "#F5F0E7",
  muted: "#9295A5",
  surface: "#11141D",
};

const CLASSIFICATION_META = {
  [ActivityClassification.Serves]: {
    accent: COLORS.growing,
    background: "#1D1934",
    icon: "sparkles" as const,
    description: "Builds my life",
  },

  [ActivityClassification.Restores]: {
    accent: COLORS.restoring,
    background: "#142B2A",
    icon: "leaf-outline" as const,
    description: "Restores energy",
  },

  [ActivityClassification.DoesNotServe]: {
    accent: COLORS.leak,
    background: "#2B1D18",
    icon: "pulse-outline" as const,
    description: "Drains energy",
  },
};

const CARD_HEIGHT = 94;
const CORNER_CUT = 12;

type SegmentCardProps = {
  item: SegmentItem;
  selected: boolean;
  onPress: () => void;
};

function SegmentCard({ item, selected, onPress }: SegmentCardProps) {
  const [width, setWidth] = useState(0);

  const meta = CLASSIFICATION_META[item.value as ActivityClassification];

  const { accent, background, icon, description } = meta;

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
      accessibilityLabel={item.label}
      style={({ pressed }) => [
        styles.card,
        {
          opacity: pressed ? 0.8 : 1,
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
            fill={selected ? background : COLORS.surface}
            stroke={selected ? accent : "rgba(214,173,101,0.18)"}
            strokeWidth={selected ? 1.5 : 1}
          />

          {selected && (
            <Path
              d={`M ${CORNER_CUT} 0 L ${Math.min(
                width - 4,
                CORNER_CUT + 34,
              )} 0`}
              stroke={accent}
              strokeWidth={2}
            />
          )}
        </Svg>
      )}

      <View style={styles.cardContent}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: selected
                ? `${accent}20`
                : "rgba(255,255,255,0.04)",
              borderColor: selected ? `${accent}65` : "rgba(255,255,255,0.08)",
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={selected ? accent : COLORS.muted}
          />
        </View>

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
          {label ? <Text style={styles.label}>{label}</Text> : null}

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

  selectedIndicator: {
    position: "absolute",
    top: -16,
    right: 0,
    width: 5,
    height: 5,
  },
});
