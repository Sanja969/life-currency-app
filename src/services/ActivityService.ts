import { activityRepository } from "../repositories/ActivityRepository";
import {
  Activity,
  ActivityCategory,
  ActivityCategoryStatistics,
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

  async getActivitiesByDateRange(
    start: Date,
    end: Date,
  ): Promise<Activity[]> {
    return activityRepository.getByDateRange(start, end);
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

  calculateStatistics(
    activities: Activity[],
  ): ActivityStatistics {
    let totalDurationMinutes = 0;

    let servesCount = 0;
    let restoresCount = 0;
    let doesNotServeCount = 0;

    let servesDurationMinutes = 0;
    let restoresDurationMinutes = 0;
    let doesNotServeDurationMinutes = 0;

    let longestActivity: Activity | undefined;
    let shortestActivity: Activity | undefined;

    const categoryMap = new Map<
      ActivityCategory,
      {
        totalDurationMinutes: number;
        servesDurationMinutes: number;
        restoresDurationMinutes: number;
        doesNotServeDurationMinutes: number;
      }
    >();

    for (const activity of activities) {
      const duration = activity.durationMinutes;

      totalDurationMinutes += duration;

      const category = categoryMap.get(activity.category) ?? {
        totalDurationMinutes: 0,
        servesDurationMinutes: 0,
        restoresDurationMinutes: 0,
        doesNotServeDurationMinutes: 0,
      };

      category.totalDurationMinutes += duration;

      switch (activity.classification) {
        case ActivityClassification.Serves:
          servesCount++;
          servesDurationMinutes += duration;
          category.servesDurationMinutes += duration;
          break;

        case ActivityClassification.Restores:
          restoresCount++;
          restoresDurationMinutes += duration;
          category.restoresDurationMinutes += duration;
          break;

        case ActivityClassification.DoesNotServe:
          doesNotServeCount++;
          doesNotServeDurationMinutes += duration;
          category.doesNotServeDurationMinutes += duration;
          break;
      }

      categoryMap.set(activity.category, category);

      if (
        !longestActivity ||
        duration > longestActivity.durationMinutes
      ) {
        longestActivity = activity;
      }

      if (
        !shortestActivity ||
        duration < shortestActivity.durationMinutes
      ) {
        shortestActivity = activity;
      }
    }

    const totalActivities = activities.length;

    const averageDurationMinutes =
      totalActivities === 0
        ? 0
        : Math.round(totalDurationMinutes / totalActivities);

    const calculatePercentage = (minutes: number): number =>
      totalDurationMinutes === 0
        ? 0
        : Math.round((minutes / totalDurationMinutes) * 100);

    const servesPercentage =
      calculatePercentage(servesDurationMinutes);

    const restoresPercentage =
      calculatePercentage(restoresDurationMinutes);

    const doesNotServePercentage =
      calculatePercentage(doesNotServeDurationMinutes);

    // Restoring is neutral in the existing net-time calculation.
    const netDurationMinutes =
      servesDurationMinutes - doesNotServeDurationMinutes;

    const categoryStatistics: ActivityCategoryStatistics[] =
      Array.from(categoryMap.entries())
        .map(([category, statistics]) => ({
          category,
          ...statistics,
          percentage: calculatePercentage(
            statistics.totalDurationMinutes,
          ),
        }))
        .sort(
          (a, b) =>
            b.totalDurationMinutes - a.totalDurationMinutes,
        );

    const strongestInvestment = categoryStatistics.reduce<
      ActivityCategoryStatistics | undefined
    >(
      (strongest, category) =>
        category.servesDurationMinutes > 0 &&
          (!strongest ||
            category.servesDurationMinutes >
            strongest.servesDurationMinutes)
          ? category
          : strongest,
      undefined,
    );

    const biggestLeak = categoryStatistics.reduce<
      ActivityCategoryStatistics | undefined
    >(
      (biggest, category) =>
        category.doesNotServeDurationMinutes > 0 &&
          (!biggest ||
            category.doesNotServeDurationMinutes >
            biggest.doesNotServeDurationMinutes)
          ? category
          : biggest,
      undefined,
    );

    return {
      totalActivities,
      totalDurationMinutes,
      averageDurationMinutes,

      servesCount,
      restoresCount,
      doesNotServeCount,

      servesDurationMinutes,
      restoresDurationMinutes,
      doesNotServeDurationMinutes,

      netDurationMinutes,

      servesPercentage,
      restoresPercentage,
      doesNotServePercentage,

      longestActivity,
      shortestActivity,

      categoryStatistics,
      strongestInvestment,
      biggestLeak,
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
    const conflictingActivity =
      await activityRepository.findOverlappingActivity(
        input.activityDate,
        input.durationMinutes,
        excludedActivityId,
      );

    if (conflictingActivity) {
      throw new Error(
        `Activity overlaps with "${conflictingActivity.title}".`,
      );
    }
  }

  async deleteAllActivities(): Promise<void> {
    await activityRepository.deleteAll();
  }

  async replaceAllActivities(
    activities: Activity[],
  ): Promise<void> {
    await activityRepository.replaceAll(activities);
  }

  async getActivitiesPage(
    limit: number,
    offset: number,
    searchQuery: string = "",
    filter: string = "all",
  ): Promise<Activity[]> {
    return activityRepository.getPage(
      limit,
      offset,
      searchQuery,
      filter,
    );
  }

  async getActivityCounts(
    searchQuery: string = "",
    filter: string = "all",
  ): Promise<{
    growingCount: number;
    restoringCount: number;
    leaksCount: number;
    growingMinutes: number;
    restoringMinutes: number;
    leaksMinutes: number;
  }> {
    return activityRepository.getActivityCounts(searchQuery, filter);
  }

  async getActivityPosition(
    activityDate: string,
    searchQuery = "",
    filter = "all",
  ): Promise<number> {
    return activityRepository.getActivityPosition(
      activityDate,
      searchQuery,
      filter,
    );
  }
}

export const activityService = new ActivityService();
