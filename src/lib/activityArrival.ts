import { ActivityClassification } from "@/types/activity";

export type ActivityArrival = {
  activityDate: string;
  classification: ActivityClassification;
};

let pendingArrival: ActivityArrival | null = null;

export function setPendingActivityArrival(
  arrival: ActivityArrival,
) {
  pendingArrival = arrival;
}

export function consumePendingActivityArrival():
  | ActivityArrival
  | null {
  const arrival = pendingArrival;

  pendingArrival = null;

  return arrival;
}