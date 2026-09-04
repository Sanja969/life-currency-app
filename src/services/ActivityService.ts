import { activitiesOverlap } from "@/utils/activityOverlap";
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
  
    await this.validateNoOverlap(input);
  
    return activityRepository.create(input);
  }

  async updateActivity(
    id: number,
    input: UpdateActivityInput,
  ): Promise<Activity> {
    this.validateActivityInput(input);
  
    await this.validateNoOverlap(input, id);
  
    return activityRepository.update(id, input);
  }

  async deleteActivity(id: number): Promise<void> {
    return activityRepository.delete(id);
  }

  async getActivitiesByDate(date: Date): Promise<Activity[]> {
    return activityRepository.getByDate(date);
  }

  async getTodayActivities(): Promise<Activity[]> {
    return this.getActivitiesByDate(new Date());
  }

  async getActivityStatistics(): Promise<ActivityStatistics> {
    const activities = await this.getAllActivities();

    return this.calculateStatistics(activities);
  }

  async getTodayStatistics(): Promise<ActivityStatistics> {
    const activities = await this.getTodayActivities();

    return this.calculateStatistics(activities);
  }

  private calculateStatistics(activities: Activity[]): ActivityStatistics {
    let totalActivities = 0;
    let totalDurationMinutes = 0;

    let servesCount = 0;
    let doesNotServeCount = 0;

    let servesDurationMinutes = 0;
    let doesNotServeDurationMinutes = 0;

    let longestActivity: Activity | undefined;
    let shortestActivity: Activity | undefined;

    for (const activity of activities) {
      totalActivities++;
      totalDurationMinutes += activity.durationMinutes;

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
      totalDurationMinutes === 0
        ? 0
        : Math.round((servesDurationMinutes / totalDurationMinutes) * 100);

    const netDurationMinutes =
      servesDurationMinutes - doesNotServeDurationMinutes;

    return {
      totalActivities,
      totalDurationMinutes,
      averageDurationMinutes,

      servesCount,
      doesNotServeCount,

      servesDurationMinutes,
      doesNotServeDurationMinutes,

      netDurationMinutes,
      servesPercentage,

      longestActivity,
      shortestActivity,
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

  private async validateNoOverlap(
    input: ActivityInput,
    excludedActivityId?: number,
  ): Promise<void> {
    const activities = await this.getAllActivities();
  
    console.log("3. NEW ACTIVITY:", input);
    console.log("4. EXISTING ACTIVITIES:", activities);
  
    const conflictingActivity = activities.find((activity) => {
      if (
        excludedActivityId !== undefined &&
        activity.id === excludedActivityId
      ) {
        return false;
      }
  
      const overlaps = activitiesOverlap(input, activity);
  
      console.log(
        "COMPARE:",
        input.activityDate,
        activity.activityDate,
        "OVERLAP:",
        overlaps,
      );
  
      return overlaps;
    });
  
    console.log("5. CONFLICT:", conflictingActivity);
  
    if (conflictingActivity) {
      throw new Error(
        `Activity overlaps with "${conflictingActivity.title}".`,
      );
    }
  }
}

export const activityService = new ActivityService();
