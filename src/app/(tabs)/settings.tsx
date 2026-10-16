import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Constants from "expo-constants";
import { useRef } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { CosmicPanel } from "@/components/ui/CosmicPanel";

import { activityService } from "@/services/ActivityService";
import { dataBackupService } from "@/services/DataBackupService";
import { COLORS } from "@/theme/colors";

type SettingsRowProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  destructive?: boolean;
  onPress: () => void;
};

function SettingsRow({
  icon,
  title,
  description,
  destructive = false,
  onPress,
}: SettingsRowProps) {
  const accent = destructive ? COLORS.danger : COLORS.gold;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.68 : 1 }]}
    >
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: destructive
              ? COLORS.dangerBackground
              : COLORS.goldBackground,
            borderColor: destructive ? COLORS.dangerBorder : COLORS.goldBorder,
          },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={21} color={accent} />
      </View>

      <View style={styles.rowText}>
        <Text
          style={[
            styles.rowTitle,
            { color: destructive ? COLORS.danger : COLORS.text },
          ]}
        >
          {title}
        </Text>

        <Text style={styles.rowDescription}>{description}</Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={21}
        color={COLORS.subtle}
      />
    </Pressable>
  );
}

function SettingsDivider() {
  return <View style={styles.divider} />;
}

function SectionHeader({
  title,
  destructive = false,
}: {
  title: string;
  destructive?: boolean;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionDot,
          {
            backgroundColor: destructive ? COLORS.danger : COLORS.gold,
          },
        ]}
      />

      <Text
        style={[
          styles.sectionTitle,
          {
            color: destructive ? COLORS.danger : COLORS.muted,
          },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const operationRunning = useRef(false);

  function startOperation() {
    if (operationRunning.current) return false;

    operationRunning.current = true;
    return true;
  }

  function finishOperation() {
    operationRunning.current = false;
  }

  async function handleExportData() {
    if (!startOperation()) return;

    try {
      await dataBackupService.exportData();
    } catch (error) {
      console.error("Failed to export activity backup:", error);

      Alert.alert(
        "Export failed",
        "Your activity backup could not be exported. Please try again.",
      );
    } finally {
      finishOperation();
    }
  }

  async function handleImportData() {
    if (!startOperation()) return;

    let confirmationShown = false;

    try {
      const backup = await dataBackupService.pickBackup();

      if (!backup) {
        return;
      }

      confirmationShown = true;

      const isV2 = backup.version === 2;

      const activitiesCount = backup.activities.length;

      const intentionsCount = backup.weeklyIntentions?.length ?? 0;

      const reflectionsCount = backup.dailyReflections?.length ?? 0;

      const backupDescription = isV2
        ? `This backup contains:\n\n` +
          `• ${activitiesCount} activities\n` +
          `• ${intentionsCount} weekly intentions\n` +
          `• ${reflectionsCount} daily reflections`
        : `This is an older backup containing ` +
          `${activitiesCount} activities.\n\n` +
          `Weekly intentions and daily reflections ` +
          `on this device will remain unchanged.`;

      const replacementWarning = isV2
        ? "Restoring will replace all existing activities, " +
          "weekly intentions, and daily reflections on this device."
        : "Restoring will replace your existing activity history.";

      Alert.alert(
        "Restore Life Currency backup?",
        `${backupDescription}\n\n${replacementWarning}\n\nThis action cannot be undone.`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: finishOperation,
          },
          {
            text: "Restore",
            style: "destructive",
            onPress: async () => {
              try {
                await dataBackupService.restoreBackup(backup);

                Alert.alert(
                  "Backup restored",
                  isV2
                    ? "Your activities, weekly intentions, and daily reflections have been restored successfully."
                    : "Your activity history has been restored successfully.",
                );
              } catch (error) {
                console.error("Failed to restore Life Currency backup:", error);

                Alert.alert(
                  "Restore failed",
                  "Your backup could not be restored. Your existing data has been preserved.",
                );
              } finally {
                finishOperation();
              }
            },
          },
        ],
        {
          cancelable: false,
        },
      );
    } catch (error) {
      console.error("Failed to read Life Currency backup:", error);

      Alert.alert(
        "Invalid backup",
        "The selected file is not a valid Life Currency backup.",
      );
    } finally {
      if (!confirmationShown) {
        finishOperation();
      }
    }
  }

  async function handleExportCsv() {
    if (!startOperation()) return;

    try {
      await dataBackupService.exportCsv();
    } catch (error) {
      console.error("Failed to export CSV:", error);

      Alert.alert(
        "Export failed",
        "Your activities could not be exported as CSV. Please try again.",
      );
    } finally {
      finishOperation();
    }
  }

  function handleDeleteAllData() {
    if (!startOperation()) return;

    Alert.alert(
      "Delete activity history?",
      "This permanently deletes all recorded activities from this device. Your weekly intentions are not deleted.\n\nThis action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: finishOperation,
        },
        {
          text: "Delete all",
          style: "destructive",
          onPress: async () => {
            try {
              await activityService.deleteAllActivities();

              Alert.alert(
                "Activity history deleted",
                "Your recorded activities have been permanently deleted.",
              );
            } catch (error) {
              console.error("Failed to delete activities:", error);

              Alert.alert(
                "Delete failed",
                "Your activity history could not be deleted. Please try again.",
              );
            } finally {
              finishOperation();
            }
          },
        },
      ],
      { cancelable: false },
    );
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ScreenHeader
            eyebrow="YOUR SPACE"
            title="Settings"
            subtitle="Your data. Your control."
          />

          {/* DATA & PRIVACY */}

          <SectionHeader title="DATA & PRIVACY" />

          <CosmicPanel variant="subtle" contentStyle={styles.panelContent}>
            <SettingsRow
              icon="export-variant"
              title="Export backup"
              description="Save activities, intentions, and reflections."
              onPress={handleExportData}
            />

            <SettingsDivider />

            <SettingsRow
              icon="import"
              title="Restore backup"
              description="Restore your Life Currency data from a backup."
              onPress={handleImportData}
            />

            <SettingsDivider />

            <SettingsRow
              icon="file-delimited-outline"
              title="Export activities as CSV"
              description="View your activity history in a spreadsheet."
              onPress={handleExportCsv}
            />
          </CosmicPanel>

          {/* PRIVACY */}

          <View style={styles.privacyCard}>
            {/* Gold accent */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 42,
                height: 2,
                backgroundColor: COLORS.gold,
                opacity: 0.7,
              }}
            />

            <View style={styles.privacyIcon}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={21}
                color={COLORS.gold}
              />
            </View>

            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>
                Your data stays on your device
              </Text>
              <Text style={styles.privacyDescription}>
                Your activities, weekly intentions, and daily reflections are
                stored on this device. Export a backup before deleting the app
                or switching devices.
              </Text>
            </View>
          </View>

          {/* DANGER ZONE */}

          <SectionHeader title="DANGER ZONE" destructive />

          <View style={styles.dangerCard}>
            <View style={styles.dangerAccent} />

            <SettingsRow
              icon="delete-outline"
              title="Delete activity history"
              description="Permanently remove all recorded activities."
              destructive
              onPress={handleDeleteAllData}
            />
          </View>

          {/* ABOUT */}

          <SectionHeader title="ABOUT" />

          <CosmicPanel variant="subtle" contentStyle={styles.aboutContent}>
            <View style={styles.aboutAccent} />

            <View style={styles.aboutRow}>
              <View style={styles.appIcon}>
                <MaterialCommunityIcons
                  name="orbit"
                  size={25}
                  color={COLORS.gold}
                />
              </View>

              <View style={styles.appInfo}>
                <Text style={styles.appName}>Life Currency</Text>

                <Text style={styles.appDescription}>
                  Make every hour count.
                </Text>

                <Text style={styles.appVersion}>
                  Version {Constants.expoConfig?.version ?? "1.0.0"}
                </Text>
              </View>

              <View style={styles.versionBadge}>
                <Text style={styles.versionBadgeText}>v1</Text>
              </View>
            </View>
          </CosmicPanel>

          {/* FOOTER */}

          <View style={styles.footer}>
            <View style={styles.footerLine} />

            <Text style={styles.footerText}>
              Your time is your life currency.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 130,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 31,
    marginBottom: 14,
  },

  sectionDot: {
    width: 6,
    height: 6,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  panelContent: {
    padding: 0,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    paddingVertical: 18,
  },

  rowIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  rowText: {
    flex: 1,
    marginLeft: 14,
  },

  rowTitle: {
    fontSize: 13,
    fontWeight: "600",
  },

  rowDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  divider: {
    height: 1,
    marginLeft: 74,
    backgroundColor: COLORS.border,
  },

  privacyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 17,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    backgroundColor: COLORS.goldBackground,
    borderRadius: 0,
  },

  dangerCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    borderRadius: 0,
    overflow: "hidden",
  },

  privacyText: {
    flex: 1,
    marginLeft: 10,
  },

  privacyTitle: {
    color: COLORS.lightGold,
    fontSize: 12,
    fontWeight: "600",
  },

  privacyDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 7,
  },

  dangerAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 45,
    height: 2,
    backgroundColor: COLORS.danger,
  },

  aboutContent: {
    padding: 18,
  },

  aboutAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 48,
    height: 2,
    backgroundColor: COLORS.gold,
  },

  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  appIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.goldBackground,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  appInfo: {
    flex: 1,
    marginLeft: 13,
  },

  appName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },

  appDescription: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },

  appVersion: {
    color: COLORS.subtle,
    fontSize: 10,
    marginTop: 7,
  },

  versionBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    backgroundColor: COLORS.goldBackground,
  },

  versionBadgeText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "600",
  },

  footer: {
    alignItems: "center",
    marginTop: 36,
  },

  footerLine: {
    width: 42,
    height: 1,
    backgroundColor: COLORS.goldBorder,
    marginBottom: 15,
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 12,
    fontStyle: "italic",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  privacyIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
});
