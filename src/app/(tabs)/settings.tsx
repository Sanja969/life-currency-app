import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Constants from "expo-constants";
import { useRef } from "react";

import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { dataBackupService } from "@/services/DataBackupService";
import { activityService } from "@/services/ActivityService";

const COLORS = {
  background: "#080A10",
  surface: "#11141D",
  border: "#252936",

  gold: "#D6AD65",
  goldBackground: "#24231F",
  goldBorder: "#403728",

  text: "#F5F0E8",
  muted: "#9295A3",
  subtle: "#686C7A",

  danger: "#D88455",
  dangerBackground: "#302019",
  dangerBorder: "#493127",
};

type SettingsRowProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  destructive?: boolean;
  onPress?: () => void;
};

function SettingsRow({
  icon,
  title,
  description,
  destructive = false,
  onPress,
}: SettingsRowProps) {
  const accent = destructive ? COLORS.danger : COLORS.gold;

  const iconBackground = destructive
    ? COLORS.dangerBackground
    : COLORS.goldBackground;

  const iconBorder = destructive ? COLORS.dangerBorder : COLORS.goldBorder;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 19,
        opacity: pressed ? 0.65 : 1,
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: iconBackground,
          borderWidth: 1,
          borderColor: iconBorder,
        }}
      >
        <MaterialCommunityIcons name={icon} size={21} color={accent} />
      </View>

      <View
        style={{
          marginLeft: 14,
          flex: 1,
        }}
      >
        <Text
          style={{
            color: destructive ? COLORS.danger : COLORS.text,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: COLORS.muted,
            fontSize: 12,
            lineHeight: 18,
            marginTop: 5,
          }}
        >
          {description}
        </Text>
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
  return (
    <View
      style={{
        height: 1,

        marginLeft: 74,

        backgroundColor: COLORS.border,
      }}
    />
  );
}
function SettingsSectionHeader({ title }: { title: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginTop: 32,
        marginBottom: 15,
        gap: 9,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          backgroundColor:
            title === "DANGER ZONE" ? COLORS.danger : COLORS.gold,
        }}
      />

      <Text
        style={{
          color: title === "DANGER ZONE" ? COLORS.danger : COLORS.muted,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 1.8,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const operationRunning = useRef(false);

  function startOperation() {
    if (operationRunning.current) {
      return false;
    }

    operationRunning.current = true;

    return true;
  }

  function finishOperation() {
    operationRunning.current = false;
  }

  // EXPORT BACKUP

  async function handleExportData() {
    if (!startOperation()) return;

    try {
      await dataBackupService.exportData();
    } catch (error) {
      console.error("Failed to export Life Currency data:", error);

      Alert.alert(
        "Export failed",
        "Your Life Currency data could not be exported. Please try again.",
      );
    } finally {
      finishOperation();
    }
  }

  // IMPORT BACKUP

  async function handleImportData() {
    if (!startOperation()) return;

    let confirmationShown = false;

    try {
      const activities = await dataBackupService.pickBackup();

      if (!activities) {
        return;
      }

      confirmationShown = true;

      Alert.alert(
        "Restore backup?",
        `This backup contains ${activities.length} ${
          activities.length === 1 ? "activity" : "activities"
        }.\n\nRestoring it will replace all activity data currently stored on this device.`,
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
                await dataBackupService.restoreBackup(activities);

                Alert.alert(
                  "Backup restored",
                  "Your activity history has been restored successfully.",
                );
              } catch (error) {
                console.error("Failed to restore Life Currency backup:", error);

                Alert.alert(
                  "Restore failed",
                  "Your activity data could not be restored. Please try again.",
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

  // EXPORT CSV

  async function handleExportCsv() {
    if (!startOperation()) return;

    try {
      await dataBackupService.exportCsv();
    } catch (error) {
      console.error("Failed to export Life Currency CSV:", error);

      Alert.alert(
        "Export failed",
        "Your activity data could not be exported as CSV. Please try again.",
      );
    } finally {
      finishOperation();
    }
  }

  // DELETE ALL DATA

  function handleDeleteAllData() {
    if (!startOperation()) return;

    Alert.alert(
      "Delete all activity data?",
      "This will permanently delete your entire activity history from this device. This action cannot be undone.",
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
                "Activity data deleted",
                "Your activity history has been permanently deleted.",
              );
            } catch (error) {
              console.error(
                "Failed to delete Life Currency activity data:",
                error,
              );

              Alert.alert(
                "Delete failed",
                "Your activity data could not be deleted. Please try again.",
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
  }

  return (
    <View className="flex-1 bg-[#080A10]">
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 130,
          }}
        >
          {/* HEADER */}

          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 9,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: COLORS.gold,
                }}
              />

              <Text
                style={{
                  color: COLORS.gold,
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 1.8,
                }}
              >
                LIFE CURRENCY
              </Text>
            </View>

            <Text
              style={{
                color: COLORS.text,
                fontSize: 34,
                lineHeight: 42,
                fontWeight: "600",
                letterSpacing: -1.1,
                marginTop: 15,
              }}
            >
              Settings
            </Text>

            <Text
              style={{
                color: COLORS.muted,
                fontSize: 14,
                lineHeight: 22,
                marginTop: 8,
              }}
            >
              Manage your data and preferences.
            </Text>
          </View>

          {/* DATA & PRIVACY */}

          <SettingsSectionHeader title="DATA & PRIVACY" />

          <View
            style={{
              backgroundColor: COLORS.surface,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <SettingsRow
              icon="export-variant"
              title="Export data"
              description="Save a backup of your activity history."
              onPress={handleExportData}
            />

            <SettingsDivider />

            <SettingsRow
              icon="import"
              title="Import data"
              description="Restore your history from a Life Currency backup."
              onPress={handleImportData}
            />

            <SettingsDivider />

            <SettingsRow
              icon="file-delimited-outline"
              title="Export as CSV"
              description="Open your activity history in spreadsheets."
              onPress={handleExportCsv}
            />
          </View>

          {/* PRIVACY NOTE */}

          <View className="mt-4 flex-row items-start px-1">
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={17}
              color={COLORS.gold}
            />

            <Text className="ml-2 flex-1 text-[12px] leading-[19px] text-[#686C7A]">
              Your activity history is stored on this device. Export a backup
              before deleting the app or changing devices.
            </Text>
          </View>

          {/* DANGER ZONE */}

          <SettingsSectionHeader title="DANGER ZONE" />

          <View
            style={{
              backgroundColor: COLORS.surface,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <SettingsRow
              icon="delete-outline"
              title="Delete all activity data"
              description="Permanently remove your activity history from this device."
              destructive
              onPress={handleDeleteAllData}
            />
          </View>

          {/* ABOUT */}

          <SettingsSectionHeader title="ABOUT" />

          <View
            style={{
              backgroundColor: COLORS.surface,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
              padding: 18,
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 48,
                height: 2,
                backgroundColor: COLORS.gold,
              }}
            />

            <View className="flex-row items-center">
              <View
                style={{
                  width: 42,
                  height: 42,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: COLORS.goldBackground,
                  borderWidth: 1,
                  borderColor: COLORS.goldBorder,
                }}
              >
                <MaterialCommunityIcons
                  name="orbit"
                  size={23}
                  color={COLORS.gold}
                />
              </View>

              <View className="ml-3.5 flex-1">
                <Text className="text-[15px] font-semibold text-[#F5F0E8]">
                  Life Currency
                </Text>

                <Text className="mt-1 text-[12px] text-[#9295A3]">
                  Version {Constants.expoConfig?.version ?? "1.0.0"}
                </Text>
              </View>

              <View
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.goldBorder,
                  backgroundColor: COLORS.goldBackground,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text className="text-[10px] font-semibold text-[#D6AD65]">
                  v1
                </Text>
              </View>
            </View>
          </View>

          {/* FOOTER */}

          <View className="mt-9 items-center">
            <View className="mb-4 h-px w-10 bg-[#403728]" />

            <Text className="text-center text-[12px] italic tracking-[0.3px] text-[#9295A3]">
              Your time is your life currency.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
