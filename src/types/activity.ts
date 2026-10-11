export enum ActivityClassification {
  Serves = "serves",
  Restores = "restores",
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

  Household = "household",
  ChoresErrands = "chores_errands",
  SocialMedia = "social_media",
  Commuting = "commuting",
  PersonalCare = "personal_care",
  Shopping = "shopping",
  Gaming = "gaming",
  AdministrativeTasks = "administrative_tasks",

  Other = "other",
}

export type ActivityCategoryStatistics = {
  category: ActivityCategory;

  totalDurationMinutes: number;

  servesDurationMinutes: number;
  restoresDurationMinutes: number;
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
  createdAt: Date;
  updatedAt: Date;
}

export type ActivityInput = Omit<Activity, "id" | "createdAt" | "updatedAt">;

export type CreateActivityInput = ActivityInput;

export type UpdateActivityInput = ActivityInput;

export type ActivityStatistics = {
  totalActivities: number;

  totalDurationMinutes: number;
  averageDurationMinutes: number;

  servesCount: number;
  restoresCount: number;
  doesNotServeCount: number;

  servesDurationMinutes: number;
  restoresDurationMinutes: number;
  doesNotServeDurationMinutes: number;

  netDurationMinutes: number;

  servesPercentage: number;
  restoresPercentage: number;
  doesNotServePercentage: number;

  longestActivity?: Activity;
  shortestActivity?: Activity;

  categoryStatistics: ActivityCategoryStatistics[];

  strongestInvestment?: ActivityCategoryStatistics;
  biggestLeak?: ActivityCategoryStatistics;
};