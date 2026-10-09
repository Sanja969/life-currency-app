import { getDatabase } from "../database/database";
import { ActivityRow, toActivity } from "../mappers/ActivityMapper";
import {
  Activity,
  CreateActivityInput,
  UpdateActivityInput,
} from "../types/activity";

export class ActivityRepository {
  async getAll(): Promise<Activity[]> {
    const database = await getDatabase();

    const rows = await database.getAllAsync<ActivityRow>(`
        SELECT * FROM activities ORDER BY activity_date DESC`);

    return rows.map(toActivity);
  }

  async getByDate(date: Date): Promise<Activity[]> {
    const database = await getDatabase();

    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
    );

    const rows = await database.getAllAsync<ActivityRow>(
      `SELECT *
     FROM activities
     WHERE activity_date >= ?
       AND activity_date < ?
     ORDER BY activity_date DESC`,
      [startOfDay.toISOString(), endOfDay.toISOString()],
    );

    return rows.map(toActivity);
  }

  async getByDateRange(
    start: Date,
    end: Date,
  ): Promise<Activity[]> {
    const database = await getDatabase();

    const rows = await database.getAllAsync<ActivityRow>(
      `SELECT *
       FROM activities
       WHERE activity_date >= ?
         AND activity_date < ?
       ORDER BY activity_date DESC`,
      [start.toISOString(), end.toISOString()],
    );

    return rows.map(toActivity);
  }

  async getById(id: number): Promise<Activity | null> {
    const database = await getDatabase();

    const row = await database.getFirstAsync<ActivityRow>(
      `SELECT * FROM activities WHERE id = ?`,
      [id],
    );

    return row ? toActivity(row) : null;
  }

  async create(input: CreateActivityInput): Promise<Activity> {
    const database = await getDatabase();

    const result = await database.runAsync(
      `INSERT INTO activities (
        title,
        description,
        duration_minutes,
        classification,
        category,
        activity_date
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        input.description ?? null,
        input.durationMinutes,
        input.classification,
        input.category,
        input.activityDate.toISOString(),
      ],
    );

    const createdActivity = await this.getById(result.lastInsertRowId);

    if (!createdActivity) {
      throw new Error("Created activity could not be loaded.");
    }

    return createdActivity;
  }

  async update(id: number, input: UpdateActivityInput): Promise<Activity> {
    const database = await getDatabase();

    const result = await database.runAsync(
      `UPDATE activities
       SET
         title = ?,
         description = ?,
         duration_minutes = ?,
         classification = ?,
         category = ?,
         activity_date = ?,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        input.title,
        input.description ?? null,
        input.durationMinutes,
        input.classification,
        input.category,
        input.activityDate.toISOString(),
        id,
      ],
    );

    if (result.changes === 0) {
      throw new Error(`Activity with id ${id} not found.`);
    }

    const updatedActivity = await this.getById(id);

    if (!updatedActivity) {
      throw new Error("Updated activity could not be loaded.");
    }

    return updatedActivity;
  }

  async delete(id: number): Promise<void> {
    const database = await getDatabase();

    const result = await database.runAsync(
      `DELETE FROM activities WHERE id = ?`,
      [id],
    );

    if (result.changes === 0) {
      throw new Error(`Activity with id ${id} not found.`);
    }
  }

  async deleteAll(): Promise<void> {
    const database = await getDatabase();

    await database.runAsync(
      `DELETE FROM activities`,
    );
  }

  async replaceAll(activities: Activity[]): Promise<void> {
    const database = await getDatabase();

    await database.withTransactionAsync(async () => {
      await database.runAsync(`DELETE FROM activities`);

      for (const activity of activities) {
        await database.runAsync(
          `INSERT INTO activities (
            id,
            title,
            description,
            duration_minutes,
            classification,
            category,
            activity_date,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

          activity.id,
          activity.title,
          activity.description ?? null,
          activity.durationMinutes,
          activity.classification,
          activity.category,
          activity.activityDate.toISOString(),
          activity.createdAt.toISOString(),
          activity.updatedAt.toISOString(),
        );
      }
    });
  }
  async getPage(
    limit: number,
    offset: number,
    searchQuery: string = "",
    filter: string = "all",
  ): Promise<Activity[]> {
    const database = await getDatabase();

    const query = searchQuery.trim().toLowerCase();

    const rows = await database.getAllAsync<ActivityRow>(
      `SELECT *
       FROM activities
       WHERE (
         ? = ''
         OR LOWER(title) LIKE '%' || ? || '%'
         OR LOWER(COALESCE(description, '')) LIKE '%' || ? || '%'
       )
       AND (? = 'all' OR classification = ?)
       ORDER BY activity_date DESC, id DESC
       LIMIT ? OFFSET ?`,
      [query, query, query, filter, filter, limit, offset],
    );

    return rows.map(toActivity);
  }

  async getActivityCounts(
    searchQuery: string = "",
    filter: string = "all",
  ): Promise<{ growingCount: number; leaksCount: number }> {
    const database = await getDatabase();

    const query = searchQuery.trim().toLowerCase();

    const result = await database.getFirstAsync<{
      growingCount: number;
      leaksCount: number;
    }>(
      `SELECT
         COUNT(CASE WHEN classification = 'serves' THEN 1 END) AS growingCount,
         COUNT(CASE WHEN classification = 'does_not_serve' THEN 1 END) AS leaksCount
       FROM activities
       WHERE (
         ? = ''
         OR LOWER(title) LIKE '%' || ? || '%'
         OR LOWER(COALESCE(description, '')) LIKE '%' || ? || '%'
       )
       AND (? = 'all' OR classification = ?)`,
      [query, query, query, filter, filter],
    );

    return {
      growingCount: result?.growingCount ?? 0,
      leaksCount: result?.leaksCount ?? 0,
    };
  }
}

export const activityRepository = new ActivityRepository();
