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

type LifeCurrencyBackup = {
    format: typeof BACKUP_FORMAT;
    version: typeof BACKUP_VERSION;
    exportedAt: string;
    activities: Awaited<
        ReturnType<typeof activityService.getAllActivities>
    >;
};

export class DataBackupService {
    async exportData(): Promise<void> {
        const activities = await activityService.getAllActivities();

        const backup: LifeCurrencyBackup = {
            format: BACKUP_FORMAT,
            version: BACKUP_VERSION,
            exportedAt: new Date().toISOString(),
            activities,
        };

        const sharingAvailable = await Sharing.isAvailableAsync();

        if (!sharingAvailable) {
            throw new Error("Sharing is not available on this device.");
        }

        const directory = FileSystem.cacheDirectory;

        if (!directory) {
            throw new Error("Unable to access the device file system.");
        }

        const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, "-");

        const fileUri =
            `${directory}life-currency-backup-${timestamp}.json`;

        await FileSystem.writeAsStringAsync(
            fileUri,
            JSON.stringify(backup, null, 2),
            {
                encoding: FileSystem.EncodingType.UTF8,
            },
        );

        await Sharing.shareAsync(fileUri, {
            mimeType: "application/json",
            dialogTitle: "Export Life Currency data",
            UTI: "public.json",
        });
    }

    async pickBackup(): Promise<Activity[] | null> {
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
            throw new Error("No backup file was selected.");
        }

        const content = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        let parsed: unknown;

        try {
            parsed = JSON.parse(content);
        } catch {
            throw new Error("The selected file is not valid JSON.");
        }

        if (!this.isValidBackup(parsed)) {
            throw new Error("This is not a valid Life Currency backup.");
        }

        return parsed.activities.map((activity) => ({
            ...activity,
            activityDate: new Date(activity.activityDate),
            createdAt: new Date(activity.createdAt),
            updatedAt: new Date(activity.updatedAt),
        }));
    }

    private isValidBackup(
        value: unknown,
    ): value is {
        format: "life-currency-backup";
        version: 1;
        exportedAt: string;
        activities: Array<{
            id: number;
            title: string;
            description?: string;
            durationMinutes: number;
            classification: ActivityClassification;
            category: ActivityCategory;
            activityDate: string;
            createdAt: string;
            updatedAt: string;
        }>;
    } {
        if (
            typeof value !== "object" ||
            value === null
        ) {
            return false;
        }

        const backup = value as Record<string, unknown>;

        if (
            backup.format !== BACKUP_FORMAT ||
            backup.version !== BACKUP_VERSION ||
            !Array.isArray(backup.activities)
        ) {
            return false;
        }

        return backup.activities.every((activity) => {
            if (
                typeof activity !== "object" ||
                activity === null
            ) {
                return false;
            }

            const item = activity as Record<string, unknown>;

            return (
                typeof item.id === "number" &&
                typeof item.title === "string" &&
                typeof item.durationMinutes === "number" &&
                item.durationMinutes > 0 &&
                Object.values(ActivityClassification).includes(
                    item.classification as ActivityClassification,
                ) &&
                Object.values(ActivityCategory).includes(
                    item.category as ActivityCategory,
                ) &&
                typeof item.activityDate === "string" &&
                !Number.isNaN(Date.parse(item.activityDate)) &&
                typeof item.createdAt === "string" &&
                !Number.isNaN(Date.parse(item.createdAt)) &&
                typeof item.updatedAt === "string" &&
                !Number.isNaN(Date.parse(item.updatedAt)) &&
                (
                    item.description === undefined ||
                    item.description === null ||
                    typeof item.description === "string"
                )
            );
        });
    }
    async restoreBackup(

        activities: Activity[],

    ): Promise<void> {

        await activityService.replaceAllActivities(activities);

    }

    async exportCsv(): Promise<void> {
        const activities = await activityService.getAllActivities();

        const sharingAvailable = await Sharing.isAvailableAsync();

        if (!sharingAvailable) {
            throw new Error("Sharing is not available on this device.");
        }

        const directory = FileSystem.cacheDirectory;

        if (!directory) {
            throw new Error("Unable to access the device file system.");
        }

        const escapeCsvValue = (
            value: string | number | undefined,
        ): string => {
            const stringValue =
                value === undefined || value === null
                    ? ""
                    : String(value);

            return `"${stringValue.replace(/"/g, '""')}"`;
        };

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
        ].join("\n");

        const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, "-");

        const fileUri =
            `${directory}life-currency-export-${timestamp}.csv`;

        await FileSystem.writeAsStringAsync(
            fileUri,
            csv,
            {
                encoding: FileSystem.EncodingType.UTF8,
            },
        );

        await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Export Life Currency CSV",
            UTI: "public.comma-separated-values-text",
        });
    }
}

export const dataBackupService = new DataBackupService();