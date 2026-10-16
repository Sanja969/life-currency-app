import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

import { getDatabase } from "@/database/database";

import {
    Activity,
    ActivityCategory,
    ActivityClassification,
} from "@/types/activity";

import type { IntentionDirection } from "@/types/weeklyIntention";

import { activityService } from "@/services/ActivityService";

const BACKUP_FORMAT = "life-currency-backup";
const BACKUP_VERSION = 2;

const MAX_BACKUP_SIZE_BYTES = 10 * 1024 * 1024;

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type SerializedActivity = {
    id: number;
    title: string;
    description?: string | null;
    durationMinutes: number;
    classification: ActivityClassification;
    category: ActivityCategory;
    activityDate: string;
    createdAt: string;
    updatedAt: string;
};

type SerializedWeeklyIntention = {
    id: number;
    category: ActivityCategory;
    weekStart: string;
    targetMinutes: number;
    direction: IntentionDirection;
    createdAt: string;
    updatedAt: string;
};

type SerializedDailyReflection = {
    id: number;
    reflectionDate: string;
    content: string;
    createdAt: string;
    updatedAt: string;
};

type BackupV1 = {
    format: typeof BACKUP_FORMAT;
    version: 1;
    exportedAt: string;
    activities: SerializedActivity[];
};

type BackupV2 = {
    format: typeof BACKUP_FORMAT;
    version: 2;
    exportedAt: string;
    activities: SerializedActivity[];
    weeklyIntentions: SerializedWeeklyIntention[];
    dailyReflections: SerializedDailyReflection[];
};

type SupportedBackup = BackupV1 | BackupV2;

export type ParsedLifeCurrencyBackup = {
    version: 1 | 2;
    activities: Activity[];
    weeklyIntentions: SerializedWeeklyIntention[] | null;
    dailyReflections: SerializedDailyReflection[] | null;
};

// --------------------------------------------------
// DATABASE ROWS
// --------------------------------------------------

type WeeklyIntentionRow = {
    id: number;
    category: string;
    week_start: string;
    target_minutes: number;
    direction: IntentionDirection;
    created_at: string;
    updated_at: string;
};

type DailyReflectionRow = {
    id: number;
    reflection_date: string;
    content: string;
    created_at: string;
    updated_at: string;
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function isValidIsoDate(value: unknown): value is string {
    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString() === value
    );
}

function isValidCalendarDate(value: unknown): value is string {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
}

function isValidId(value: unknown): value is number {
    return Number.isSafeInteger(value) && Number(value) > 0;
}

function isValidPositiveMinutes(
    value: unknown,
): value is number {
    return Number.isSafeInteger(value) && Number(value) > 0;
}

function isValidCategory(
    value: unknown,
): value is ActivityCategory {
    return Object.values(ActivityCategory).includes(
        value as ActivityCategory,
    );
}

function isValidClassification(
    value: unknown,
): value is ActivityClassification {
    return Object.values(ActivityClassification).includes(
        value as ActivityClassification,
    );
}

function isValidDirection(
    value: unknown,
): value is IntentionDirection {
    return value === "at_least" || value === "at_most";
}

/**
 * SQLite CURRENT_TIMESTAMP uses:
 * YYYY-MM-DD HH:mm:ss
 *
 * ISO timestamps are also supported.
 */
function databaseTimestampToIso(value: string): string {
    const normalized = value.replace(" ", "T");

    const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(
        normalized,
    );

    const date = new Date(
        hasTimezone ? normalized : `${normalized}Z`,
    );

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid database timestamp.");
    }

    return date.toISOString();
}

function createTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, "-");
}

function getCacheDirectory(): string {
    const directory = FileSystem.cacheDirectory;

    if (!directory) {
        throw new Error(
            "Unable to access the device file system.",
        );
    }

    return directory;
}

async function shareFile(
    fileUri: string,
    mimeType: string,
    dialogTitle: string,
    UTI: string,
): Promise<void> {
    const sharingAvailable = await Sharing.isAvailableAsync();

    if (!sharingAvailable) {
        throw new Error(
            "Sharing is not available on this device.",
        );
    }

    await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle,
        UTI,
    });
}

