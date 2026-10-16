import { useMemo, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

import { FormTextInput } from "./form/FormTextInput";
import { FormSegmentedControl } from "./form/FormSegmentedControl";
import { FormDatePicker } from "./form/FormDatePicker";
import { AppButton } from "./ui/AppButton";

import { CategorySelector } from "@/features/activities/components/CategorySelector";
import { QuickAddSection } from "@/features/activities/components/QuickAddSection";
import { useQuickAddSuggestions } from "@/features/activities/hooks/useQuickAddSuggestions";

import { COLORS } from "@/theme/colors";
import { CLASSIFICATION_THEME } from "@/theme/classification";

import { Activity, ActivityClassification } from "@/types/activity";

import type { QuickAddSuggestion } from "@/services/ActivityService";

import {
  activitySchema,
  type ActivityFormInput,
  type ActivityFormOutput,
} from "@/validation/activitySchema";

import { activitiesOverlap, getActivityEndTime } from "@/utils/activityOverlap";

import { useEffect } from "react";

type ActivityFormProps = {
  initialValues?: Partial<ActivityFormInput>;
  onSubmit: (data: ActivityFormOutput) => Promise<void>;
  mode: "create" | "edit";
  activities?: Activity[];
  activityId?: number;
};

const QUICK_DURATIONS = [5, 10, 15, 30, 45, 60, 90, 120];

const CLASSIFICATION_ITEMS = [
  {
    label: CLASSIFICATION_THEME[ActivityClassification.Serves].label,
    value: ActivityClassification.Serves,
  },
  {
    label: CLASSIFICATION_THEME[ActivityClassification.Restores].label,
    value: ActivityClassification.Restores,
  },
  {
    label: CLASSIFICATION_THEME[ActivityClassification.DoesNotServe].label,
    value: ActivityClassification.DoesNotServe,
  },
];

function getDurationLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatActivityTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/*
 * QUICK DURATION OPTION
 */

type DurationOptionProps = {
  minutes: number;
  selected: boolean;
  onPress: () => void;
};

function DurationOption({ minutes, selected, onPress }: DurationOptionProps) {
  const [width, setWidth] = useState(0);

  const height = 42;
  const cut = 9;

  function handleLayout(event: LayoutChangeEvent) {
    const nextWidth = event.nativeEvent.layout.width;

    if (Math.abs(nextWidth - width) > 0.5) {
      setWidth(nextWidth);
    }
  }

  const shapePath = `
    M ${cut} 0
    L ${width} 0
    L ${width} ${height - cut}
    L ${width - cut} ${height}
    L 0 ${height}
    L 0 ${cut}
    Z
  `;

  return (
    <Pressable
      onPress={onPress}
      onLayout={handleLayout}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${minutes} minutes`}
      style={({ pressed }) => [
        styles.durationOption,
        {
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      {width > 0 && (
        <Svg
          pointerEvents="none"
          width={width}
          height={height}
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={shapePath}
            fill={selected ? COLORS.goldBackground : COLORS.surface}
            stroke={selected ? COLORS.gold : COLORS.goldBorder}
            strokeWidth={selected ? 1.5 : 1}
          />
        </Svg>
      )}

      <Text
        style={[
          styles.durationText,
          {
            color: selected ? COLORS.lightGold : COLORS.muted,
          },
        ]}
      >
        {getDurationLabel(minutes)}
      </Text>
    </Pressable>
  );
}

/*
 * OVERLAP WARNING
 */

type OverlapWarningProps = {
  activity: Activity;
};

function OverlapWarning({ activity }: OverlapWarningProps) {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;

    setSize((previous) => {
      if (
        Math.abs(previous.width - width) < 0.5 &&
        Math.abs(previous.height - height) < 0.5
      ) {
        return previous;
      }

      return { width, height };
    });
  }

  const cut = 12;

  const shapePath = `
    M ${cut} 0
    L ${size.width} 0
    L ${size.width} ${size.height - cut}
    L ${size.width - cut} ${size.height}
    L 0 ${size.height}
    L 0 ${cut}
    Z
  `;

  return (
    <View
      onLayout={handleLayout}
      style={styles.warningContainer}
      accessibilityRole="alert"
    >
      {size.width > 0 && size.height > 0 && (
        <Svg
          pointerEvents="none"
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={shapePath}
            fill={COLORS.dangerBackground}
            stroke={COLORS.dangerBorder}
            strokeWidth={1}
          />
        </Svg>
      )}

      <View style={styles.warningIcon}>
        <Ionicons name="warning-outline" size={21} color={COLORS.danger} />
      </View>

      <View style={styles.warningContent}>
        <Text style={styles.warningTitle}>Time already occupied</Text>

        <Text style={styles.warningDescription}>
          This overlaps with "{activity.title}" (
          {formatActivityTime(activity.activityDate)}
          {" – "}
          {formatActivityTime(
            getActivityEndTime(activity.activityDate, activity.durationMinutes),
          )}
          ).
        </Text>
      </View>
    </View>
  );
}

/*
 * ACTIVITY FORM
 */

export function ActivityForm({
  initialValues,
  onSubmit,
  mode,
  activities = [],
  activityId,
}: ActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showNote, setShowNote] = useState(Boolean(initialValues?.description));

  /*
   * QUICK ADD
   */

  const suggestions = useQuickAddSuggestions(mode === "create");

  /*
   * FORM
   */

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ActivityFormInput, undefined, ActivityFormOutput>({
    resolver: zodResolver(activitySchema),

    defaultValues: {
      title: "",
      description: "",
      durationMinutes: 30,
      classification: undefined,
      category: undefined,
      activityDate: new Date(),
      ...initialValues,
    },
  });

  const duration = useWatch({
    control,
    name: "durationMinutes",
  });

  const activityDate = useWatch({
    control,
    name: "activityDate",
  });

  const category = useWatch({
    control,
    name: "category",
  });

  /*
   * APPLY QUICK ADD SUGGESTION
   *
   * Only fills the form.
   * Does not create an activity.
   */

  function handleQuickAdd(suggestion: QuickAddSuggestion) {
    if (mode !== "create") return;

    setValue("title", suggestion.title, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("classification", suggestion.classification, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("category", suggestion.category, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("durationMinutes", suggestion.durationMinutes, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("description", suggestion.description ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    setShowNote(Boolean(suggestion.description));
  }

  /*
   * CHECK OVERLAPPING ACTIVITIES
   */

  const conflictingActivity = useMemo(() => {
    if (
      !(activityDate instanceof Date) ||
      Number.isNaN(activityDate.getTime()) ||
      !duration ||
      Number(duration) <= 0
    ) {
      return undefined;
    }

    const candidate = {
      activityDate,
      durationMinutes: Number(duration),
    };

    return activities.find((activity) => {
      if (activityId !== undefined && activity.id === activityId) {
        return false;
      }

      return activitiesOverlap(candidate, activity);
    });
  }, [activityDate, duration, activities, activityId]);

  /*
   * SUBMIT
   */

  const submit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {mode === "create" ? "NEW LIFE TRACE" : "EDIT LIFE TRACE"}
        </Text>

        <Text style={styles.title}>
          {mode === "create" ? "Trace a moment" : "Edit your moment"}
        </Text>

        <Text style={styles.subtitle}>
          Every moment leaves a trace. Make this one count.
        </Text>
      </View>

      {/* QUICK ADD — CREATE ONLY */}

      {mode === "create" && suggestions.length > 0 && (
        <View style={styles.quickAddSection}>
          <QuickAddSection
            suggestions={suggestions}
            onSelect={handleQuickAdd}
          />
        </View>
      )}

      {/* TITLE */}

      <FormTextInput
        control={control}
        name="title"
        label="What did you do?"
        placeholder="Deep work, Gym, Coffee..."
        autoFocus={mode === "create"}
      />

      {/* CLASSIFICATION */}

      <View style={styles.fieldGroup}>
        <FormSegmentedControl
          control={control}
          name="classification"
          label="What did this time give you?"
          items={CLASSIFICATION_ITEMS}
        />

        {errors.classification && (
          <Text style={styles.errorText}>{errors.classification.message}</Text>
        )}
      </View>

      {/* CATEGORY */}

      <View style={styles.fieldGroup}>
        <CategorySelector
          value={category}
          onChange={(value) =>
            setValue("category", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        {errors.category && (
          <Text style={styles.errorText}>{errors.category.message}</Text>
        )}
      </View>

      {/* DURATION */}

      <View style={styles.durationSection}>
        <Text style={styles.sectionLabel}>Duration</Text>

        <View style={styles.durationOptions} accessibilityRole="radiogroup">
          {QUICK_DURATIONS.map((minutes) => (
            <DurationOption
              key={minutes}
              minutes={minutes}
              selected={Number(duration) === minutes}
              onPress={() =>
                setValue("durationMinutes", minutes, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          ))}
        </View>

        <FormTextInput
          control={control}
          name="durationMinutes"
          label="Custom minutes"
          placeholder="30"
          keyboardType="number-pad"
        />
      </View>

      {/* DATE AND TIME */}

      <FormDatePicker control={control} name="activityDate" label="When?" />

      {/* OVERLAP WARNING */}

      {conflictingActivity && <OverlapWarning activity={conflictingActivity} />}

      {/* NOTE */}

      {!showNote ? (
        <Pressable
          onPress={() => setShowNote(true)}
          accessibilityRole="button"
          accessibilityLabel="Add a note"
          style={({ pressed }) => [
            styles.addNoteButton,
            {
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons name="add" size={18} color={COLORS.gold} />

          <Text style={styles.addNoteText}>Add a note</Text>
        </Pressable>
      ) : (
        <FormTextInput
          control={control}
          name="description"
          label="Add a note"
          placeholder="Anything worth remembering?"
          multiline
          numberOfLines={3}
        />
      )}

      {/* SUBMIT */}

      <View style={styles.submitSection}>
        <AppButton
          variant="primary"
          onPress={submit}
          loading={isSubmitting}
          disabled={isSubmitting || Boolean(conflictingActivity)}
        >
          {mode === "create" ? "Create activity" : "Save changes"}
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 26,
    paddingBottom: 48,
  },

  header: {
    gap: 8,
    paddingBottom: 4,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
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
    lineHeight: 23,
  },

  quickAddSection: {
    marginHorizontal: -20,
    marginTop: -8,
    marginBottom: -4,
  },

  fieldGroup: {
    gap: 8,
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 12,
  },

  sectionLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  durationSection: {
    gap: 14,
  },

  durationOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  durationOption: {
    minWidth: 65,
    height: 42,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  durationText: {
    fontSize: 13,
    fontWeight: "600",
  },

  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
  },

  warningIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerBackground,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },

  warningContent: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },

  warningTitle: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "700",
  },

  warningDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
  },

  addNoteButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 8,
  },

  addNoteText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  submitSection: {
    marginTop: 6,
  },
});
