import { getDatabase } from "@/database/database";

import { ActivityCategory } from "@/types/activity";

import {
  WeeklyIntention,
  SaveWeeklyIntentionInput,
} from "@/types/weeklyIntention";

type WeeklyIntentionRow = {
  id: number;
  category: string;
  week_start: string;
  target_minutes: number;
  created_at: string;
  updated_at: string;
};

function toWeeklyIntention(
  row: WeeklyIntentionRow,
): WeeklyIntention {
  return {
    id: row.id,
    category: row.category as ActivityCategory,
    weekStart: row.week_start,
    targetMinutes: row.target_minutes,
    createdAt: new Date(
      row.created_at.replace(" ", "T") + "Z",
    ),
    updatedAt: new Date(
      row.updated_at.replace(" ", "T") + "Z",
    ),
  };
}

export class WeeklyIntentionRepository {
  async getByWeek(
    weekStart: string,
  ): Promise<WeeklyIntention[]> {
    const database = await getDatabase();

    const rows =
      await database.getAllAsync<WeeklyIntentionRow>(
        `SELECT *
         FROM weekly_intentions
         WHERE week_start = ?
         ORDER BY id ASC`,
        [weekStart],
      );

    return rows.map(toWeeklyIntention);
  }

  async save(
    input: SaveWeeklyIntentionInput,
  ): Promise<void> {
    const database = await getDatabase();

    await database.runAsync(
      `INSERT INTO weekly_intentions (
        category,
        week_start,
        target_minutes
      )
      VALUES (?, ?, ?)
      ON CONFLICT(category, week_start)
      DO UPDATE SET
        target_minutes = excluded.target_minutes,
        updated_at = CURRENT_TIMESTAMP`,
      [
        input.category,
        input.weekStart,
        input.targetMinutes,
      ],
    );
  }

  async delete(
    category: ActivityCategory,
    weekStart: string,
  ): Promise<void> {
    const database = await getDatabase();

    await database.runAsync(
      `DELETE FROM weekly_intentions
       WHERE category = ?
         AND week_start = ?`,
      [category, weekStart],
    );
  }
}

export const weeklyIntentionRepository =
  new WeeklyIntentionRepository();