function escapeCsvValue(
    value: string | number | undefined | null,
): string {
    const stringValue =
        value === undefined || value === null
            ? ""
            : String(value);

    const potentiallyUnsafe =
        /^\s*[=+\-@]/.test(stringValue) ||
        /^[\t\r\n]/.test(stringValue);

    const safeValue = potentiallyUnsafe
        ? `'${stringValue}`
        : stringValue;

    return `"${safeValue.replace(/"/g, '""')}"`;
}

// --------------------------------------------------
// VALIDATION
// --------------------------------------------------

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

function validateActivities(
    activities: unknown,
): activities is SerializedActivity[] {
    if (!Array.isArray(activities)) {
        return false;
    }

    const ids = new Set<number>();

    return activities.every((value) => {
        if (!isRecord(value)) {
            return false;
        }

        if (!isValidId(value.id)) {
            return false;
        }

        if (ids.has(value.id)) {
            return false;
        }

        ids.add(value.id);

        return (
            typeof value.title === "string" &&
            value.title.trim().length > 0 &&
            isValidPositiveMinutes(value.durationMinutes) &&
            isValidClassification(value.classification) &&
            isValidCategory(value.category) &&
            isValidIsoDate(value.activityDate) &&
            isValidIsoDate(value.createdAt) &&
            isValidIsoDate(value.updatedAt) &&
            (
                value.description === undefined ||
                value.description === null ||
                typeof value.description === "string"
            )
        );
    });
}

function validateWeeklyIntentions(
    intentions: unknown,
): intentions is SerializedWeeklyIntention[] {
    if (!Array.isArray(intentions)) {
        return false;
    }

    const ids = new Set<number>();
    const uniqueWeeks = new Set<string>();

    return intentions.every((value) => {
        if (!isRecord(value)) {
            return false;
        }

        if (
            !isValidId(value.id) ||
            !isValidCategory(value.category) ||
            !isValidCalendarDate(value.weekStart) ||
            !isValidPositiveMinutes(value.targetMinutes) ||
            !isValidDirection(value.direction) ||
            !isValidIsoDate(value.createdAt) ||
            !isValidIsoDate(value.updatedAt)
        ) {
            return false;
        }

        const uniqueKey = JSON.stringify([
            value.category,
            value.weekStart,
        ]);

        if (
            ids.has(value.id) ||
            uniqueWeeks.has(uniqueKey)
        ) {
            return false;
        }

        ids.add(value.id);
        uniqueWeeks.add(uniqueKey);

        return true;
    });
}

function validateDailyReflections(
    reflections: unknown,
): reflections is SerializedDailyReflection[] {
    if (!Array.isArray(reflections)) {
        return false;
    }

    const ids = new Set<number>();
    const dates = new Set<string>();

    return reflections.every((value) => {
        if (!isRecord(value)) {
            return false;
        }

        if (
            !isValidId(value.id) ||
            !isValidCalendarDate(value.reflectionDate) ||
            typeof value.content !== "string" ||
            value.content.trim().length === 0 ||
            !isValidIsoDate(value.createdAt) ||
            !isValidIsoDate(value.updatedAt)
        ) {
            return false;
        }

        if (
            ids.has(value.id) ||
            dates.has(value.reflectionDate)
        ) {
            return false;
        }

        ids.add(value.id);
        dates.add(value.reflectionDate);

        return true;
    });
}

function isValidBackup(
    value: unknown,
): value is SupportedBackup {
    if (!isRecord(value)) {
        return false;
    }

    if (
        value.format !== BACKUP_FORMAT ||
        !isValidIsoDate(value.exportedAt) ||
        !validateActivities(value.activities)
    ) {
        return false;
    }

    if (value.version === 1) {
        return true;
    }

    if (value.version === 2) {
        return (
            validateWeeklyIntentions(value.weeklyIntentions) &&
            validateDailyReflections(value.dailyReflections)
        );
    }

    return false;
}

// --------------------------------------------------
// DATA BACKUP SERVICE
// --------------------------------------------------

export class DataBackupService {
    // ------------------------------------------------
    // EXPORT BACKUP V2
    // ------------------------------------------------

