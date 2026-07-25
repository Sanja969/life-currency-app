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
import { useEffect } from "react";

type ActivityFormProps = {
  initialValues?: Partial<ActivityFormInput>;
  onSubmit: (data: ActivityFormOutput) => Promise<void>;
  isCreate?: true;
};

export function ActivityForm({
  initialValues,
  onSubmit,
  isCreate,
}: ActivityFormProps) {
  const defaultValues: ActivityFormInput = {
    title: "",
    description: "",
    durationMinutes: 0,
    classification: ActivityClassification.Serves,
    activityDate: new Date(),
  };

  const { control, handleSubmit, reset } = useForm<
    ActivityFormInput,
    undefined,
    ActivityFormOutput
  >({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        ...defaultValues,
        ...initialValues,
      });
    }
  }, [initialValues, reset]);

  const submit = handleSubmit(async (data) => {
    await onSubmit(data);

    if (isCreate) {
      reset();
    }
  });

  return (
    <View className="gap-4 p-4">
      <Text className="text-2xl font-semibold">
        {isCreate ? "Add Activity" : "Update Activity"}
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

      <AppButton onPress={submit}>
        {isCreate ? "Add Activity" : "Update Activity"}
      </AppButton>
    </View>
  );
}
