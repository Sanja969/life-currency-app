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

type InsightType = "growing" | "restoring" | "leak";

type InsightContent = {
  label: string;
  description: string;
  reflection: string;
  icon: "sparkles-outline" | "leaf-outline" | "compass-outline";
  accent: string;
  iconBackground: string;
  iconBorder: string;
};

function getInsightContent(
  type: InsightType,
  category: string,
  periodLabel: string,
): InsightContent {
  switch (type) {
    case "growing":
      return {
        label: "WHERE YOU'RE GROWING",

        description:
          `You dedicated more Growing time to ${category} ` +
          `than to any other life area over the ${periodLabel}.`,

        reflection: "Does this reflect what matters most to you right now?",

        icon: "sparkles-outline",

        accent: COLORS.growing,

        iconBackground: "#211D35",

        iconBorder: "#383052",
      };

    case "restoring":
      return {
        label: "SPACE FOR RESTORATION",

        description:
          `${category} received the most time you marked ` +
          `as Restoring over the ${periodLabel}.`,

        reflection:
          "Are you making enough space for the kind of rest you value?",

        icon: "leaf-outline",

        accent: COLORS.restoring,

        iconBackground: "#142B2A",

        iconBorder: "#28514B",
      };

    case "leak":
      return {
        label: "WHERE TIME SLIPS AWAY",

        description:
          `${category} accounted for the most time you ` +
          `classified as Life Leaks over the ${periodLabel}.`,

        reflection: "Is this how you want to spend this part of your time?",

        icon: "compass-outline",

        accent: COLORS.leak,

        iconBackground: COLORS.dangerBackground,

        iconBorder: COLORS.dangerBorder,
      };
  }
}

export function ProgressInsights({
  strongestInvestment,
  strongestRestoration,
  biggestLeak,
  period,
}: ProgressInsightsProps) {
  const hasInsights =
    strongestInvestment !== null ||
    strongestRestoration !== null ||
    biggestLeak !== null;

  if (!hasInsights) {
    return null;
  }

  const periodLabel = period === "7days" ? "last 7 days" : "last 30 days";

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionTitle}>YOUR LIFE PATTERNS</Text>
        </View>

        <Text style={styles.sectionDescription}>
          A closer look at where your time has been going.
        </Text>
      </View>

      {/* INSIGHT CARDS */}

      <View style={styles.insights}>
        {strongestInvestment && (
          <InsightCard
            type="growing"
            category={
              getActivityCategoryMeta(strongestInvestment.category).label
            }
            duration={formatDuration(strongestInvestment.growingMinutes)}
            periodLabel={periodLabel}
          />
        )}

        {strongestRestoration && (
          <InsightCard
            type="restoring"
            category={
              getActivityCategoryMeta(strongestRestoration.category).label
            }
            duration={formatDuration(strongestRestoration.restoringMinutes)}
            periodLabel={periodLabel}
          />
        )}

        {biggestLeak && (
          <InsightCard
            type="leak"
            category={getActivityCategoryMeta(biggestLeak.category).label}
            duration={formatDuration(biggestLeak.leakMinutes)}
            periodLabel={periodLabel}
          />
        )}
      </View>

      {/* CLOSING REFLECTION */}

      <View style={styles.closingReflection}>
        <Ionicons name="sparkles-outline" size={16} color={COLORS.gold} />

        <Text style={styles.closingText}>
          Awareness is the first step toward living more intentionally.
        </Text>
      </View>
    </View>
  );
}

type InsightCardProps = {
  type: InsightType;
  category: string;
  duration: string;
  periodLabel: string;
};

function InsightCard({
  type,
  category,
  duration,
  periodLabel,
}: InsightCardProps) {
  const content = getInsightContent(type, category, periodLabel);

  return (
    <View style={styles.insightCard}>
      {/* CLASSIFICATION ACCENT */}

      <View style={[styles.topAccent, { backgroundColor: content.accent }]} />

      {/* MAIN INFORMATION */}

      <View style={styles.insightHeader}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: content.iconBackground,
              borderColor: content.iconBorder,
            },
          ]}
        >
          <Ionicons name={content.icon} size={21} color={content.accent} />
        </View>

        <View style={styles.insightInfo}>
          <Text style={[styles.insightLabel, { color: content.accent }]}>
            {content.label}
          </Text>

          <Text style={styles.categoryName} numberOfLines={2}>
            {category}
          </Text>
        </View>

        <Text style={[styles.duration, { color: content.accent }]}>
          {duration}
        </Text>
      </View>

      {/* DATA-BASED DESCRIPTION */}

      <Text style={styles.description}>{content.description}</Text>

      {/* PERSONAL REFLECTION */}

      <View style={styles.reflectionContainer}>
        <View
          style={[styles.reflectionAccent, { backgroundColor: content.accent }]}
        />

        <Text style={styles.reflectionText}>{content.reflection}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },

  /*
   * SECTION HEADER
   */

  header: {
    marginBottom: 17,
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
    lineHeight: 19,
    marginTop: 8,
  },

  /*
   * INSIGHTS
   */

  insights: {
    gap: 12,
  },

  insightCard: {
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

  /*
   * CARD HEADER
   */

  insightHeader: {
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

  insightInfo: {
    flex: 1,
    marginLeft: 13,
    minWidth: 0,
  },

  insightLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    lineHeight: 15,
  },

  categoryName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 7,
  },

  duration: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
    flexShrink: 0,
  },

  /*
   * DESCRIPTION
   */

  description: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 17,
  },

  /*
   * REFLECTION
   */

  reflectionContainer: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  reflectionAccent: {
    width: 2,
    height: 28,
    marginTop: 2,
    opacity: 0.75,
  },

  reflectionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 19,
    fontStyle: "italic",
    opacity: 0.85,
  },

  /*
   * CLOSING REFLECTION
   */

  closingReflection: {
    marginTop: 22,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 10,
  },

  closingText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    fontStyle: "italic",
  },
});
