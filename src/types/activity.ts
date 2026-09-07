export enum ActivityClassification {
  Serves = "serves",
  DoesNotServe = "does_not_serve",
}

export enum ActivityCategory {
  Work = "work",
  Learning = "learning",
  Health = "health",
  Relationships = "relationships",
  Rest = "rest",
  Entertainment = "entertainment",
  Mindfulness = "mindfulness",
  Other = "other",
}

export type ActivityCategoryStatistics = {
  category: ActivityCategory;
  totalDurationMinutes: number;
  servesDurationMinutes: number;
  doesNotServeDurationMinutes: number;
  percentage: number;
};

export interface Activity {
  id: number;
  title: string;
  description?: string;
  durationMinutes: number;

  classification: ActivityClassification;
  category: ActivityCategory;

  activityDate: Date;
  createdAt: string;
  updatedAt: string;
}

export type ActivityInput = Omit<Activity, "id" | "createdAt" | "updatedAt">;

export type CreateActivityInput = ActivityInput;

export type UpdateActivityInput = ActivityInput;

export type ActivityStatistics = {
  totalActivities: number;

  totalDurationMinutes: number;
  averageDurationMinutes: number;

  servesCount: number;
  doesNotServeCount: number;

  servesDurationMinutes: number;
  doesNotServeDurationMinutes: number;

  netDurationMinutes: number;

  servesPercentage: number;

  longestActivity?: Activity;
  shortestActivity?: Activity;
  categoryStatistics: ActivityCategoryStatistics[];

  strongestInvestment?: ActivityCategoryStatistics;
  biggestLeak?: ActivityCategoryStatistics;
};