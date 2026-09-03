import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Text, View } from "react-native";

import { FormTextInput } from "./form/FormTextInput";
import { ActivityClassification } from "../types/activity";
import {
  activitySchema,
  ActivityFormInput,
  ActivityFormOutput,
} from "../validation/activitySchema";
import { FormSegmentedControl } from "./form/FormSegmentedControl";
import { AppButton } from "./ui/AppButton";
import { FormDatePicker } from "./form/FormDatePicker";
import { useState } from "react";

type ActivityFormProps = {
  initialValues?: Partial<ActivityFormInput>;
  onSubmit: (data: ActivityFormOutput) => Promise<void>;
  mode: "create" | "edit";
};

export function ActivityForm({
  initialValues,
  onSubmit,
  mode,
}: ActivityFormProps) {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, reset } = useForm<
    ActivityFormInput,
    undefined,
    ActivityFormOutput
  >({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      description: "",
      durationMinutes: 0,
      classification: ActivityClassification.Serves,
      activityDate: new Date(),
      ...initialValues,
    },
  });

  const submit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);

      if (mode === "create") {
        reset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <View className="gap-4 p-4">
      <Text className="text-2xl font-semibold">
        {mode === "create" ? "Add Activity" : "Update Activity"}
      </Text>

      <FormTextInput
        control={control}
        name="title"
        label="Title"
        placeholder="Enter title"
      />
      <FormTextInput
        control={control}
        name="description"
        label="Description"
        multiline
        numberOfLines={4}
      />
      <FormTextInput
        control={control}
        name="durationMinutes"
        label="Duration (minutes)"
        keyboardType="numeric"
      />

      <FormSegmentedControl
        control={control}
        name="classification"
        label="Classification"
        items={[
          {
            label: "Serves",
            value: ActivityClassification.Serves,
          },

          {
            label: "Doesn't serve",
            value: ActivityClassification.DoesNotServe,
          },
        ]}
      />
      <FormDatePicker
        control={control}
        name="activityDate"
        label="Activity date"
      />

      <AppButton
        onPress={submit}
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {mode === "create" ? "Add Activity" : "Update Activity"}
      </AppButton>
    </View>
  );
}
