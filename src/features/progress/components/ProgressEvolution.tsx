import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { CosmicPanel } from "@/components/ui/CosmicPanel";
import { getActivityCategoryMeta } from "@/features/activities/utils/activityCategory";

import { COLORS } from "@/theme/colors";
import { formatDuration } from "@/utils/formatDuration";

import type {
  ProgressCategoryTrend,
  ProgressComparison,
  ProgressPeriod,
  ProgressStatistics,
} from "../hooks/useProgress";

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

type ProgressEvolutionProps = {
  statistics: ProgressStatistics;
  comparison: ProgressComparison;
  trends: ProgressCategoryTrend[];
  period: ProgressPeriod;
};

type ComparisonRowData = {
  key: string;
  label: string;
  color: string;

  previousMinutes: number;
  currentMinutes: number;

  previousPercent: number;
  currentPercent: number;
};

type ShiftSignal = "growing" | "restoring" | "leak";

type EvolutionShift = {
  key: string;
  categoryLabel: string;
  signal: ShiftSignal;
  changeMinutes: number;
};

// -----------------------------------------------------------------------------
// PERIOD LABELS
// -----------------------------------------------------------------------------

const COMPARISON_LABELS: Record<ProgressPeriod, string> = {
  thisWeek: "Compared with the same elapsed time last week",
  lastWeek: "Compared with the week before",
  thisMonth: "Compared with the same period last month",
  lastMonth: "Compared with the month before",
};

const PERIOD_COLUMNS: Record<
  ProgressPeriod,
  {
    previous: string;
    current: string;
  }
> = {
  thisWeek: {
    previous: "LAST WEEK",
    current: "THIS WEEK",
  },

  lastWeek: {
    previous: "WEEK BEFORE",
    current: "LAST WEEK",
  },

  thisMonth: {
    previous: "LAST MONTH",
    current: "THIS MONTH",
  },

  lastMonth: {
    previous: "MONTH BEFORE",
    current: "LAST MONTH",
  },
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;

  return `${rounded}%`;
}

function formatSignedDuration(value: number): string {
  if (value === 0) {
    return "No change";
  }

  const sign = value > 0 ? "+" : "−";

  return `${sign}${formatDuration(Math.abs(value))}`;
}

function getChangeIcon(
  value: number,
): React.ComponentProps<typeof Ionicons>["name"] {
  if (value > 0) {
    return "arrow-up-outline";
  }

  if (value < 0) {
    return "arrow-down-outline";
  }

  return "remove-outline";
}

// -----------------------------------------------------------------------------
// BUILD COMPARISON ROWS
// -----------------------------------------------------------------------------

function buildComparisonRows(
  statistics: ProgressStatistics,
  comparison: ProgressComparison,
): ComparisonRowData[] {
  return [
    {
      key: "growing",
      label: "Growing",
      color: COLORS.growing,

      previousMinutes: comparison.previousGrowingMinutes,
      currentMinutes: statistics.growingMinutes,

      previousPercent: comparison.previousGrowingPercent,
      currentPercent: statistics.growingPercent,
    },

    {
      key: "restoring",
      label: "Restoring",
      color: COLORS.restoring,

      previousMinutes: comparison.previousRestoringMinutes,
      currentMinutes: statistics.restoringMinutes,

      previousPercent: comparison.previousRestoringPercent,
      currentPercent: statistics.restoringPercent,
    },

    {
      key: "leaks",
      label: "Life Leaks",
      color: COLORS.leak,

      previousMinutes: comparison.previousLeakMinutes,
      currentMinutes: statistics.leakMinutes,

      previousPercent: comparison.previousLeakPercent,
      currentPercent: statistics.leakPercent,
    },
  ];
}

// -----------------------------------------------------------------------------
// BUILD NOTABLE SHIFTS
// -----------------------------------------------------------------------------

