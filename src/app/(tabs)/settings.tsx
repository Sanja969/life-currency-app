import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRef } from "react";
import { Pressable, ScrollView, Text, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dataBackupService } from "@/services/DataBackupService";
import { activityService } from "@/services/ActivityService";

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
  const color = destructive ? "#E657A8" : "#8FA3FF";

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4"
      style={({ pressed }) => ({
        opacity: pressed ? 0.65 : 1,
      })}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{
          backgroundColor: destructive
            ? "rgba(230, 87, 168, 0.08)"
            : "rgba(113, 139, 255, 0.08)",
        }}
      >
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>

      <View className="ml-4 flex-1">
        <Text
          className="text-[15px] font-semibold"
          style={{
            color: destructive ? "#F38DC7" : "#E9EDFA",
          }}
        >
          {title}
        </Text>

        <Text className="mt-1 text-[12px] leading-[17px] text-[#697791]">
          {description}
        </Text>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={21} color="#46516A" />
    </Pressable>
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
      console.error("Failed to export Life Currency data:", error);

      Alert.alert(
        "Export failed",
        "Your Life Currency data could not be exported. Please try again.",
      );
    } finally {
      finishOperation();
    }
  }

  async function handleImportData() {
    if (!startOperation()) return;
    try {
      const activities = await dataBackupService.pickBackup();

      if (!activities) {
        return;
      }

      Alert.alert(
        "Restore backup?",
        `This backup contains ${activities.length} ${
          activities.length === 1 ? "activity" : "activities"
        }.\n\nRestoring it will replace all activity data currently stored on this device.`,
        [
          {
            text: "Cancel",
            style: "cancel",
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
                  "Your existing activity data was not changed.",
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error("Failed to read Life Currency backup:", error);

      Alert.alert(
        "Invalid backup",
        "The selected file is not a valid Life Currency backup.",
      );
    } finally {
      finishOperation();
    }
  }

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
      { cancelable: false }
    );
  }

  return (
    <View className="flex-1 bg-[#030611]">
      {/* QUANTUM BACKGROUND */}
      <View
        pointerEvents="none"
        className="absolute -right-32 top-[-80px] h-[320px] w-[320px] rounded-full bg-[#536DFF]"
        style={{ opacity: 0.055 }}
      />

      <View
        pointerEvents="none"
        className="absolute -left-40 top-[440px] h-[330px] w-[330px] rounded-full bg-[#E657A8]"
        style={{ opacity: 0.02 }}
      />

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
          <Text className="text-[11px] font-bold tracking-[2px] text-[#718BFF]">
            LIFE CURRENCY
          </Text>

          <Text className="mt-2 text-[30px] font-bold text-[#F2F4FC]">
            Settings
          </Text>

          <Text className="mt-2 text-[14px] leading-[21px] text-[#74819B]">
            Manage your Life Currency data and preferences.
          </Text>

          {/* DATA & PRIVACY */}
          <Text className="mb-3 mt-9 text-[11px] font-bold tracking-[1.5px] text-[#66738D]">
            DATA & PRIVACY
          </Text>

          <View
            className="overflow-hidden rounded-[22px] border"
            style={{
              backgroundColor: "rgba(11, 17, 34, 0.72)",
              borderColor: "rgba(95, 112, 160, 0.16)",
            }}
          >
            <SettingsRow
              icon="export-variant"
              title="Export data"
              description="Save a backup of your activity history."
              onPress={handleExportData}
            />

            <View className="ml-[68px] h-px bg-[#1A2235]" />

            <SettingsRow
              icon="import"
              title="Import data"
              description="Restore your history from a Life Currency backup."
              onPress={handleImportData}
            />

            <View className="ml-[68px] h-px bg-[#1A2235]" />

            <SettingsRow
              icon="file-delimited-outline"
              title="Export as CSV"
              description="Open your activity history in spreadsheets."
              onPress={handleExportCsv}
            />

            <View className="ml-[68px] h-px bg-[#1A2235]" />

            <SettingsRow
              icon="delete-outline"
              title="Delete all activity data"
              description="Permanently remove your activity history from this device."
              destructive
              onPress={handleDeleteAllData}
            />
          </View>

          <Text className="mt-3 px-2 text-[12px] leading-[18px] text-[#56627A]">
            Your activity history is stored on this device. Export a backup
            before deleting the app or changing devices.
          </Text>

          {/* ABOUT */}
          <Text className="mb-3 mt-9 text-[11px] font-bold tracking-[1.5px] text-[#66738D]">
            ABOUT
          </Text>

          <View
            className="rounded-[22px] border px-4 py-4"
            style={{
              backgroundColor: "rgba(11, 17, 34, 0.72)",
              borderColor: "rgba(95, 112, 160, 0.16)",
            }}
          >
            <View className="flex-row items-center">
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: "rgba(113, 139, 255, 0.08)",
                }}
              >
                <MaterialCommunityIcons
                  name="orbit"
                  size={21}
                  color="#8FA3FF"
                />
              </View>

              <View className="ml-4">
                <Text className="text-[15px] font-semibold text-[#E9EDFA]">
                  Life Currency
                </Text>

                <Text className="mt-1 text-[12px] text-[#697791]">
                  Version 1.0.0
                </Text>
              </View>
            </View>
          </View>

          <Text className="mt-7 text-center text-[11px] leading-[17px] text-[#46516A]">
            Your time is your life currency.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
