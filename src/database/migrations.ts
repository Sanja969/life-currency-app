import { getDatabase } from "./database";

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),

      classification TEXT NOT NULL
        CHECK (classification IN ('serves', 'does_not_serve')),

      category TEXT NOT NULL DEFAULT 'other'
        CHECK (
          category IN (
            'work',
            'learning',
            'health',
            'relationships',
            'rest',
            'entertainment',
            'mindfulness',
            'other'
          )
        ),

      activity_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_activities_date
      ON activities(activity_date);
  `);

  const columns = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(activities);",
  );

  const hasCategoryColumn = columns.some(
    (column) => column.name === "category",
  );

  if (!hasCategoryColumn) {
    await database.execAsync(`
      ALTER TABLE activities
      ADD COLUMN category TEXT NOT NULL DEFAULT 'other'
      CHECK (
        category IN (
          'work',
          'learning',
          'health',
          'relationships',
          'rest',
          'entertainment',
          'mindfulness',
          'other'
        )
      );
    `);
  }

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_activities_category
      ON activities(category);
  `);
}