    async exportData(): Promise<void> {
        const database = await getDatabase();

        // Read all backup tables from one consistent
        // SQLite snapshot.
        let backup: BackupV2 | undefined;

        await database.withExclusiveTransactionAsync(

            async (tx): Promise<void> => {
                const activityRows = await tx.getAllAsync<{
                    id: number;
                    title: string;
                    description: string | null;
                    duration_minutes: number;
                    classification: ActivityClassification;
                    category: ActivityCategory;
                    activity_date: string;
                    created_at: string;
                    updated_at: string;
                }>(
                    `SELECT *
           FROM activities
           ORDER BY id ASC`,
                );

                const weeklyRows =
                    await tx.getAllAsync<WeeklyIntentionRow>(
                        `SELECT *
             FROM weekly_intentions
             ORDER BY id ASC`,
                    );

                const reflectionRows =
                    await tx.getAllAsync<DailyReflectionRow>(
                        `SELECT *
             FROM daily_reflections
             ORDER BY id ASC`,
                    );

                backup = {
                    format: BACKUP_FORMAT,
                    version: BACKUP_VERSION,
                    exportedAt: new Date().toISOString(),

                    activities: activityRows.map((activity) => ({
                        id: activity.id,
                        title: activity.title,
                        description: activity.description,
                        durationMinutes: activity.duration_minutes,
                        classification: activity.classification,
                        category: activity.category,
                        activityDate: databaseTimestampToIso(
                            activity.activity_date,
                        ),
                        createdAt: databaseTimestampToIso(
                            activity.created_at,
                        ),
                        updatedAt: databaseTimestampToIso(
                            activity.updated_at,
                        ),
                    })),

                    weeklyIntentions: weeklyRows.map((intention) => ({
                        id: intention.id,
                        category: intention.category as ActivityCategory,
                        weekStart: intention.week_start,
                        targetMinutes: intention.target_minutes,
                        direction: intention.direction,
                        createdAt: databaseTimestampToIso(
                            intention.created_at,
                        ),
                        updatedAt: databaseTimestampToIso(
                            intention.updated_at,
                        ),
                    })),

                    dailyReflections: reflectionRows.map((reflection) => ({
                        id: reflection.id,
                        reflectionDate: reflection.reflection_date,
                        content: reflection.content,
                        createdAt: databaseTimestampToIso(
                            reflection.created_at,
                        ),
                        updatedAt: databaseTimestampToIso(
                            reflection.updated_at,
                        ),
                    })),
                };
            },
        );

        if (!backup) {
            throw new Error("Failed to create Life Currency backup.");
        }

        const directory = getCacheDirectory();

        const fileUri =
            `${directory}life-currency-backup-v2-${createTimestamp()}.json`;

        await FileSystem.writeAsStringAsync(
            fileUri,
            JSON.stringify(backup, null, 2),
            {
                encoding: FileSystem.EncodingType.UTF8,
            },
        );

        await shareFile(
            fileUri,
            "application/json",
            "Export Life Currency backup",
            "public.json",
        );
    }

    // ------------------------------------------------
    // PICK AND VALIDATE BACKUP
    // ------------------------------------------------

    async pickBackup(): Promise<ParsedLifeCurrencyBackup | null> {
        const result = await DocumentPicker.getDocumentAsync({
            type: "application/json",
            copyToCacheDirectory: true,
            multiple: false,
        });

        if (result.canceled) {
            return null;
        }

        const asset = result.assets[0];

        if (!asset) {
            throw new Error(
                "No backup file was selected.",
            );
        }

        if (
            typeof asset.size === "number" &&
            asset.size > MAX_BACKUP_SIZE_BYTES
        ) {
            throw new Error(
                "Backup file is too large. Maximum size is 10 MB.",
            );
        }

        const fileInfo = await FileSystem.getInfoAsync(asset.uri);

        if (!fileInfo.exists || fileInfo.isDirectory) {
            throw new Error(
                "The selected backup file is unavailable.",
            );
        }

        if (
            typeof fileInfo.size === "number" &&
            fileInfo.size > MAX_BACKUP_SIZE_BYTES
        ) {
            throw new Error(
                "Backup file is too large. Maximum size is 10 MB.",
            );
        }

        const content = await FileSystem.readAsStringAsync(
            asset.uri,
            {
                encoding: FileSystem.EncodingType.UTF8,
            },
        );

        let parsed: unknown;

        try {
            parsed = JSON.parse(content);
        } catch {
            throw new Error(
                "The selected file is not valid JSON.",
            );
        }

        if (!isValidBackup(parsed)) {
            throw new Error(
                "This is not a valid Life Currency backup.",
            );
        }

        return {
            version: parsed.version,

            activities: parsed.activities.map((activity) => ({
                ...activity,
                description: activity.description ?? undefined,
                activityDate: new Date(activity.activityDate),
                createdAt: new Date(activity.createdAt),
                updatedAt: new Date(activity.updatedAt),
            })),

            weeklyIntentions:
                parsed.version === 2
                    ? parsed.weeklyIntentions
                    : null,

            dailyReflections:
                parsed.version === 2
                    ? parsed.dailyReflections
                    : null,
        };
    }

