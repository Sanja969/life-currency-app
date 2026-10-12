import { getDatabase } from "@/database/database";

import { ActivityCategory } from "@/types/activity";

import type {
    WeeklyIntention,
    SaveWeeklyIntentionInput,
    IntentionDirection,
} from "@/types/weeklyIntention";

type WeeklyIntentionRow = {
    id: number;
    category: string;
    week_start: string;
    target_minutes: number;
    created_at: string;
    updated_at: string;
    direction: IntentionDirection;
};

/**
 * Converts SQLite timestamps to JavaScript Date.
 *
 * Supports:
 * - SQLite CURRENT_TIMESTAMP: YYYY-MM-DD HH:mm:ss
 * - ISO timestamps with timezone
 */
function parseDatabaseDate(value: string): Date {
    const normalized = value.replace(" ", "T");

    const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(
        normalized,
    );

    return new Date(
        hasTimezone ? normalized : `${normalized}Z`,
    );
}

function toWeeklyIntention(
    row: WeeklyIntentionRow,
): WeeklyIntention {
    return {
        id: row.id,
        category: row.category as ActivityCategory,
        weekStart: row.week_start,
        targetMinutes: row.target_minutes,
        createdAt: parseDatabaseDate(row.created_at),
        updatedAt: parseDatabaseDate(row.updated_at),
        direction: row.direction,
    };
}

export class WeeklyIntentionRepository {
    /**
     * Returns all intentions for a specific week.
     */
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

    /**
     * Creates a new intention or updates
     * an existing intention for the same
     * category and week.
     */

    /**
 * Carries selected intentions from a previous week
 * into a new week without overwriting existing ones.
 *
 * Existing intentions and historical records
 * remain unchanged.
 */
    async carryForward(
        previousWeekStart: string,
        currentWeekStart: string,
        categories: ActivityCategory[],
    ): Promise<void> {
        if (categories.length === 0) {
            return;
        }

        const database = await getDatabase();

        const placeholders = categories
            .map(() => "?")
            .join(", ");

        await database.runAsync(
            `INSERT INTO weekly_intentions (
        category,
        week_start,
        target_minutes,
        direction
      )
      SELECT
        category,
        ?,
        target_minutes,
        direction
      FROM weekly_intentions
      WHERE week_start = ?
        AND category IN (${placeholders})
      ON CONFLICT(category, week_start)
      DO NOTHING`,
            [
                currentWeekStart,
                previousWeekStart,
                ...categories,
            ],
        );
    }

    async save(
        input: SaveWeeklyIntentionInput,
    ): Promise<void> {
        const database = await getDatabase();

        await database.runAsync(
            `INSERT INTO weekly_intentions (
            category,
            week_start,
            target_minutes,
            direction
          )
          VALUES (?, ?, ?, ?)
          ON CONFLICT(category, week_start)
          DO UPDATE SET
            target_minutes = excluded.target_minutes,
            direction = excluded.direction,
            updated_at = CURRENT_TIMESTAMP`,
            [
                input.category,
                input.weekStart,
                input.targetMinutes,
                input.direction,
            ],
        );
    }

    /**
     * Deletes an intention for a
     * specific category and week.
     */
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