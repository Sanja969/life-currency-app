import { activityRepository } from "../repositories/ActivityRepository";
import {
  Activity,
  ActivityInput,
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

  async updateActivity(id: number, input: UpdateActivityInput): Promise<Activity> {
    this.validateActivityInput(input);

    return activityRepository.update(id, input);
  }

  async deleteActivity(id: number): Promise<void> {
    return activityRepository.delete(id);
  }

  private validateActivityInput(input: ActivityInput): void {
    if(input.title.trim().length === 0) {
      throw new Error("Activity title cannot be empty.");
    }

    if(input.durationMinutes <= 0) {
      throw new Error("Activity duration must be greater than zero.");
    }
  }
}

export const activityService = new ActivityService();
