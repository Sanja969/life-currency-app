import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";
import { COLORS } from "@/theme/colors";
import { formatDuration } from "@/utils/formatDuration";

import type {
  ProgressCategoryStat,
  ProgressPeriod,
} from "../hooks/useProgress";

type ProgressInsightsProps = {
  strongestInvestment: ProgressCategoryStat | null;
  strongestRestoration: ProgressCategoryStat | null;
  biggestLeak: ProgressCategoryStat | null;
  period: ProgressPeriod;
};

export function ProgressInsights({
  strongestInvestment,
  strongestRestoration,
  biggestLeak,
  period,
}: ProgressInsightsProps) {
  if (!strongestInvestment && !strongestRestoration && !biggestLeak) {
    return null;
  }

  const periodLabel = period === "7days" ? "last 7 days" : "last 30 days";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionTitle}>CURRENT SIGNALS</Text>
        </View>

        <Text style={styles.sectionDescription}>
          What stands out in this period
        </Text>
      </View>

      <View style={styles.signals}>
        {strongestInvestment && (
          <SignalCard
            label="STRONGEST INVESTMENT"
            category={
              getActivityCategoryMeta(strongestInvestment.category).label
            }
            duration={formatDuration(strongestInvestment.growingMinutes)}
            description={`Most Growing time in the ${periodLabel}.`}
            icon="trending-up-outline"
            accent={COLORS.growing}
            iconBackground="#211D35"
            iconBorder="#383052"
          />
        )}

        {strongestRestoration && (
          <SignalCard
            label="MOST RESTORING TIME"
            category={
              getActivityCategoryMeta(strongestRestoration.category).label
            }
            duration={formatDuration(strongestRestoration.restoringMinutes)}
            description={`Most Restoring time in the ${periodLabel}.`}
            icon="leaf-outline"
            accent={COLORS.restoring}
            iconBackground="#142B2A"
            iconBorder="#28514B"
          />
        )}

        {biggestLeak && (
          <SignalCard
            label="BIGGEST LEAK"
            category={getActivityCategoryMeta(biggestLeak.category).label}
            duration={formatDuration(biggestLeak.leakMinutes)}
            description={`Most Life Leak time in the ${periodLabel}.`}
            icon="trending-down-outline"
            accent={COLORS.leak}
            iconBackground={COLORS.dangerBackground}
            iconBorder={COLORS.dangerBorder}
          />
        )}
      </View>
    </View>
  );
}

type SignalCardProps = {
  label: string;
  category: string;
  duration: string;
  description: string;
  icon: "trending-up-outline" | "trending-down-outline" | "leaf-outline";
  accent: string;
  iconBackground: string;
  iconBorder: string;
};

function SignalCard({
  label,
  category,
  duration,
  description,
  icon,
  accent,
  iconBackground,
  iconBorder,
}: SignalCardProps) {
  return (
    <View style={styles.signalCard}>
      <View style={[styles.topAccent, { backgroundColor: accent }]} />

      <View style={styles.signalHeader}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: iconBackground,
              borderColor: iconBorder,
            },
          ]}
        >
          <Ionicons name={icon} size={21} color={accent} />
        </View>

        <View style={styles.signalInfo}>
          <Text style={[styles.signalLabel, { color: accent }]}>{label}</Text>

          <Text style={styles.categoryName}>{category}</Text>
        </View>

        <Text style={[styles.duration, { color: accent }]}>{duration}</Text>
      </View>

      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },

  header: {
    marginBottom: 15,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
  },

  sectionTitle: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  sectionDescription: {
    color: COLORS.subtle,
    fontSize: 12,
    marginTop: 8,
  },

  signals: {
    gap: 12,
  },

  signalCard: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: 18,
    position: "relative",
  },

  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 48,
    height: 2,
  },

  signalHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  signalInfo: {
    flex: 1,
    marginLeft: 13,
    minWidth: 0,
  },

  signalLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
  },

  categoryName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 7,
  },

  duration: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },

  description: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
    marginLeft: 55,
  },
});