function buildEvolutionShifts(
  trends: ProgressCategoryTrend[],
): EvolutionShift[] {
  const candidates: EvolutionShift[] = [];

  for (const trend of trends) {
    const categoryLabel = getActivityCategoryMeta(trend.category).label;

    const changes: {
      signal: ShiftSignal;
      minutes: number;
    }[] = [
      {
        signal: "growing",
        minutes: trend.growingMinutesChange,
      },
      {
        signal: "restoring",
        minutes: trend.restoringMinutesChange,
      },
      {
        signal: "leak",
        minutes: trend.leakMinutesChange,
      },
    ];

    for (const change of changes) {
      if (change.minutes === 0) {
        continue;
      }

      candidates.push({
        key: `${trend.category}-${change.signal}`,
        categoryLabel,
        signal: change.signal,
        changeMinutes: change.minutes,
      });
    }
  }

  return candidates
    .sort((a, b) => Math.abs(b.changeMinutes) - Math.abs(a.changeMinutes))
    .slice(0, 3);
}

function getShiftAppearance(signal: ShiftSignal): {
  label: string;
  color: string;
} {
  switch (signal) {
    case "growing":
      return {
        label: "Growing",
        color: COLORS.growing,
      };

    case "restoring":
      return {
        label: "Restoring",
        color: COLORS.restoring,
      };

    case "leak":
      return {
        label: "Life Leaks",
        color: COLORS.leak,
      };
  }
}

// -----------------------------------------------------------------------------
// RECORDED TIME COMPARISON
// -----------------------------------------------------------------------------

