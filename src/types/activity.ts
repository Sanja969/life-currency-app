export enum ActivityClassification {
    Serves = "serves",
    DoesNotServe = "does_not_serve",
}

export interface Activity {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  classification: ActivityClassification;
  activityDate: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateActivityInput = Omit<Activity, "id" | "createdAt" | "updatedAt">

export type UpdateActivityInput = Omit<Activity, "id" | "createdAt" | "updatedAt">