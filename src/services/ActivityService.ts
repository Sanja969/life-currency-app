import { activityRepository } from "../repositories/ActivityRepository";
import {
  Activity,
  ActivityClassification,
  ActivityInput,
  ActivityStatistics,
  CreateActivityInput,
  UpdateActivityInput,
} from "../types/activity";

export class ActivityService {
  async getAllActivities(): Promise<Activity[]> {
    return activityRepository.getAll();
  }

  async getActivityById(id: number): Promise<Activity | null> {
    return activityRepository.getById(id);
  }

  async createActivity(input: CreateActivityInput): Promise<Activity> {
    this.validateActivityInput(input);
    return activityRepository.create(input);
  }

  async updateActivity(
    id: number,
    input: UpdateActivityInput,
  ): Promise<Activity> {
    this.validateActivityInput(input);

    return activityRepository.update(id, input);
  }

  async deleteActivity(id: number): Promise<void> {
    return activityRepository.delete(id);
  }

  async getActivityStatistics(): Promise<ActivityStatistics> {
    const activities = await this.getAllActivities();

    let totalActivities = 0;
    let totalDurationMinutes = 0;
    let servesCount = 0;
    let doesNotServeCount = 0;

    let longestActivity: Activity | undefined;
    let shortestActivity: Activity | undefined;

    let servesDurationMinutes = 0;

    let doesNotServeDurationMinutes = 0;

    for (const activity of activities) {
      totalDurationMinutes += activity.durationMinutes;
      totalActivities++;

      if (activity.classification === ActivityClassification.Serves) {
        servesCount++;
        servesDurationMinutes += activity.durationMinutes;
      } else {
        doesNotServeCount++;
        doesNotServeDurationMinutes += activity.durationMinutes;
      }

      if (
        !longestActivity ||
        activity.durationMinutes > longestActivity.durationMinutes
      ) {
        longestActivity = activity;
      }

      if (
        !shortestActivity ||
        activity.durationMinutes < shortestActivity.durationMinutes
      ) {
        shortestActivity = activity;
      }
    }

    const averageDurationMinutes =
      totalActivities === 0
        ? 0
        : Math.round(totalDurationMinutes / totalActivities);

    const servesPercentage =
      totalActivities === 0
        ? 0
        : Math.round((servesCount / totalActivities) * 100);

    const netDurationMinutes =
      servesDurationMinutes - doesNotServeDurationMinutes;

    return {
      totalActivities,
      totalDurationMinutes,
      servesCount,
      doesNotServeCount,
      longestActivity: longestActivity || undefined,
      shortestActivity: shortestActivity || undefined,
      servesPercentage,
      averageDurationMinutes,
      servesDurationMinutes,
      doesNotServeDurationMinutes,
      netDurationMinutes,
    };
  }

  private validateActivityInput(input: ActivityInput): void {
    if (input.title.trim().length === 0) {
      throw new Error("Activity title cannot be empty.");
    }

    if (input.durationMinutes <= 0) {
      throw new Error("Activity duration must be greater than zero.");
    }
  }
}

export const activityService = new ActivityService();
