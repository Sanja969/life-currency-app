import { useRouter } from "expo-router";

import { ActivityForm } from "../../components/ActivityForm";
import { activityService } from "../../services/ActivityService";
import { ActivityInput } from "../../types/activity";

export default function CreateActivityScreen() {
  const router = useRouter();

  async function handleCreate(data: ActivityInput): Promise<void> {
    try {
      await activityService.createActivity(data);

      router.back();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ActivityForm
      isCreate
      onSubmit={handleCreate}
    />
  );
}