function RecordedTimeComparison({
  previousMinutes,
  currentMinutes,
}: {
  previousMinutes: number;
  currentMinutes: number;
}) {
  const difference = currentMinutes - previousMinutes;

  return (
    <View style={styles.recordedTimeContainer}>
      <View style={styles.recordedTimeHeader}>
        <Ionicons name="time-outline" size={15} color={COLORS.gold} />

        <Text style={styles.recordedTimeTitle}>RECORDED TIME</Text>
      </View>

      <View style={styles.recordedTimeValues}>
        <View style={styles.recordedTimeColumn}>
          <Text style={styles.recordedTimeValuePrevious}>
            {formatDuration(previousMinutes)}
          </Text>
        </View>

        <Ionicons
          name="arrow-forward-outline"
          size={17}
          color={COLORS.subtle}
        />

        <View style={styles.recordedTimeColumn}>
          <Text style={styles.recordedTimeValueCurrent}>
            {formatDuration(currentMinutes)}
          </Text>
        </View>
      </View>

      <View style={styles.recordedTimeChange}>
        <Ionicons
          name={getChangeIcon(difference)}
          size={13}
          color={COLORS.gold}
        />

        <Text style={styles.recordedTimeChangeText}>
          {formatSignedDuration(difference)} recorded
        </Text>
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// COMPARISON ROW
// -----------------------------------------------------------------------------

function ComparisonRow({ row }: { row: ComparisonRowData }) {
  const difference = row.currentMinutes - row.previousMinutes;

  return (
    <View style={styles.comparisonRow}>
      <View style={styles.comparisonLabelContainer}>
        <View
          style={[
            styles.classificationDot,
            {
              backgroundColor: row.color,
            },
          ]}
        />

        <Text style={styles.comparisonLabel}>{row.label}</Text>
      </View>

      <View style={styles.comparisonPrevious}>
        <Text style={styles.previousPercent}>
          {formatPercent(row.previousPercent)}
        </Text>

        <Text style={styles.previousDuration}>
          {formatDuration(row.previousMinutes)}
        </Text>
      </View>

      <View style={styles.comparisonCurrent}>
        <Text
          style={[
            styles.currentPercent,
            {
              color: row.color,
            },
          ]}
        >
          {formatPercent(row.currentPercent)}
        </Text>

        <View style={styles.currentDurationRow}>
          <Ionicons
            name={getChangeIcon(difference)}
            size={11}
            color={row.color}
          />

          <Text style={styles.currentDuration}>
            {formatDuration(row.currentMinutes)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// NOTABLE SHIFT ROW
// -----------------------------------------------------------------------------

function ShiftRow({ shift }: { shift: EvolutionShift }) {
  const appearance = getShiftAppearance(shift.signal);

  const difference = shift.changeMinutes;

  return (
    <View style={styles.shiftRow}>
      <View
        style={[
          styles.shiftDotOuter,
          {
            borderColor: appearance.color,
          },
        ]}
      >
        <View
          style={[
            styles.shiftDotInner,
            {
              backgroundColor: appearance.color,
            },
          ]}
        />
      </View>

      <View style={styles.shiftInfo}>
        <Text style={styles.shiftCategory} numberOfLines={1}>
          {shift.categoryLabel}
        </Text>

        <Text
          style={[
            styles.shiftClassification,
            {
              color: appearance.color,
            },
          ]}
        >
          {appearance.label}
        </Text>
      </View>

      <View style={styles.shiftValueRow}>
        <Ionicons
          name={getChangeIcon(difference)}
          size={14}
          color={appearance.color}
        />

        <Text
          style={[
            styles.shiftValue,
            {
              color: appearance.color,
            },
          ]}
        >
          {formatSignedDuration(difference)}
        </Text>
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// AUTOMATIC INSIGHT
// -----------------------------------------------------------------------------

function buildEvolutionInsight(
  statistics: ProgressStatistics,
  comparison: ProgressComparison,
  trends: ProgressCategoryTrend[],
): {
  title: string;
  message: string;
  question?: string;
} {
  const currentTotal = statistics.totalMinutes;
  const previousTotal = comparison.previousTotalMinutes;

  // Avoid drawing strong conclusions from very little recorded time.
  const MIN_RECORDED_MINUTES = 60;

  if (
    currentTotal < MIN_RECORDED_MINUTES ||
    previousTotal < MIN_RECORDED_MINUTES
  ) {
    return {
      title: "You're building your history",
      message:
        "Keep recording your activities to make comparisons more meaningful.",
    };
  }

  // Find the largest absolute change within a life category.
  const candidates: {
    category: string;
    classification: "Growing" | "Restoring" | "Life Leaks";
    changeMinutes: number;
  }[] = [];

  for (const trend of trends) {
    const category = getActivityCategoryMeta(trend.category).label;

    if (trend.growingMinutesChange !== 0) {
      candidates.push({
        category,
        classification: "Growing",
        changeMinutes: trend.growingMinutesChange,
      });
    }

    if (trend.restoringMinutesChange !== 0) {
      candidates.push({
        category,
        classification: "Restoring",
        changeMinutes: trend.restoringMinutesChange,
      });
    }

    if (trend.leakMinutesChange !== 0) {
      candidates.push({
        category,
        classification: "Life Leaks",
        changeMinutes: trend.leakMinutesChange,
      });
    }
  }

  candidates.sort(
    (a, b) => Math.abs(b.changeMinutes) - Math.abs(a.changeMinutes),
  );

  const biggestShift = candidates[0];

  if (!biggestShift) {
    return {
      title: "A consistent rhythm",
      message:
        "Your recorded activities remained relatively consistent across these periods.",
      question: "What helped you maintain this rhythm?",
    };
  }

  const increased = biggestShift.changeMinutes > 0;

  const duration = formatDuration(Math.abs(biggestShift.changeMinutes));

  const direction = increased ? "more" : "less";

  const classificationDescription =
    biggestShift.classification === "Growing"
      ? "activities that support your growth"
      : biggestShift.classification === "Restoring"
        ? "activities that help you recharge"
        : "activities you classified as Life Leaks";

  const message =
    `You recorded ${duration} ${direction} in ` +
    `${biggestShift.category} for ${classificationDescription} ` +
    `compared with the previous period.`;

  return {
    title: "Your biggest shift",
    message,
    question: "What changed in your routine?",
  };
}

function EvolutionInsight({
  statistics,
  comparison,
  trends,
}: {
  statistics: ProgressStatistics;
  comparison: ProgressComparison;
  trends: ProgressCategoryTrend[];
}) {
  const insight = buildEvolutionInsight(statistics, comparison, trends);

  return (
    <View style={styles.insightContainer}>
      <View style={styles.insightHeader}>
        <Ionicons name="sparkles-outline" size={15} color={COLORS.gold} />

        <Text style={styles.insightTitle}>{insight.title.toUpperCase()}</Text>
      </View>

      <Text style={styles.insightText}>{insight.message}</Text>

      {insight.question && (
        <Text style={styles.insightQuestion}>{insight.question}</Text>
      )}
    </View>
  );
}

// -----------------------------------------------------------------------------
// EMPTY STATE
// -----------------------------------------------------------------------------

function EvolutionEmptyState() {
  return (
    <CosmicPanel
      variant="default"
      accent={COLORS.gold}
      contentStyle={styles.emptyPanel}
    >
      <View style={styles.emptyIconCircle}>
        <Ionicons name="sparkles-outline" size={22} color={COLORS.gold} />
      </View>

      <Text style={styles.emptyTitle}>Your evolution begins here</Text>

      <Text style={styles.emptyDescription}>
        No activities were recorded in the comparison period. Once both periods
        have data, your evolution will appear here.
      </Text>

      <View style={styles.emptyTimeline}>
        <View style={styles.emptyTimelineLine} />

        <View style={styles.emptyTimelineDot} />

        <View
          style={[styles.emptyTimelineDot, styles.emptyTimelineDotFuture]}
        />
      </View>
    </CosmicPanel>
  );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function ProgressEvolution({
  statistics,
  comparison,
  trends,
  period,
}: ProgressEvolutionProps) {
  const hasPreviousData = comparison.previousTotalMinutes > 0;

  const rows = buildComparisonRows(statistics, comparison);

  const shifts = buildEvolutionShifts(trends);

  const columnLabels = PERIOD_COLUMNS[period];

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}

      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.goldDot} />

          <Text style={styles.sectionLabel}>YOUR EVOLUTION</Text>
        </View>

        <Text style={styles.sectionDescription}>
          {COMPARISON_LABELS[period]}
        </Text>
      </View>

      {!hasPreviousData ? (
        <EvolutionEmptyState />
      ) : (
        <CosmicPanel
          variant="default"
          accent={COLORS.gold}
          contentStyle={styles.panelContent}
        >
          {/* HEADER */}

          <View style={styles.panelHeader}>
            <Ionicons
              name="git-compare-outline"
              size={17}
              color={COLORS.gold}
            />

            <Text style={styles.panelTitle}>TIME COMPARISON</Text>
          </View>

          {/* COLUMN LABELS */}

          <View style={styles.columnHeader}>
            <View style={styles.columnHeaderSpacer} />

            <Text style={styles.columnHeaderLabel}>
              {columnLabels.previous}
            </Text>

            <Text
              style={[styles.columnHeaderLabel, styles.columnHeaderCurrent]}
            >
              {columnLabels.current}
            </Text>
          </View>

          {/* RECORDED TIME */}

          <RecordedTimeComparison
            previousMinutes={comparison.previousTotalMinutes}
            currentMinutes={statistics.totalMinutes}
          />

          {/* CLASSIFICATION COMPARISON */}

          <View style={styles.comparisonRows}>
            {rows.map((row, index) => (
              <View key={row.key}>
                <ComparisonRow row={row} />

                {index < rows.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </View>

          {/* NOTABLE SHIFTS */}

          {shifts.length > 0 && (
            <>
              <View style={styles.sectionDivider} />

              <View style={styles.shiftsHeader}>
                <Ionicons
                  name="git-compare-outline"
                  size={16}
                  color={COLORS.gold}
                />

                <Text style={styles.panelTitle}>NOTABLE SHIFTS</Text>
              </View>

              <View style={styles.shiftsList}>
                {shifts.map((shift) => (
                  <ShiftRow key={shift.key} shift={shift} />
                ))}
              </View>
            </>
          )}

          {/* INSIGHT */}

          <EvolutionInsight
            statistics={statistics}
            comparison={comparison}
            trends={trends}
          />

          {/* FOOTER */}

          <Text style={styles.footerNote}>
            Percentages show each classification's share of recorded time.
            Durations show actual time spent.
          </Text>
        </CosmicPanel>
      )}
    </View>
  );
}

// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  goldDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
  },

  sectionLabel: {
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

  panelContent: {
    padding: 0,
  },

  // ---------------------------------------------------------------------------
  // HEADER
  // ---------------------------------------------------------------------------

  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 21,
    paddingBottom: 14,
  },

  panelTitle: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  columnHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 9,
  },

  columnHeaderSpacer: {
    flex: 1,
  },

  columnHeaderLabel: {
    width: 79,
    color: COLORS.subtle,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.6,
    textAlign: "center",
  },

  columnHeaderCurrent: {
    color: COLORS.gold,
  },

  // ---------------------------------------------------------------------------
  // RECORDED TIME
  // ---------------------------------------------------------------------------

  recordedTimeContainer: {
    marginHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },

  recordedTimeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  recordedTimeTitle: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.9,
  },

  recordedTimeValues: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 13,
  },

  recordedTimeColumn: {
    flex: 1,
    alignItems: "center",
  },

  recordedTimeValuePrevious: {
    color: COLORS.muted,
    fontSize: 18,
    fontWeight: "600",
  },

  recordedTimeValueCurrent: {
    color: COLORS.lightGold,
    fontSize: 19,
    fontWeight: "700",
  },

  recordedTimeChange: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 12,
  },

  recordedTimeChangeText: {
    color: COLORS.gold,
    fontSize: 11,
  },

  // ---------------------------------------------------------------------------
  // CLASSIFICATION COMPARISON
  // ---------------------------------------------------------------------------

  comparisonRows: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 12,
  },

  comparisonRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  comparisonLabelContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  classificationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  comparisonLabel: {
    color: COLORS.muted,
    fontSize: 11,
    flexShrink: 1,
  },

  comparisonPrevious: {
    width: 79,
    alignItems: "center",
  },

  comparisonCurrent: {
    width: 79,
    alignItems: "center",
  },

  previousPercent: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
  },

  previousDuration: {
    color: COLORS.subtle,
    fontSize: 10,
    marginTop: 4,
  },

  currentPercent: {
    fontSize: 13,
    fontWeight: "700",
  },

  currentDurationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },

  currentDuration: {
    color: COLORS.subtle,
    fontSize: 10,
  },

  rowDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  insightQuestion: {
    color: COLORS.lightGold,
    fontSize: 11,
    fontStyle: "italic",
    lineHeight: 17,
    marginTop: 12,
    opacity: 0.85,
  },

  // ---------------------------------------------------------------------------
  // NOTABLE SHIFTS
  // ---------------------------------------------------------------------------

  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.goldBorder,
    opacity: 0.6,
  },

  shiftsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 19,
  },

  shiftsList: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 15,
  },

  shiftRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  shiftDotOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  shiftDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  shiftInfo: {
    flex: 1,
    minWidth: 0,
  },

  shiftCategory: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },

  shiftClassification: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 4,
  },

  shiftValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
  },

  shiftValue: {
    fontSize: 12,
    fontWeight: "600",
  },

  // ---------------------------------------------------------------------------
  // INSIGHT
  // ---------------------------------------------------------------------------

  insightContainer: {
    marginHorizontal: 20,
    marginTop: 2,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.goldBackground,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  insightTitle: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.3,
  },

  insightText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 9,
  },

  // ---------------------------------------------------------------------------
  // FOOTER
  // ---------------------------------------------------------------------------

  footerNote: {
    color: COLORS.subtle,
    fontSize: 10,
    lineHeight: 16,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },

  // ---------------------------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------------------------

  emptyPanel: {
    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 23,
    alignItems: "center",
  },

  emptyIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    backgroundColor: COLORS.goldBackground,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 15,
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 9,
  },

  emptyTimeline: {
    width: 120,
    height: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },

  emptyTimelineLine: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.3,
  },

  emptyTimelineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },

  emptyTimelineDotFuture: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
});
