import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

import {
    Activity,
    ActivityCategory,
    ActivityClassification,
} from "@/types/activity";

import { activityService } from "@/services/ActivityService";

const BACKUP_FORMAT = "life-currency-backup";
const BACKUP_VERSION = 1;

const MAX_BACKUP_SIZE_BYTES = 10 * 1024 * 1024;

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

type LifeCurrencyBackup = {
    format: typeof BACKUP_FORMAT;
    version: typeof BACKUP_VERSION;
    exportedAt: string;
    activities: SerializedActivity[];
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

function createTimestamp(): string {
    return new Date()
        .toISOString()
        .replace(/[:.]/g, "-");
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
    const sharingAvailable =
        await Sharing.isAvailableAsync();

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

    // Prevent spreadsheet applications from
    // interpreting user-entered text as formulas.
    const potentiallyUnsafe =
        /^\s*[=+\-@]/.test(stringValue) ||
        /^[\t\r\n]/.test(stringValue);

    const safeValue = potentiallyUnsafe
        ? `'${stringValue}`
        : stringValue;

    return `"${safeValue.replace(/"/g, '""')}"`;
}

// --------------------------------------------------
// DATA BACKUP SERVICE
// --------------------------------------------------

export class DataBackupService {
    // ------------------------------------------------
    // EXPORT JSON BACKUP
    // ------------------------------------------------

    async exportData(): Promise<void> {
        const activities =
            await activityService.getAllActivities();

        const backup: LifeCurrencyBackup = {
            format: BACKUP_FORMAT,
            version: BACKUP_VERSION,
            exportedAt: new Date().toISOString(),

            activities: activities.map((activity) => ({
                id: activity.id,
                title: activity.title,
                description: activity.description,
                durationMinutes: activity.durationMinutes,
                classification: activity.classification,
                category: activity.category,
                activityDate: activity.activityDate.toISOString(),
                createdAt: activity.createdAt.toISOString(),
                updatedAt: activity.updatedAt.toISOString(),
            })),
        };

        const directory = getCacheDirectory();

        const fileUri =
            `${directory}life-currency-backup-${createTimestamp()}.json`;

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
            "Export Life Currency data",
            "public.json",
        );
    }

    // ------------------------------------------------
    // PICK AND VALIDATE BACKUP
    // ------------------------------------------------

    async pickBackup(): Promise<Activity[] | null> {
        const result =
            await DocumentPicker.getDocumentAsync({
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

        // Check reported file size before reading.
        if (
            typeof asset.size === "number" &&
            asset.size > MAX_BACKUP_SIZE_BYTES
        ) {
            throw new Error(
                "Backup file is too large. Maximum size is 10 MB.",
            );
        }

        // Also check the actual cached file size.
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

        const content =
            await FileSystem.readAsStringAsync(
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

        if (!this.isValidBackup(parsed)) {
            throw new Error(
                "This is not a valid Life Currency backup.",
            );
        }

        return parsed.activities.map((activity) => ({
            ...activity,

            description: activity.description ?? undefined,

            activityDate: new Date(activity.activityDate),

            createdAt: new Date(activity.createdAt),

            updatedAt: new Date(activity.updatedAt),
        }));
    }

    // ------------------------------------------------
    // VALIDATE BACKUP STRUCTURE
    // ------------------------------------------------

    private isValidBackup(
        value: unknown,
    ): value is LifeCurrencyBackup {
        if (
            typeof value !== "object" ||
            value === null ||
            Array.isArray(value)
        ) {
            return false;
        }

        const backup =
            value as Record<string, unknown>;

        if (
            backup.format !== BACKUP_FORMAT ||
            backup.version !== BACKUP_VERSION ||
            !isValidIsoDate(backup.exportedAt) ||
            !Array.isArray(backup.activities)
        ) {
            return false;
        }

        const seenIds = new Set<number>();

        return backup.activities.every((activity) => {
            if (
                typeof activity !== "object" ||
                activity === null ||
                Array.isArray(activity)
            ) {
                return false;
            }

            const item =
                activity as Record<string, unknown>;

            // Validate ID.
            if (
                !Number.isSafeInteger(item.id) ||
                (item.id as number) <= 0
            ) {
                return false;
            }

            const id = item.id as number;

            // Prevent duplicate activity IDs.
            if (seenIds.has(id)) {
                return false;
            }

            seenIds.add(id);

            // Validate remaining fields.
            return (
                typeof item.title === "string" &&
                item.title.trim().length > 0 &&

                Number.isSafeInteger(item.durationMinutes) &&
                (item.durationMinutes as number) > 0 &&

                Object.values(ActivityClassification).includes(
                    item.classification as ActivityClassification,
                ) &&

                Object.values(ActivityCategory).includes(
                    item.category as ActivityCategory,
                ) &&

                isValidIsoDate(item.activityDate) &&
                isValidIsoDate(item.createdAt) &&
                isValidIsoDate(item.updatedAt) &&

                (
                    item.description === undefined ||
                    item.description === null ||
                    typeof item.description === "string"
                )
            );
        });
    }

    // ------------------------------------------------
    // RESTORE BACKUP
    // ------------------------------------------------

    async restoreBackup(
        activities: Activity[],
    ): Promise<void> {
        await activityService.replaceAllActivities(
            activities,
        );
    }

    // ------------------------------------------------
    // EXPORT CSV
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