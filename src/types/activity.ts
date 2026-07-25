export enum ActivityClassification {
    Serves = "serves",
    DoesNotServe = "does_not_serve",
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  durationMinutes: number;
  classification: ActivityClassification;
  activityDate: Date;
  createdAt: string;
  updatedAt: string;
}

export type ActivityInput = Omit<
  Activity,
  "id" | "createdAt" | "updatedAt">;

export type CreateActivityInput = ActivityInput;

export type UpdateActivityInput = ActivityInput;