/**
 * Calculate weighted average processing days from reports
 * Weights older reports less, newer reports more
 */
export function calculateWeightedProcessingDays(
  reports: Array<{
    submittedAt: string | Date;
    decisionAt: string | null | Date;
    confidenceScore: number;
  }>
): {
  min: number | null;
  median: number | null;
  max: number | null;
  weighted: number | null;
  count: number;
} {
  const completedReports = reports.filter((r) => r.decisionAt);

  if (completedReports.length === 0) {
    return { min: null, median: null, max: null, weighted: null, count: 0 };
  }

  const days = completedReports
    .map((r) => {
      const start = new Date(r.submittedAt);
      const end = new Date(r.decisionAt!);
      return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    })
    .filter((d) => d >= 0); // Remove negative values

  if (days.length === 0) {
    return { min: null, median: null, max: null, weighted: null, count: 0 };
  }

  const sorted = [...days].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];

  // Calculate weighted average using confidence scores
  let weightedSum = 0;
  let weightSum = 0;
  completedReports.forEach((r, idx) => {
    weightedSum += days[idx] * r.confidenceScore;
    weightSum += r.confidenceScore;
  });
  const weighted = weightSum > 0 ? Math.round(weightedSum / weightSum) : null;

  return {
    min,
    median,
    max,
    weighted,
    count: days.length,
  };
}

/**
 * Format processing days as a human-readable range
 */
export function formatProcessingRange(
  min: number | null,
  max: number | null,
  weighted: number | null
): string {
  if (min === null || max === null) {
    return "No data yet";
  }

  if (min === max) {
    return `~${min} days`;
  }

  // Show weighted average if significantly different from simple average
  if (weighted) {
    return `${min}-${max} days (typically ~${weighted} days)`;
  }

  return `${min}-${max} days`;
}

/**
 * Get confidence label based on score
 */
export function getConfidenceLabel(score: number): string {
  if (score >= 0.9) return "Very High";
  if (score >= 0.75) return "High";
  if (score >= 0.6) return "Moderate";
  if (score >= 0.4) return "Low";
  return "Very Low";
}

/**
 * Get confidence color for UI
 */
export function getConfidenceColor(score: number): string {
  if (score >= 0.9) return "#059669"; // green
  if (score >= 0.75) return "#0891b2"; // cyan
  if (score >= 0.6) return "#d97706"; // amber
  if (score >= 0.4) return "#dc2626"; // red
  return "#7f1d1d"; // dark red
}

/**
 * Calculate percentile
 */
export function getPercentile(arr: number[], percentile: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Categorize data by confidence level for filtering/display
 */
export function categorizeByConfidence(
  reports: Array<{
    confidenceScore: number;
    [key: string]: any;
  }>
): {
  veryHigh: typeof reports;
  high: typeof reports;
  moderate: typeof reports;
  low: typeof reports;
  veryLow: typeof reports;
} {
  return {
    veryHigh: reports.filter((r) => r.confidenceScore >= 0.9),
    high: reports.filter((r) => r.confidenceScore >= 0.75 && r.confidenceScore < 0.9),
    moderate: reports.filter((r) => r.confidenceScore >= 0.6 && r.confidenceScore < 0.75),
    low: reports.filter((r) => r.confidenceScore >= 0.4 && r.confidenceScore < 0.6),
    veryLow: reports.filter((r) => r.confidenceScore < 0.4),
  };
}

/**
 * Calculate weighted statistics based on confidence
 */
export function calculateWeightedStats(
  reports: Array<{
    value: number;
    confidenceScore: number;
  }>
) {
  if (reports.length === 0) {
    return { weighted: 0, unweighted: 0, count: 0 };
  }

  let weightedSum = 0;
  let unweightedSum = 0;
  let weightSum = 0;

  reports.forEach((r) => {
    weightedSum += r.value * r.confidenceScore;
    unweightedSum += r.value;
    weightSum += r.confidenceScore;
  });

  return {
    weighted: Math.round(weightedSum / weightSum),
    unweighted: Math.round(unweightedSum / reports.length),
    count: reports.length,
  };
}
