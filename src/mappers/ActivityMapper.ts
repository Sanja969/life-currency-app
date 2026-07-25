import { Activity, ActivityClassification, ActivityInput } from "../types/activity";

export type ActivityRow = {
  id: number;
  title: string;
  description: string | null;
  duration_minutes: number;
  classification: string;
  activity_date: string;
  created_at: string;
  updated_at: string;
};

export function toActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    durationMinutes: row.duration_minutes,
    classification: row.classification as ActivityClassification,
    activityDate: new Date(row.activity_date),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