    // ------------------------------------------------
    // RESTORE BACKUP
    // ------------------------------------------------

    async restoreBackup(
        backup: ParsedLifeCurrencyBackup,
    ): Promise<void> {
        // A v1 backup contains activities only.
        // Keep the previous restore behavior.
        if (backup.version === 1) {
            await activityService.replaceAllActivities(
                backup.activities,
            );

            return;
        }

        if (
            backup.weeklyIntentions === null ||
            backup.dailyReflections === null
        ) {
            throw new Error(
                "Backup v2 is missing required data.",
            );
        }

        const database = await getDatabase();

        await database.withExclusiveTransactionAsync(async (tx) => {
            // --------------------------------------------
            // CLEAR EXISTING DATA
            // --------------------------------------------

            await tx.runAsync(
                `DELETE FROM activities`,
            );

            await tx.runAsync(
                `DELETE FROM weekly_intentions`,
            );

            await tx.runAsync(
                `DELETE FROM daily_reflections`,
            );

            // --------------------------------------------
            // RESTORE ACTIVITIES
            // --------------------------------------------

            for (const activity of backup.activities) {
                await tx.runAsync(
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
                    [
                        activity.id,
                        activity.title,
                        activity.description ?? null,
                        activity.durationMinutes,
                        activity.classification,
                        activity.category,
                        activity.activityDate.toISOString(),
                        activity.createdAt.toISOString(),
                        activity.updatedAt.toISOString(),
                    ],
                );
            }

            // --------------------------------------------
            // RESTORE WEEKLY INTENTIONS
            // --------------------------------------------

            for (const intention of backup.weeklyIntentions!) {
                await tx.runAsync(
                    `INSERT INTO weekly_intentions (
            id,
            category,
            week_start,
            target_minutes,
            direction,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        intention.id,
                        intention.category,
                        intention.weekStart,
                        intention.targetMinutes,
                        intention.direction,
                        intention.createdAt,
                        intention.updatedAt,
                    ],
                );
            }

            // --------------------------------------------
            // RESTORE DAILY REFLECTIONS
            // --------------------------------------------

            for (const reflection of backup.dailyReflections!) {
                await tx.runAsync(
                    `INSERT INTO daily_reflections (
            id,
            reflection_date,
            content,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?)`,
                    [
                        reflection.id,
                        reflection.reflectionDate,
                        reflection.content,
                        reflection.createdAt,
                        reflection.updatedAt,
                    ],
                );
            }
        });
    }

    // ------------------------------------------------
    // EXPORT CSV — ACTIVITIES ONLY
    // ------------------------------------------------

    async exportCsv(): Promise<void> {
        const activities =
            await activityService.getAllActivities();

        const header = [
            "Date",
            "Title",
            "Duration Minutes",
            "Classification",
            "Category",
            "Description",
            "Created At",
            "Updated At",
        ];

        const rows = activities.map((activity) => [
            activity.activityDate.toISOString(),
            activity.title,
            activity.durationMinutes,
            activity.classification,
            activity.category,
            activity.description ?? "",
            activity.createdAt.toISOString(),
            activity.updatedAt.toISOString(),
        ]);

        const csv = [
            header.map(escapeCsvValue).join(","),
            ...rows.map((row) =>
                row.map(escapeCsvValue).join(","),
            ),
        ].join("\r\n");

        const directory = getCacheDirectory();

        const fileUri =
            `${directory}life-currency-export-${createTimestamp()}.csv`;

        await FileSystem.writeAsStringAsync(
            fileUri,
            csv,
            {
                encoding: FileSystem.EncodingType.UTF8,
            },
        );

        await shareFile(
            fileUri,
            "text/csv",
            "Export Life Currency CSV",
            "public.comma-separated-values-text",
        );
    }
}

export const dataBackupService =
    new DataBackupService();