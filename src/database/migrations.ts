import { getDatabase } from "./database";

const ALL_CATEGORIES = `
  'work',
  'learning',
  'health',
  'relationships',
  'rest',
  'entertainment',
  'mindfulness',
  'household',
  'chores_errands',
  'social_media',
  'commuting',
  'personal_care',
  'shopping',
  'gaming',
  'administrative_tasks',
  'other'
`;

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  // ============================================
  // DATABASE CONFIGURATION
  // ============================================

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  // ============================================
  // ACTIVITIES
  // ============================================

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      title TEXT NOT NULL,
      description TEXT,

      duration_minutes INTEGER NOT NULL
        CHECK (duration_minutes > 0),

      classification TEXT NOT NULL
        CHECK (
          classification IN (
            'serves',
            'does_not_serve'
          )
        ),

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

      created_at TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_activities_date
      ON activities(activity_date);
  `);

  // ============================================
  // EXISTING ACTIVITIES MIGRATION
  // ============================================

  const columns = await database.getAllAsync<{
    name: string;
  }>("PRAGMA table_info(activities);");

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

  // ============================================
  // WEEKLY INTENTIONS
  // ============================================

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS weekly_intentions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      category TEXT NOT NULL
        CHECK (category IN (${ALL_CATEGORIES})),

      week_start TEXT NOT NULL,

      target_minutes INTEGER NOT NULL
        CHECK (target_minutes > 0),

      created_at TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(category, week_start)
    );

    CREATE INDEX IF NOT EXISTS idx_weekly_intentions_week
      ON weekly_intentions(week_start);
  `);

  // ============================================
  // WEEKLY INTENTIONS MIGRATION
  // ============================================

  const weeklyTable = await database.getFirstAsync<{
    sql: string;
  }>(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'weekly_intentions';
  `);

  const needsMigration =
    weeklyTable?.sql != null &&
    !weeklyTable.sql.includes("'chores_errands'");

  if (needsMigration) {
    await database.withExclusiveTransactionAsync(
      async (tx) => {
        // Create updated table
        await tx.execAsync(`
          CREATE TABLE weekly_intentions_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            category TEXT NOT NULL
              CHECK (category IN (${ALL_CATEGORIES})),

            week_start TEXT NOT NULL,

            target_minutes INTEGER NOT NULL
              CHECK (target_minutes > 0),

            created_at TEXT NOT NULL
              DEFAULT CURRENT_TIMESTAMP,

            updated_at TEXT NOT NULL
              DEFAULT CURRENT_TIMESTAMP,

            UNIQUE(category, week_start)
          );
        `);

        // Preserve existing intentions
        await tx.execAsync(`
          INSERT INTO weekly_intentions_new (
            id,
            category,
            week_start,
            target_minutes,
            created_at,
            updated_at
          )
          SELECT
            id,
            category,
            week_start,
            target_minutes,
            created_at,
            updated_at
          FROM weekly_intentions;
        `);

        // Replace old table
        await tx.execAsync(`
          DROP TABLE weekly_intentions;

          ALTER TABLE weekly_intentions_new
          RENAME TO weekly_intentions;

          CREATE INDEX IF NOT EXISTS idx_weekly_intentions_week
          ON weekly_intentions(week_start);
        `);
      },
    );

    console.log(
      "Weekly intentions database migration completed.",
    );
  }
}