import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";

import { FormTextInput } from "./form/FormTextInput";
import { FormSegmentedControl } from "./form/FormSegmentedControl";
import { FormDatePicker } from "./form/FormDatePicker";
import { AppButton } from "./ui/AppButton";
import { CategorySelector } from "../features/activities/components/CategorySelector";

import {
  Activity,
  ActivityClassification,
  ActivityCategory,
} from "../types/activity";

import {
  activitySchema,
  ActivityFormInput,
  ActivityFormOutput,
} from "../validation/activitySchema";

import {
  activitiesOverlap,
  getActivityEndTime,
} from "../utils/activityOverlap";

type ActivityFormProps = {
  initialValues?: Partial<ActivityFormInput>;
  onSubmit: (data: ActivityFormOutput) => Promise<void>;
  mode: "create" | "edit";
  activities?: Activity[];
  activityId?: number;
};

const QUICK_DURATIONS = [15, 30, 45, 60, 90, 120];

function getDurationLabel(minutes: number) {
  if (minutes === 60) return "1h";
  if (minutes === 90) return "1h 30";
  if (minutes === 120) return "2h";

  return `${minutes}m`;
}

function formatActivityTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityForm({
  initialValues,
  onSubmit,
  mode,
  activities = [],
  activityId,
}: ActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showNote, setShowNote] = useState(Boolean(initialValues?.description));

  const { control, handleSubmit, setValue } = useForm<
    ActivityFormInput,
    undefined,
    ActivityFormOutput
  >({
    resolver: zodResolver(activitySchema),

    defaultValues: {
      title: "",
      description: "",
      durationMinutes: 30,
      classification: ActivityClassification.Serves,
      category: ActivityCategory.Other,
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

  const conflictingActivity = useMemo(() => {
    if (!(activityDate instanceof Date) || !duration || Number(duration) <= 0) {
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

  const submit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <View className="gap-6 pb-8">
      <View className="gap-1">
        <Text className="text-4xl font-bold text-white">
          {mode === "create" ? "New activity" : "Edit activity"}
        </Text>

        <Text className="text-base text-indigo-200/70">
          Add a new moment to your universe.
        </Text>
      </View>

      <FormTextInput
        control={control}
        name="title"
        label="What did you do?"
        placeholder="Deep work, Gym, Coffee..."
        autoFocus={mode === "create"}
      />

      <FormSegmentedControl
        control={control}
        name="classification"
        label="How did this time serve you?"
        items={[
          {
            label: "Serves me",
            value: ActivityClassification.Serves,
          },
          {
            label: "Doesn't serve",
            value: ActivityClassification.DoesNotServe,
          },
        ]}
      />

      <CategorySelector
        value={category}
        onChange={(value) =>
          setValue("category", value, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />

      <View className="gap-3">
        <Text className="text-sm font-medium text-slate-200">Duration</Text>

        <View className="flex-row flex-wrap gap-2">
          {QUICK_DURATIONS.map((minutes) => {
            const selected = Number(duration) === minutes;

            return (
              <Pressable
                key={minutes}
                onPress={() =>
                  setValue("durationMinutes", minutes, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={[
                  "rounded-full border px-4 py-2.5",
                  selected
                    ? "border-[#8087FF] bg-[#29245D]"
                    : "border-[#26365A] bg-[#0D152B]",
                ].join(" ")}
              >
                <Text
                  className={[
                    "font-semibold",
                    selected ? "text-white" : "text-slate-400",
                  ].join(" ")}
                >
                  {getDurationLabel(minutes)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FormTextInput
          control={control}
          name="durationMinutes"
          label="Custom minutes"
          placeholder="30"
          keyboardType="number-pad"
        />
      </View>

      <FormDatePicker control={control} name="activityDate" label="When?" />

      {conflictingActivity ? (
        <View className="flex-row rounded-2xl border border-red-400/60 bg-red-950/40 p-4">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-400/15">
            <Ionicons name="warning-outline" size={22} color="#FB7185" />
          </View>

          <View className="flex-1">
            <Text className="font-semibold text-red-300">
              Time already occupied
            </Text>

            <Text className="mt-1 text-sm leading-5 text-red-200/80">
              This overlaps with "{conflictingActivity.title}" (
              {formatActivityTime(conflictingActivity.activityDate)}
              {" – "}
              {formatActivityTime(
                getActivityEndTime(
                  conflictingActivity.activityDate,
                  conflictingActivity.durationMinutes,
                ),
              )}
              ).
            </Text>
          </View>
        </View>
      ) : null}

      {!showNote ? (
        <Pressable onPress={() => setShowNote(true)} className="self-start">
          <Text className="font-semibold text-indigo-300">+ Add a note</Text>
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

      <AppButton
        cosmic
        onPress={submit}
        loading={isSubmitting}
        disabled={isSubmitting || !!conflictingActivity}
      >
        {mode === "create" ? "Create activity" : "Save changes"}
      </AppButton>
    </View>
  );
}
