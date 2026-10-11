import { getDatabase } from "@/database/database";

import type {
  DailyReflection,
  SaveDailyReflectionInput,
} from "@/types/dailyReflection";

type DailyReflectionRow = {
  id: number;
  reflection_date: string;
  content: string;
  created_at: string;
  updated_at: string;
};

function mapReflection(
  row: DailyReflectionRow,
): DailyReflection {
  return {
    id: row.id,
    reflectionDate: row.reflection_date,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class DailyReflectionRepository {
  async getByDate(
    reflectionDate: string,
  ): Promise<DailyReflection | null> {
    const database = await getDatabase();

    const row =
      await database.getFirstAsync<DailyReflectionRow>(
        `SELECT *
         FROM daily_reflections
         WHERE reflection_date = ?`,
        [reflectionDate],
      );

    return row ? mapReflection(row) : null;
  }

  async save(
    input: SaveDailyReflectionInput,
  ): Promise<DailyReflection> {
    const database = await getDatabase();

    await database.runAsync(
      `INSERT INTO daily_reflections (
        reflection_date,
        content
      )
      VALUES (?, ?)
      ON CONFLICT(reflection_date)
      DO UPDATE SET
        content = excluded.content,
        updated_at = CURRENT_TIMESTAMP`,
      [input.reflectionDate, input.content],
    );

    const reflection = await this.getByDate(
      input.reflectionDate,
    );

    if (!reflection) {
      throw new Error(
        "Saved reflection could not be loaded.",
      );
    }

    return reflection;
  }

  async getRecent(
    limit: number = 30,
  ): Promise<DailyReflection[]> {
    const database = await getDatabase();

    const rows =
      await database.getAllAsync<DailyReflectionRow>(
        `SELECT *
         FROM daily_reflections
         ORDER BY reflection_date DESC
         LIMIT ?`,
        [limit],
      );

    return rows.map(mapReflection);
  }

  async deleteByDate(
    reflectionDate: string,
  ): Promise<void> {
    const database = await getDatabase();

    await database.runAsync(
      `DELETE FROM daily_reflections
       WHERE reflection_date = ?`,
      [reflectionDate],
    );
  }
}

export const dailyReflectionRepository =
  new DailyReflectionRepository();