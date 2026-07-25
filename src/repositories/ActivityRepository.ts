import { getDatabase } from "../database/database";
import { ActivityRow, toActivity } from "../mappers/ActivityMapper";
import { Activity, CreateActivityInput, UpdateActivityInput } from "../types/activity";

export class ActivityRepository {
    async getAll(): Promise<Activity[]> {
      const database = await getDatabase();

      const rows = await database.getAllAsync<ActivityRow>(`
        SELECT * FROM activities ORDER BY activity_date DESC`);

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
        `INSERT INTO activities (title, description, duration_minutes, classification, activity_date)
         VALUES (?, ?, ?, ?, ?)`,
        [
          input.title,
          input.description ?? null,
          input.durationMinutes,
          input.classification,
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
         SET title = ?, description = ?, duration_minutes = ?, classification = ?, activity_date = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          input.title,
          input.description ?? null,
          input.durationMinutes,
          input.classification,
          input.activityDate.toISOString(),
          id,
        ],
      );

      if(result.changes === 0) {
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
        [id]
      );

      if (result.changes === 0) {
        throw new Error(`Activity with id ${id} not found.`);
      }
    }
}

export const activityRepository = new ActivityRepository();