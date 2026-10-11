import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { AppButton } from "@/components/ui/AppButton";
import { DeleteActivityModal } from "@/features/activities/components/DeleteActivityModal";
import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { activityService } from "@/services/ActivityService";
import { Activity, ActivityClassification } from "@/types/activity";

const COLORS = {
  background: "#080A10",
  surface: "#11141D",
  gold: "#D6AD65",
  lightGold: "#F3D49B",
  text: "#F5F0E7",
  muted: "#9295A5",
  growing: "#8274E8",
  leak: "#D88455",
  danger: "#E78A8A",
};

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}m`;
}

type AngularCardProps = {
  children: ReactNode;
  borderColor?: string;
  backgroundColor?: string;
  cut?: number;
  style?: object;
};

function AngularCard({
  children,
  borderColor = "rgba(214,173,101,0.22)",
  backgroundColor = COLORS.surface,
  cut = 14,
  style,
}: AngularCardProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;

    setSize((previous) => {
      if (
        Math.abs(previous.width - width) < 0.5 &&
        Math.abs(previous.height - height) < 0.5
      ) {
        return previous;
      }

      return { width, height };
    });
  }

  const path = `
    M ${cut} 0
    L ${size.width} 0
    L ${size.width} ${size.height - cut}
    L ${size.width - cut} ${size.height}
    L 0 ${size.height}
    L 0 ${cut}
    Z
  `;

  return (
    <View onLayout={handleLayout} style={style}>
      {size.width > 0 && size.height > 0 && (
        <Svg
          pointerEvents="none"
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={path}
            fill={backgroundColor}
            stroke={borderColor}
            strokeWidth={1}
          />
        </Svg>
      )}

      {children}
    </View>
  );
}

type DetailRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  accent: string;
  showDivider?: boolean;
};

function DetailRow({
  icon,
  label,
  value,
  accent,
  showDivider = true,
}: DetailRowProps) {
  return (
    <>
      <View style={styles.detailRow}>
        <View style={styles.detailIcon}>
          <Ionicons name={icon} size={19} color={accent} />
        </View>

        <View style={styles.detailText}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{value}</Text>
        </View>
      </View>

      {showDivider && <View style={styles.divider} />}
    </>
  );
}

export default function ActivityDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = normalizeParam(params.id);

  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const loadActivity = useCallback(async () => {
    const numericId = Number(id);

    if (!id || !Number.isSafeInteger(numericId) || numericId <= 0) {
      setActivity(null);
      setErrorMessage("Activity id is invalid.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const foundActivity = await activityService.getActivityById(numericId);

      if (!foundActivity) {
        setActivity(null);
        setErrorMessage("Activity could not be found.");
        return;
      }

      setActivity(foundActivity);
    } catch (error) {
      setActivity(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load activity.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadActivity();
    }, [loadActivity]),
  );

  function handleEdit() {
    if (!activity) return;

    router.push(`/activities/${activity.id}/edit`);
  }

  function handleDelete() {
    if (!activity || isDeleting) return;

    setIsDeleteModalVisible(true);
  }

  async function deleteActivity() {
    if (!activity || isDeleting) return;

    try {
      setIsDeleting(true);

      await activityService.deleteActivity(activity.id);

      setIsDeleteModalVisible(false);
      router.replace("/activities");
    } catch (error) {
      setIsDeleting(false);

      Alert.alert(
        "Could not delete activity",
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting this activity.",
      );
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    );
  }

  if (!activity || errorMessage) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View style={styles.header}>
            <AppButton
              variant="icon"
              tone="secondary"
              icon="chevron-back"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
            />
          </View>

          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={36}
              color={COLORS.danger}
            />

            <Text style={styles.errorTitle}>Activity unavailable</Text>

            <Text style={styles.errorDescription}>
              {errorMessage ?? "This activity could not be found."}
            </Text>

            <AppButton
              variant="secondary"
              onPress={() => router.replace("/activities")}
            >
              Back to activities
            </AppButton>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const serves = activity.classification === ActivityClassification.Serves;
  const accent = serves ? COLORS.growing : COLORS.leak;
  const categoryMeta = getActivityCategoryMeta(activity.category);

  const formattedDate = activity.activityDate.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = activity.activityDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* HEADER */}

        <View style={styles.header}>
          <AppButton
            variant="icon"
            tone="secondary"
            icon="chevron-back"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          />

          <Text style={styles.headerTitle}>LIFE TRACE</Text>

          <Pressable
            onPress={handleEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit activity"
            hitSlop={10}
            style={({ pressed }) => [
              styles.headerEdit,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="pencil-outline" size={19} color={COLORS.gold} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ACTIVITY TITLE */}

          <View style={styles.titleSection}>
            <View style={styles.classificationRow}>
              <View
                style={[styles.classificationDot, { backgroundColor: accent }]}
              />

              <Text style={[styles.classificationText, { color: accent }]}>
                {serves ? "GROWING" : "LIFE LEAK"}
              </Text>
            </View>

            <Text style={styles.activityTitle}>{activity.title}</Text>

            <View style={styles.categoryRow}>
              <Ionicons
                name={categoryMeta.icon}
                size={16}
                color={COLORS.gold}
              />

              <Text style={styles.categoryText}>
                {categoryMeta.label.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* ENERGY CORE */}

          <AngularCard
            style={styles.energyCard}
            borderColor={`${accent}80`}
            backgroundColor={serves ? "#171527" : "#241A16"}
            cut={18}
          >
            <View style={styles.energyContent}>
              <Svg width={108} height={108} viewBox="0 0 108 108">
                <Circle
                  cx={54}
                  cy={54}
                  r={46}
                  fill="none"
                  stroke={accent}
                  strokeOpacity={0.2}
                  strokeWidth={1}
                />

                <Circle
                  cx={54}
                  cy={54}
                  r={35}
                  fill="none"
                  stroke={accent}
                  strokeOpacity={0.5}
                  strokeWidth={1}
                />

                <Circle
                  cx={54}
                  cy={54}
                  r={23}
                  fill={accent}
                  fillOpacity={0.16}
                />

                <Circle cx={54} cy={54} r={12} fill={accent} />

                <Circle cx={54} cy={54} r={4} fill={COLORS.text} />
              </Svg>

              <Text style={styles.energyDuration}>
                {formatDuration(activity.durationMinutes)}
              </Text>

              <Text style={[styles.energyLabel, { color: accent }]}>
                {serves ? "INVESTED IN GROWTH" : "SPENT ON A LIFE LEAK"}
              </Text>

              <Text style={styles.energyDescription}>
                {serves
                  ? "Time dedicated to something that helps you grow."
                  : "Time spent on something you've marked as draining."}
              </Text>
            </View>
          </AngularCard>

          {/* TRACE DETAILS */}

          <Text style={styles.sectionEyebrow}>TRACE DETAILS</Text>

          <AngularCard style={styles.detailsCard}>
            <View style={styles.detailsContent}>
              <DetailRow
                icon="hourglass-outline"
                label="Duration"
                value={formatDuration(activity.durationMinutes)}
                accent={accent}
              />

              <DetailRow
                icon="calendar-outline"
                label="Date"
                value={formattedDate}
                accent={accent}
              />

              <DetailRow
                icon="time-outline"
                label="Time"
                value={formattedTime}
                accent={accent}
                showDivider={false}
              />
            </View>
          </AngularCard>

          {/* PERSONAL NOTE */}

          {activity.description?.trim() ? (
            <>
              <Text style={styles.sectionEyebrow}>PERSONAL NOTE</Text>

              <AngularCard style={styles.noteCard}>
                <Text style={styles.noteText}>{activity.description}</Text>
              </AngularCard>
            </>
          ) : null}

          {/* ACTIONS */}

          <Text style={styles.sectionEyebrow}>MANAGE TRACE</Text>

          <AppButton variant="primary" onPress={handleEdit}>
            Edit activity
          </AppButton>

          <Pressable
            disabled={isDeleting}
            onPress={handleDelete}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.deleteButton,
              { opacity: isDeleting ? 0.5 : pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="trash-outline" size={17} color={COLORS.danger} />

            <Text style={styles.deleteText}>Delete activity</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <DeleteActivityModal
        visible={isDeleteModalVisible}
        activityTitle={activity.title}
        isDeleting={isDeleting}
        onCancel={() => {
          if (!isDeleting) setIsDeleteModalVisible(false);
        }}
        onDelete={() => {
          void deleteActivity();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  centeredScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 14,
    color: COLORS.muted,
    fontSize: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },

  headerTitle: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  headerEdit: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.22)",
    backgroundColor: COLORS.surface,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 70,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    gap: 14,
  },

  errorTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "600",
  },

  errorDescription: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },

  titleSection: {
    gap: 12,
    marginBottom: 26,
  },

  classificationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  classificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  classificationText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  activityTitle: {
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "600",
    letterSpacing: -1.1,
  },

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  categoryText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  energyCard: {
    minHeight: 230,
    justifyContent: "center",
  },

  energyContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  energyDuration: {
    color: COLORS.text,
    fontSize: 29,
    fontWeight: "600",
    letterSpacing: -0.8,
    marginTop: 8,
  },

  energyLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginTop: 7,
  },

  energyDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 10,
  },

  sectionEyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginTop: 28,
    marginBottom: 13,
  },

  detailsCard: {
    width: "100%",
  },

  detailsContent: {
    paddingHorizontal: 18,
    paddingVertical: 4,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    gap: 14,
  },

  detailIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  detailText: {
    flex: 1,
    gap: 4,
  },

  detailLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },

  detailValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    marginLeft: 50,
    backgroundColor: "rgba(214,173,101,0.1)",
  },

  noteCard: {
    padding: 18,
  },

  noteText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 23,
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 17,
    marginTop: 12,
  },

  deleteText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "600",
  },
});
